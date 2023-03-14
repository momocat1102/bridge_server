class BotEV:
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
        my_change = -1
        card_ev = [0 for i in range(13)]
        remain_card_len = [len(self.remain_cards[i]) for i in range(4)]
        # 計算排名 = 當前牌花色總數 - 牌在當前花色的位置 - 1
        revealed_card_rank = remain_card_len[revealed_card//13] - self.remain_cards[revealed_card//13].index(revealed_card%13) - 1
        for i in range(13):
            curr_rank = remain_card_len[self.my_hand[i]//13] - self.remain_cards[self.my_hand[i]//13].index(self.my_hand[i]%13) - 1
            #計算換牌後分數變化
            curr_score = self.point_table[curr_rank]
            revealed_score = self.point_table[revealed_card_rank]
            
            # 是王牌+4分
            if revealed_card // 13 == self.trump:
                revealed_score += 4
            if self.my_hand[i] // 13 == self.trump:
                curr_score += 4
            changed_score = revealed_score - curr_score
            
            # 計算以同花贏的機率
            better_card = 0
            for j in self.remain_cards[self.my_hand[i]//13]:
                if self.my_hand[i]%13 < j:
                    if self.card_state[j + self.my_hand[i]//13 * 13] != 0: 
                        better_card += 1
                    # 牌在對手手上
                    if self.card_state[j + self.my_hand[i]//13 * 13] == 1:
                        j_rank = remain_card_len[self.my_hand[i]//13] - self.remain_cards[self.my_hand[i]//13].index(j) - 1
                        # 只要對手不會虧，就當作對方會搶
                        if j_rank - revealed_card_rank > -1:
                            changed_score = self.point_table[j_rank] - self.point_table[revealed_card_rank]
                            better_card = remain_card_len[self.my_hand[i]//13]
                            break
            win_pr = better_card / remain_card_len[self.my_hand[i]//13]
            card_ev[i] = (1 - win_pr) * changed_score
        my_change = self.my_hand[card_ev.index(max(card_ev))]
        return my_change
    ####################################換牌後手####################################
    def change_second(self, revealed_card, oppo_change):
        deck_suit, deck_num = revealed_card // 13, revealed_card % 13
        opponent_suit, opponent_num = oppo_change // 13, oppo_change % 13
        act = False
        card_rank = len(self.remain_cards[deck_suit]) - self.remain_cards[deck_suit].index(deck_num) - 1
        if(deck_suit == self.trump or card_rank < 1): #翻出王牌
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
        
        self.card_state[myget] = 0
        self.card_state[oppoget] = 1
        
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
