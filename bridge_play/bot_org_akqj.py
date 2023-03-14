class BotOrg_akqj:
    def __init__(self):
        self.trick_table = {6:1, 7:2, 8:2, 9:3, 10:4, 11:4, 12:5, 13:5}
        self.point_table = {0:4, 1:3, 2:2, 3:1, 4:0.9, 5:0.8, 6:0.7, 7:0.6, 8:0.5, 9:0.4, 10:0.3, 11:0.2, 12:0.1}
        self.no_king_threshold = {'amount':8, 'points':21}  
        self.tree_table = dict()
        
        self.my_hand = []
        self.remain_cards = [[i for i in range(13)],
                             [i for i in range(13)],
                             [i for i in range(13)],
                             [i for i in range(13)]]
        #開局叫牌參考變數
        self.suit_stats = [0, 0, 0, 0]
        self.suit_point = [0, 0, 0, 0]
        self.card_state = [2 for i in range(52)]             #整副牌的狀態(初始化全部為2(未知)):0我的 1對面的(已知) 2未知 3用過
        self.calling_suit = -2
        self.trump = 0                                       #王牌
        self.deck_remain = 26                                #中間牌堆剩餘數量
        self.card_point = 0                                  #叫牌前點力
        self.big_card = 0
        self.max_trick = -1
        self.history = []
        self.opponent_hand = []                              #對手手牌
        self.banker_contract = 0
    def reset(self):
        self.my_hand = []
        self.remain_cards = [[i for i in range(13)],
                             [i for i in range(13)],
                             [i for i in range(13)],
                             [i for i in range(13)]]
        #開局叫牌參考變數
        self.suit_stats = [0, 0, 0, 0]
        self.suit_point = [0, 0, 0, 0]
        self.card_state = [2 for i in range(52)]             #整副牌的狀態(初始化全部為2(未知)):0我的 1對面的(已知) 2未知 3用過
        self.calling_suit = -2
        self.trump = 0                                       #王牌
        self.deck_remain = 26                                #中間牌堆剩餘數量
        self.card_point = 0                                  #叫牌前點力
        self.big_card = 0
        self.max_trick = -1
        self.history = []
        self.opponent_hand = []                              #對手手牌
        self.banker_contract = 0     
        
    def deal(self, mode): 
        if mode == "init":
            self.my_hand.sort()
            for i in range(len(self.my_hand)):
                self.card_state[self.my_hand[i]] = 0
                self.suit_stats[self.my_hand[i] // 13] += 1
                self.suit_point[self.my_hand[i] // 13] += self.point_table[12 - self.my_hand[i] % 13]
                if self.my_hand[i] % 13 > 8:
                    self.big_card += 1
            #看花色有沒有平均
            suit_tmp = list(self.suit_stats)
            suit_tmp.sort()
            balanced = False
            if(suit_tmp == [2, 3, 4, 4] or suit_tmp == [3, 3, 3, 4]):
                balanced = True
                
            #看看要不要叫無王
            if((self.big_card > self.no_king_threshold['amount'] and self.card_point > self.no_king_threshold['points']) and (balanced)):
                self.calling_suit = -1
                self.max_trick = sum(self.suit_point) // 8
            else:
                suit_max = max(self.suit_stats)
                self.calling_suit = self.suit_stats.index(suit_max)
                if suit_max <= 5:
                    self.max_trick = self.suit_point[self.calling_suit] // 8
                else:
                    self.max_trick = self.trick_table[suit_max]
        elif mode == "play":
            self.my_hand.sort()
            for i in range(52):
                if self.card_state[i] == 2:
                    self.opponent_hand.append(i)
            self.opponent_hand.sort()
        else:
            raise ValueError("The phase \" " + mode + " \" Not Exist")
        
    def call_card(self, oppo_calls):
        calling_suit_convert = self.calling_suit * (-1) + 4
        if oppo_calls != 0:
            if(oppo_calls == None): #第一次叫牌
                my_call = calling_suit_convert
            else:
                opponent_contract = (oppo_calls - 1) // 5
                opponent_suit = (oppo_calls - 1) % 5 + 1        
                if(opponent_suit == 5):
                    self.max_trick = 2
                if(opponent_suit < calling_suit_convert):#我的花色大
                    if(opponent_contract <= self.max_trick):
                        my_call = opponent_contract * 5 + calling_suit_convert
                    else:
                        my_call = 0
                        self.trump = (oppo_calls % 5) * (-1) + 4
                        self.banker_contract = (oppo_calls - 1) // 5 + 7
                else:                            #我的花色小
                    if(opponent_contract < self.max_trick):
                        my_call = opponent_contract * 5 + calling_suit_convert + 5
                    else:
                        my_call = 0
                        self.trump = (oppo_calls % 5) * (-1) + 4
                        self.banker_contract = (oppo_calls - 1) // 5 + 7
            return my_call
        
    
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
    ####################################換牌後手####################################
    def change_second(self, revealed_card, oppo_change):
        deck_suit, deck_num = revealed_card // 13, revealed_card % 13
        opponent_suit, opponent_num = oppo_change // 13, oppo_change % 13
        act = False
        if(deck_suit == self.trump or revealed_card%13 > 8): #翻出王牌
            #同花色贏過對手
            for i in range(13):
                if(self.my_hand[i] // 13 == opponent_suit and self.my_hand[i] % 13 > opponent_num):
                    my_change = self.my_hand[i]
                    act = True
                    break
            #同花色輸給對手
            if(not act):
                for i in range(13):
                    if(self.my_hand[i] // 13 == opponent_suit):
                        my_change = self.my_hand[i]
                        act = True
                        break
            #王吃贏過對手
            if(not act):
                for i in range(13):
                    if(self.my_hand[i] // 13 == self.trump):
                        my_change = self.my_hand[i]
                        act = True
                        break
            #墊牌墊數字最小
            if(not act):
                tmp = 13
                for i in range(13):
                    if(self.my_hand[i] % 13 <= tmp):
                        my_change = self.my_hand[i]
                        tmp = self.my_hand[i] % 13
        else:
            for i in range(13):
                if(self.my_hand[i] // 13 == opponent_suit):
                    my_change = self.my_hand[i]
                    act = True
                    break
            if(not act):
                tmp = 13
                for i in range(13):
                    if(self.my_hand[i] % 13 <= tmp and self.my_hand[i] // 13 != self.trump):
                        my_change = self.my_hand[i]
                        tmp = self.my_hand[i] % 13
            if(not act):
                my_change = self.my_hand[0]
        return my_change
        
    def change_card(self, revealed_card, oppo_card):
        #後手
        if oppo_card != -1:
            valid_cards = self.can_play(oppo_card)
            my_change = self.change_second(revealed_card, oppo_card)
        #先手
        else:
            my_change = self.change_first(revealed_card)
        self.my_hand.remove(my_change) 
        self.card_state[my_change] = 3
        self.remain_cards[my_change//13].remove(my_change%13)
        
        return my_change
    
    def dealchange(self, myget, oppoget, oppo_change):
        self.my_hand.append(myget)
        self.opponent_hand.append(oppoget)
        self.my_hand.sort()
        self.opponent_hand.sort()
        # print("p2:")
        # print("get", myget, oppoget)
        # print("card_state_bf", self.card_state[myget], self.card_state[oppoget])
        self.card_state[myget] = 0
        self.card_state[oppoget] = 1
        # print("card_state_af", self.card_state[myget], self.card_state[oppoget])
        
        if oppo_change in self.opponent_hand:
            self.opponent_hand.remove(oppo_change)
        self.card_state[oppo_change] = 3
        self.remain_cards[oppo_change//13].remove(oppo_change%13)
        
    def can_play(self, oppo): #算出可以出什麼
        can_play_list = list()
        for defensive in self.my_hand:
            if defensive//13 == oppo//13:
                can_play_list.append(defensive)

        if len(can_play_list) == 0:
            can_play_list = list(self.my_hand)

        return can_play_list

####################################打牌####################################   
    def play(self, oppo_play=-1):
        self.opponent_hand.sort()
        self.my_hand.sort()
        if oppo_play == -1:
            key = "f:" + str(self.my_hand) + "s:" + str(self.opponent_hand) + "t:" + str(self.trump)
            my_play = self.tree_table[key][2]
        else:
            key = "f:" + str(self.opponent_hand) + "s:" + str(self.my_hand) + "t:" + str(self.trump)
            my_play = self.tree_table[key][3][oppo_play]
            self.opponent_hand.remove(oppo_play)
        self.my_hand.remove(my_play)
        return my_play
