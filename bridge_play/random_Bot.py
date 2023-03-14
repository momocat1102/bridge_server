import random
class RandomBot:
    def __init__(self):
        self.my_hand = []
        self.trick_table = {4:1, 5:2, 6:2, 7:2, 8:3, 9:3, 10:4, 11:4, 12:5, 13:5}

        #開局叫牌參考變數
        self.suit_stats = [0, 0, 0, 0]
        self.card_state = [2 for i in range(52)]             #整副牌的狀態(初始化全部為2(未知)):0我的 1對面的(已知) 2未知 3用過
        self.trump = 0                                       #王牌
        self.deck_remain = 26                                #中間牌堆剩餘數量
        self.card_point = 0                                  #叫牌前點力
        self.big_card = 0
        self.max_trick = -1
        self.history = []
        self.history_pred = []
        self.opponent_hand = []                              #對手手牌
        self.no_king_threshold = {'amount':8, 'points':21}  
        self.banker_contract = 0
        self.tree_table = dict()
    def reset(self):
        
        self.my_hand = []
        self.suit_stats = [0, 0, 0, 0]
        self.card_state = [2 for i in range(52)]             #整副牌的狀態(初始化全部為2(未知)):0我的 1對面的(已知) 2未知 3用過
        self.trump = 0                                       #王牌
        self.deck_remain = 26                                #中間牌堆剩餘數量
        self.card_point = 0                                  #叫牌前點力
        self.big_card = 0
        self.max_trick = -1
        self.history = []
        self.oppo_call_history = []
        self.history_pred = []
        self.opponent_hand = []                              #對手手牌 
        self.banker_contract = 0
        #self.tree_table = dict()
        
    def deal(self, mode): 
        if mode == "init":
            self.my_hand.sort()
            for i in range(len(self.my_hand)):
                self.card_state[self.my_hand[i]] = 0
                self.suit_stats[self.my_hand[i] // 13] += 1
            #看花色有沒有平均
            suit_tmp = list(self.suit_stats)
            suit_tmp.sort()
            balanced = False
            if(suit_tmp == [2, 3, 4, 4] or suit_tmp == [3, 3, 3, 4]):
                balanced = True
            #算點力
            for i in range(13):
                if(self.my_hand[i] % 13 > 8):
                    self.card_point += self.my_hand[i] % 13 - 8
                    self.big_card += 1
            #看看要不要叫無王
            
            if((self.big_card > self.no_king_threshold['amount'] and self.card_point > self.no_king_threshold['points']) and (balanced)):
                self.calling_suit = -1
                self.max_trick = 2
            else:
                self.calling_suit = self.suit_stats.index(max(self.suit_stats))
                self.max_trick = self.trick_table[max(self.suit_stats)] 
        elif mode == "play":
            self.my_hand.sort()
            for i in range(52):
                if(self.card_state[i] == 2):
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
        
    def change_card(self, revealed_card, oppo_card):
        #後手
        if oppo_card != -1:
            valid_cards = self.can_play(oppo_card)
            my_play = random.choice(valid_cards)
        #先手
        else:
            my_play = random.choice(self.my_hand)
        self.my_hand.remove(my_play)
        self.card_state[my_play] = 3
        return my_play
    
    def dealchange(self, myget, oppoget, oppo_card):
        self.my_hand.append(myget)
        self.opponent_hand.append(oppoget)
        self.my_hand.sort()
        self.opponent_hand.sort()
        # print("p1:")
        # print("get", myget, oppoget)
        # print("card_state_bf", self.card_state[myget], self.card_state[oppoget])
        self.card_state[myget] = 0
        self.card_state[oppoget] = 1
        # print("card_state_af", self.card_state[myget], self.card_state[oppoget])
        
        if oppo_card in self.opponent_hand:
            self.opponent_hand.remove(oppo_card)
        self.card_state[oppo_card] = 3
        
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
