from make_tree import make_tree as mt
from bots.Base_bot import BaseBot

ON_MYHAND = 0
ON_OPPONENTHAND = 1
UNKNOWN = 2
USED = 3

class CurrBest(BaseBot):
    def __init__(self, name="None", ch_first_threshold=1):
        super().__init__(name)
        self.trick_table = {6: 1, 7: 1, 8: 2, 9: 2, 10: 3, 11: 3, 12: 3, 13: 4}
        self.point_table = {0: 4, 1: 3, 2: 2, 3: 1, 4: 0.9, 5: 0.8,
                            6: 0.7, 7: 0.6, 8: 0.5, 9: 0.4, 10: 0.3, 11: 0.2, 12: 0.1}
        self.NT_threshold = 21
        
        self.remain_cards = [[i for i in range(13)],         #剩餘的牌(包含自己、對手和牌堆)
                             [i for i in range(13)],
                             [i for i in range(13)],
                             [i for i in range(13)]]
       
        self.tree_table = {}
        self.ch_first_threshold = ch_first_threshold
        # 開局叫牌參考變數
        self.suit_stats = [0, 0, 0, 0]  # 各花色張數
        self.suit_point = [0, 0, 0, 0]  # 各花色點數

        self.max_trick = -1  
        self.calling_suit = -2

    def reset(self):
        super().reset()
        self.remain_cards = [[i for i in range(13)],         #剩餘的牌(包含自己、對手和牌堆)
                             [i for i in range(13)],
                             [i for i in range(13)],
                             [i for i in range(13)]]
        # 開局叫牌參考變數
        self.suit_stats = [0, 0, 0, 0]  # 各花色張數
        self.suit_point = [0, 0, 0, 0]  # 各花色點數

        self.max_trick = -1  
        self.calling_suit = -2

    def deal_init(self):
        # 拿到牌後初始化各變數
        self.my_hand.sort()
        for i in range(len(self.my_hand)):
            self.card_state[self.my_hand[i]] = 0
            self.suit_stats[self.my_hand[i] // 13] += 1
            self.suit_point[self.my_hand[i] // 13] += self.point_table[12 - self.my_hand[i] % 13]
        '''
            這邊先判斷花色有沒有平均
            若花色平均再考慮是否叫無王
            無王的條件是整副牌點力大於NT_threshold才會叫無王，NT_threshold預設是21
            敦數是總點力//10
        '''
        if max(self.suit_stats) <= 4 and min(self.suit_stats) >= 2:
            if(sum(self.suit_point) > self.NT_threshold):
                self.calling_suit = -1
                self.max_trick = sum(self.suit_point) // 10
        '''
            不叫無王
            假如同花色的最大張數 <=5，就只用點力//8來決定要叫的敦數
            否則會加上基礎的敦數(trick_table)
            trick_table = {6:1, 7:1, 8:2, 9:2, 10:3, 11:3, 12:3, 13:4}
        '''
        if self.calling_suit == -2:
            suit_max = max(self.suit_stats)
            self.calling_suit = self.suit_stats.index(suit_max)
            if suit_max <= 5:
                self.max_trick = max(
                    self.suit_point[self.calling_suit] // 8, 1)
            else:
                self.max_trick = self.trick_table[suit_max] + self.suit_point[self.calling_suit] // 8

    def call_card(self, oppo_calls):
        #self.max_trick = 4
        calling_suit_convert = self.calling_suit * (-1) + 4
        if oppo_calls != 0:
            if(oppo_calls == -1):  # 第一次叫牌
                my_call = calling_suit_convert
            else:
                opponent_contract = (oppo_calls - 1) // 5
                opponent_suit = (oppo_calls - 1) % 5 + 1
                if(opponent_suit == 5):
                    self.max_trick = 2
                # 我的花色大
                if(opponent_suit < calling_suit_convert):
                    if(opponent_contract <= self.max_trick):
                        my_call = opponent_contract * 5 + calling_suit_convert
                    else:
                        my_call = 0
                        self.trump = (oppo_calls % 5) * (-1) + 4
                        self.decraler_contract = (oppo_calls - 1) // 5 + 7
                # 我的花色小
                else:
                    if(opponent_contract < self.max_trick):
                        my_call = opponent_contract * 5 + calling_suit_convert + 5
                    else:
                        my_call = 0
                        self.trump = (oppo_calls % 5) * (-1) + 4
                        self.decraler_contract = (oppo_calls - 1) // 5 + 7
            if my_call == 0:
                self.trump = (oppo_calls % 5) * (-1) + 4
                self.decraler_contract = (oppo_calls - 1) // 5 + 7
            return my_call
    def change_card(self, revealed_card, oppo_card):
        '''
            換牌，先判斷先後手，再呼叫對應的對函式，self.change_first()、self.change_second()來計算要出哪張牌
        '''
        #先手
        if oppo_card == -1:
            my_change = self.change_first(revealed_card)
        #後手
        else:
            my_change = self.change_second(revealed_card, oppo_card)
        
        self.my_hand.remove(my_change) 
        self.card_state[my_change] = 3
        self.remain_cards[my_change//13].remove(my_change%13)
        
        return my_change
    def change_first(self, revealed_card):
        '''
            unknown_cards:    未知牌數
            known_oppo_cards: 已知對手手牌數
        '''
        unknown_cards = 0
        known_oppo_cards = 0
        for i in range(52):
            if(self.card_state[i] == 2):
                unknown_cards += 1
            if(self.card_state[i] == 1):
                known_oppo_cards += 1
        '''
            remain_card_len:    計算每個花色剩餘的張數
            revealed_card_rank: 計算翻開的牌在其所屬花色的排名(0是指第一大)
            當翻開的牌是王牌 or 第一大時才會才會決定去搶
        '''
        my_change = -1
        remain_card_len = [len(self.remain_cards[i]) for i in range(4)]
        
        revealed_suit_len = remain_card_len[revealed_card//13]
        revealed_card_index = self.remain_cards[revealed_card//13].index(revealed_card % 13)
        revealed_card_rank = revealed_suit_len-1 - revealed_card_index
        
        if(revealed_card // 13 == self.trump or revealed_card_rank < self.ch_first_threshold):
            '''
                my_bigs:                  找出自己各花色最大數字做為出牌的選擇
                my_bigs_index:            各花色最大數字的index
                oppo_void_PR:             對手缺門機率
                oppo_have_small_trump_PR: 對手有用來王吃的小牌的機率
                win_PR:                   各花色贏對手的機率
                unknown_better_cards:     同花色中未知且更大的牌(和my_bigs比)
                same_suit_unknown:        
            '''
            my_bigs = [-1, -1, -1, -1]
            my_bigs_index = [-1, -1, -1, -1]
            oppo_void_PR = [1, 1, 1, 1]
            oppo_have_small_trump_PR = 1
            win_PR = [1, 1, 1, 1]
            unknown_better_cards = [0, 0, 0, 0]
            same_suit_unknown = [0, 0, 0, 0]
            '''
                找出我各花色最大數字跟其index，但是王牌需要另計，不能也用最大
                若翻開的是王牌，王牌花色就選擇用排名相差1的去搶
                若翻開的非王牌，王牌花色就用排名在倒數前4中最大的去搶
            '''
            for i in range(13):
                rank = remain_card_len[self.my_hand[i]//13]-1 - \
                    self.remain_cards[self.my_hand[i] // 13].index(self.my_hand[i] % 13)
                if(self.my_hand[i] % 13 > my_bigs[self.my_hand[i] // 13]):
                    # 手牌i是王牌
                    if self.my_hand[i] // 13 == self.trump:
                        # 翻開的是王牌
                        if revealed_card // 13 == self.trump:
                            if abs(rank - revealed_card_rank) > 1:
                                continue
                        else:
                            if remain_card_len[self.trump]-1 - rank >= 4:
                                continue
                    # 替換my_bigs
                    my_bigs[self.my_hand[i] // 13] = self.my_hand[i] % 13
                    my_bigs_index[self.my_hand[i] // 13] = i
            # 統計跟我同花且未知的牌
            for i in range(4):
                if(my_bigs_index[i] != -1):  # 我缺門花色不計算
                    for j in range(52):
                        if(self.card_state[j] == 2 and j // 13 == i):
                            # 某張牌跟我同花色且狀態"未知"(給缺門用的資料)
                            same_suit_unknown[i] += 1
                            # 某張牌跟我同花色且更大張且狀態"未知"
                            if(j % 13 > my_bigs[i]):
                                unknown_better_cards[i] += 1
            # 連乘算出我會贏
            for i in range(4):
                if(my_bigs_index[i] != -1):
                    for j in range(unknown_better_cards[i]):
                        win_PR[i] *= (unknown_cards - (13 -
                                      known_oppo_cards) - j) / (unknown_cards - j)
                    for j in range(same_suit_unknown[i]):
                        oppo_void_PR[i] *= (unknown_cards - (13 -
                                            known_oppo_cards) - j) / (unknown_cards - j)
            # 從對手手上的牌排除缺門可能
            for i in range(4):
                for j in range(52):
                    if(self.card_state[j] == 1 and j // 13 == i):
                        oppo_void_PR[i] = 0
            # 統計對手的小王牌(數字小於(不包含)10，用來王吃)
            unknown_small_trumps = 0
            for i in range(52):
                if(self.card_state[i] == 2 and i % 13 < 8 and i // 13 == self.trump):
                    unknown_small_trumps += 1
            for i in range(unknown_small_trumps):
                oppo_have_small_trump_PR *= (unknown_cards -
                                             (13 - known_oppo_cards) - i) / (unknown_cards - i)
            # 勝率要扣除對手缺門且有小王牌的機率
            for i in range(4):
                if(i != self.trump):
                    #print(lack_possibility[i] * oppo_have_small_king_possibility)
                    win_PR[i] -= oppo_void_PR[i] * oppo_have_small_trump_PR
            # 從對手手牌確認他是否有必贏方法
            for i in range(4):
                if(my_bigs[i] != -1):
                    for j in range(52):
                        # 某張牌跟我同花色且更大張且在對手手上
                        if(self.card_state[j] == 1 and j % 13 > my_bigs[i] and j // 13 == i):
                            win_PR[i] = 0
                else:
                    win_PR[i] = 0
            if self.trump != 4:
                win_PR[self.trump] = 0
            my_change = self.my_hand[my_bigs_index[win_PR.index(max(win_PR))]]
    ###################################################################################################################
        # 不搶
        else:
            # 找出我各花色最小數字跟其index
            my_smalls = [13, 13, 13, 13]
            my_smalls_index = [-1, -1, -1, -1]
            # 只考慮我以"同花色"情況下輸對手的機率
            lose_PR = [1, 1, 1, 1]
            same_suit_unknown = [0, 0, 0, 0]
            # 找出我各花色最大數字跟其index
            for i in range(13):
                if(self.my_hand[i] % 13 < my_smalls[self.my_hand[i] // 13]):
                    my_smalls[self.my_hand[i] // 13] = self.my_hand[i] % 13
                    my_smalls_index[self.my_hand[i] // 13] = i
            # 統計同花色"未知"相關
            unknown_worse_cards = [0, 0, 0, 0]
            for i in range(4):
                # 該花色缺門用這個if跳過
                if(my_smalls_index[i] != -1):
                    for j in range(52):
                        if(self.card_state[j] == 2 and j // 13 == i and j % 13 < my_smalls[i]):
                            # 某張牌跟我同花色且更小張且狀態"未知"
                            unknown_worse_cards[i] += 1
            # 連乘算出我會輸
            for i in range(4):
                if(my_smalls_index[i] != -1):
                    for j in range(unknown_worse_cards[i]):
                        lose_PR[i] *= (unknown_cards - (13 -
                                       known_oppo_cards) - j) / (unknown_cards - j)
            # 從對手手牌確認他是否有必輸方法
            for i in range(4):
                if(my_smalls_index[i] != -1):
                    for j in range(52):
                        # 某張牌跟我同花色且更小張且在對手手上
                        if(self.card_state[j] == 1 and j % 13 < my_smalls[i] and j // 13 == i):
                            lose_PR[i] = 0
                else:
                    lose_PR[i] = 0
            try:
                lose_PR[self.trump] = 0
            except:
                pass
            my_change = self.my_hand[my_smalls_index[lose_PR.index(
                max(lose_PR))]]
        return my_change
    ####################################換牌後手####################################
    def change_second(self, revealed_card, oppo_change):
        deck_suit, deck_num = revealed_card // 13, revealed_card % 13
        opponent_suit, opponent_num = oppo_change // 13, oppo_change % 13
        act = False

        remain_card_len = [len(self.remain_cards[i]) for i in range(4)]
        card_rank = remain_card_len[deck_suit] - \
            self.remain_cards[deck_suit].index(deck_num)-1

        revealed_score = self.point_table[card_rank]
        if revealed_card // 13 == self.trump:
            revealed_score += 4

            # 同花色贏過對手
        for i in range(13):
            if(self.my_hand[i] // 13 == opponent_suit and self.my_hand[i] % 13 > opponent_num):
                # 計算換牌後得分
                curr_rank = remain_card_len[self.my_hand[i]//13] - \
                    self.remain_cards[self.my_hand[i] // 13].index(self.my_hand[i] % 13) - 1
                curr_score = self.point_table[curr_rank]
                if self.my_hand[i] // 13 == self.trump:
                    curr_score += 4
                changed_score = revealed_score - curr_score

                if changed_score >= 0:
                    my_change = self.my_hand[i]
                    act = True
                    break

        # 同花色輸給對手
        if(not act):
            for i in range(13):
                if(self.my_hand[i] // 13 == opponent_suit):
                    my_change = self.my_hand[i]
                    act = True
                    break
        # 王吃贏過對手
        if(not act and (card_rank < 1 or deck_suit == self.trump)):
            for i in range(13):
                if(self.my_hand[i] // 13 == self.trump):
                    my_change = self.my_hand[i]
                    act = True
                    break
        # 墊牌墊數字最小
        if(not act):
            tmp = 13
            for i in range(13):
                if(self.my_hand[i] % 13 <= tmp and self.my_hand[i] // 13 != self.trump):
                    my_change = self.my_hand[i]
                    tmp = self.my_hand[i] % 13
                    act = True
        if(not act):
            my_change = self.my_hand[0]
        return my_change
    def play(self, oppo_play=-1):
       
        self.opponent_hand.sort()
        self.my_hand.sort()  
        #先手
        if oppo_play == -1:
            #concat_map 是雙向的字典，可以從index對應到card，也可以從card對應到index，但是index對應到card時key要加100
            #而index代表的是該牌在雙方所有手牌中由小到大的排序
            key, concat_map = mt.get_key_map(self.my_hand, self.opponent_hand, self.trump)
            if key not in self.tree_table.keys():
                mt.mk_tree(self.my_hand, self.opponent_hand, self.trump, self.tree_table)
            
            my_play = concat_map[self.tree_table[key][2]+100]
        #後手
        else:
            key, concat_map = mt.get_key_map(self.opponent_hand, self.my_hand, self.trump)
            if key not in self.tree_table.keys():
                mt.mk_tree(self.opponent_hand, self.my_hand, self.trump, self.tree_table)
            
            my_play = concat_map[self.tree_table[key][3][concat_map[oppo_play]]+100]
            self.opponent_hand.remove(oppo_play)
        self.my_hand.remove(my_play)
        return my_play
class BotEV(CurrBest):    
    def change_first(self, revealed_card):
        my_change = -1
        card_ev = [0] * 13
        remain_card_len = [len(self.remain_cards[i]) for i in range(4)]
        # 計算排名 = 當前牌花色總數 - 牌在當前花色的位置 - 1
        revealed_card_rank = remain_card_len[revealed_card//13] - self.remain_cards[revealed_card//13].index(revealed_card%13) - 1
        
        for i in range(13):
            
            curr_card = self.my_hand[i]
            curr_suit = curr_card // 13
            curr_num = curr_card % 13
            curr_rank = remain_card_len[curr_suit] - self.remain_cards[curr_suit].index(curr_num) - 1
            #計算換牌後分數變化
            curr_score = self.point_table[curr_rank]
            revealed_score = self.point_table[revealed_card_rank]
            
            # 是王牌+4分
            if revealed_card // 13 == self.trump:
                revealed_score += 4
            if curr_card // 13 == self.trump:
                curr_score += 4
                
            changed_score = revealed_score - curr_score
            
            # 計算以同花贏的機率
            better_card = 0
            for j in self.remain_cards[curr_suit]:
                
                if curr_num < j:
                    # 不在自己手上
                    if self.card_state[j + curr_suit*13] != ON_MYHAND:
                        better_card += 1
                        
                    # 牌在對手手上
                    if self.card_state[j + curr_suit*13] == ON_OPPONENTHAND:
                        
                        j_rank = remain_card_len[curr_suit] - self.remain_cards[curr_suit].index(j) - 1

                        # 只要對手不會虧，就當作對方會搶
                        if j_rank - revealed_card_rank >= -1:
                            better_card = remain_card_len[curr_suit]
                            break
            win_pr = 1-(better_card / remain_card_len[curr_suit])
            card_ev[i] = win_pr * changed_score
        my_change = self.my_hand[card_ev.index(max(card_ev))]
        return my_change
    
class BotAKQJ(CurrBest):
    def change_first(self, revealed_card):
        #一定要統計的資料
        unknown_cards = 0    #未知牌數
        known_oppo_cards = 0 #已知對手手牌數
        #統計"未知牌"及"已知對手手牌"數量
        for i in range(52):
            if(self.card_state[i] == 2):
                unknown_cards += 1
            if(self.card_state[i] == 1):
                known_oppo_cards += 1
        my_change = -1
        #要搶(翻出王牌或是該花色前三大)
        if(revealed_card // 13 == self.trump or revealed_card%13 > 8):
            #找出我各花色最大數字跟其index
            my_bigs = [-1, -1, -1 ,-1]
            my_bigs_index = [-1, -1, -1 ,-1]
            #對手缺門機率
            oppo_void_PR = [1, 1, 1, 1]
            #對手有用來王吃的小牌的機率
            oppo_have_small_trump_PR = 1
            #只考慮"我以同花色"情況下贏對手的機率
            win_PR = [1, 1, 1, 1]
            unknown_better_cards = [0, 0, 0, 0]
            same_suit_unknown = [0, 0, 0, 0] 
            #找出我各花色最大數字跟其index
            for i in range(13):
                if(self.my_hand[i] % 13 > my_bigs[self.my_hand[i] // 13]):
                    my_bigs[self.my_hand[i] // 13] = self.my_hand[i] % 13
                    my_bigs_index[self.my_hand[i] // 13] = i
            #統計跟我桐花且未知的牌
            for i in range(4):
                if(my_bigs_index[i] != -1): #我缺門花色不計算
                    for j in range(52):
                        if(self.card_state[j] == 2 and j // 13 == i):
                            #某張牌跟我同花色且狀態"未知"(給缺門用的資料)
                            same_suit_unknown[i] += 1
                            #某張牌跟我同花色且更大張且狀態"未知"
                            if(j % 13 > my_bigs[i]):
                                unknown_better_cards[i] += 1
            #連乘算出我會贏
            for i in range(4):
                if(my_bigs_index[i] != -1):
                    for j in range(unknown_better_cards[i]):
                        win_PR[i] *= (unknown_cards - (13 - known_oppo_cards) - j) / (unknown_cards - j)
                    for j in range(same_suit_unknown[i]):
                        oppo_void_PR[i] *= (unknown_cards - (13 - known_oppo_cards) - i) / (unknown_cards - i)
            #從對手手上的牌排除缺門可能
            for i in range(4):
                for j in range(52):
                    if(self.card_state[j] == 1 and j // 13 == i):
                        oppo_void_PR[i] = 0
            #統計對手的小王牌(數字小於(不包含)10，用來王吃)
            unknown_small_trumps = 0
            for i in range(52):
                if(self.card_state[i] == 2 and i % 13 < 8 and i // 13 == self.trump):
                    unknown_small_trumps += 1
            for i in range(unknown_small_trumps):
                oppo_have_small_trump_PR *= (unknown_cards - (13 - known_oppo_cards) - i) / (unknown_cards - i)
            #勝率要扣除對手缺門且有小王牌的機率
            for i in range(4):
                if(i != self.trump):
                    #print(lack_possibility[i] * oppo_have_small_king_possibility)
                    win_PR[i] -= oppo_void_PR[i] * oppo_have_small_trump_PR
            #從對手手牌確認他是否有必贏方法
            for i in range(4):
                if(my_bigs[i] != -1):
                    for j in range(52):
                        #某張牌跟我同花色且更大張且在對手手上
                        if(self.card_state[j] == 1 and j % 13 > my_bigs[i] and j // 13 == i):
                            win_PR[i] = 0
                else:
                    win_PR[i] = 0
            if self.trump != 4:
                win_PR[self.trump] = 0
            my_change = self.my_hand[my_bigs_index[win_PR.index(max(win_PR))]]
    ###################################################################################################################
        #不搶
        else:
            #找出我各花色最小數字跟其index
            my_smalls = [13, 13, 13, 13]
            my_smalls_index = [-1, -1, -1, -1]
            #只考慮我以"同花色"情況下輸對手的機率
            lose_PR = [1, 1, 1, 1]
            same_suit_unknown = [0, 0, 0, 0]
            #找出我各花色最大數字跟其index
            for i in range(13):
                if(self.my_hand[i] % 13 < my_smalls[self.my_hand[i] // 13]):
                    my_smalls[self.my_hand[i] // 13] = self.my_hand[i] % 13
                    my_smalls_index[self.my_hand[i] // 13] = i
            #統計同花色"未知"相關
            unknown_worse_cards = [0, 0, 0, 0]
            for i in range(4):
                #該花色缺門用這個if跳過
                if(my_smalls_index[i] != -1):
                    for j in range(52):
                        if(self.card_state[j] == 2 and j // 13 == i and j % 13 < my_smalls[i]):
                            #某張牌跟我同花色且更小張且狀態"未知"
                            unknown_worse_cards[i] += 1
            #連乘算出我會輸
            for i in range(4):
                if(my_smalls_index[i] != -1):
                    for j in range(unknown_worse_cards[i]):
                        lose_PR[i] *= (unknown_cards - (13 - known_oppo_cards) - j) / (unknown_cards - j)
            #從對手手牌確認他是否有必輸方法
            for i in range(4):
                if(my_smalls_index[i] != -1):
                    for j in range(52):
                        #某張牌跟我同花色且更小張且在對手手上
                        if(self.card_state[j] == 1 and j % 13 < my_smalls[i] and j // 13 == i):
                            lose_PR[i] = 0
                else:
                    lose_PR[i] = 0
            try:
                lose_PR[self.trump] = 0
            except:
                pass
            my_change = self.my_hand[my_smalls_index[lose_PR.index(max(lose_PR))]]
        return my_change