import random
class StrategyBot:
    def __init__(self, weights=None):
        self.weights        = self.match_weight(weights)
        self.my_hand        = []
        self.opponent_hand  = [] #對手手牌
        #在牌堆或對手手上的牌
        self.out_myhand     = [[i for i in range(13)],
                               [i for i in range(13)],
                               [i for i in range(13)],
                               [i for i in range(13)]]
        self.oppo_same_suit_nums = 0
        self.change_truns    = 0
        self.suit_stats      = [0, 0, 0, 0]
        self.card_state      = [2 for i in range(52)]      #整副牌的狀態(初始化全部為2(未知)):0我的 1對面的(已知) 2未知 3用過
        self.trump           = 0 #王牌
        self.card_point      = [0, 0, 0, 0] #點力
        self.big_card        = 0
        self.max_trick       = -1
        self.banker_contract = 0
        self.tree_table      = dict()
        
    def match_weight(self, weights):
        w = dict()
        w["card_point"] = { 0:float(weights[0]),  1:float(weights[1]),
                            2:float(weights[2]),  3:float(weights[3]),
                            4:float(weights[4]),  5:float(weights[5]),
                            6:float(weights[6]),  7:float(weights[7]),
                            8:float(weights[8]),  9:float(weights[9]),
                           10:float(weights[10]), 11:float(weights[11]),
                           12:float(weights[12])
                          }
        
        w["NT_threshold"]   = [max(int(weights[13]), 6), float(weights[14])]
        w["NT_trick_table"] = { 6:int(weights[15]),  7:int(weights[16]),
                                     8:int(weights[18]),  9:int(weights[19]),
                                    10:int(weights[20]), 11:int(weights[21]),
                                    12:int(weights[22]), 13:int(weights[23])}
        
        w["trick_table"]         = { 0:int(weights[48]),  1:int(weights[49]),
                                     2:int(weights[50]),  3:int(weights[51]),
                                     4:int(weights[24]),  5:int(weights[25]),
                                     6:int(weights[26]),  7:int(weights[27]),
                                     8:int(weights[28]),  9:int(weights[29]),
                                    10:int(weights[30]), 11:int(weights[31]),
                                    12:int(weights[32]), 13:int(weights[33]),
                                   }
        w["oppo_call_table"]     = { 0:int(weights[33]),  1:int(weights[34]),
                                     2:int(weights[35]),  3:int(weights[36]),
                                     4:int(weights[37]),  5:int(weights[38]),
                                     6:int(weights[39])
                                   }
        #w["drop_card_table"]     = { 0:int(weights[18]),  1:int(weights[19]),
        #                             2:int(weights[20]),  3:int(weights[21]),
        #                             4:int(weights[20]),  5:int(weights[21]),
        #                             6:int(weights[22])
        #                           }
        w["NT_compensate"]       = float(weights[40])
        w["w_of_same_suit"]      = float(weights[41])
        w["w_of_point"]          = float(weights[42])
        w["w_of_prl"]            = float(weights[43])
        w["trump_score"]         = float(weights[44])
        w["w_of_oppo_gain"]      = float(weights[45])
        w["bad_card_threshold"]  = float(weights[46])
        w["t_change_t"]          = int(weights[47])
        
        return w
    
    def reset(self):
        self.my_hand        = []
        self.opponent_hand  = [] #對手手牌
        #在牌堆或對手手上的牌
        self.out_myhand     = [[i for i in range(13)],
                               [i for i in range(13)],
                               [i for i in range(13)],
                               [i for i in range(13)]]
        self.oppo_same_suit_nums = 0
        self.change_truns    = 0
        self.suit_stats      = [0, 0, 0, 0]
        self.card_state      = [2 for i in range(52)]      #整副牌的狀態(初始化全部為2(未知)):0我的 1對面的(已知) 2未知 3用過
        self.trump           = 0 #王牌
        self.card_point      = [0, 0, 0, 0] #點力
        self.big_card        = 0
        self.max_trick       = -1
        self.banker_contract = 0
        self.tree_table      = dict()
    def deal(self, mode): 
        if mode == "init":
            self.my_hand.sort()
            #處理手牌資訊
            for card in self.my_hand:
                self.card_state[card] = 0
                self.suit_stats[card // 13] += 1
                self.out_myhand[card // 13].remove(card % 13)
                #算點力 
                self.card_point[card//13] += self.weights["card_point"][12 - card%13]
                if card % 13 > 8:
                    self.big_card += 1
            #看花色有沒有平均
            suit_tmp = list(self.suit_stats)
            suit_tmp.sort()
            balanced = False
            if(suit_tmp == [2, 3, 4, 4] or suit_tmp == [3, 3, 3, 4]):
                balanced = True
            #看看要不要叫無王
            
            if(self.big_card > self.weights['NT_threshold'][0] and sum(self.card_point) > self.weights['NT_threshold'][1] and balanced):
                self.calling_suit = -1
                self.max_trick = max(self.weights["NT_trick_table"][self.big_card], 1)
            else:
                maxscore = 0
                max_suit = 0
                for i in range(4):
                    score = self.weights["w_of_same_suit"]*self.suit_stats[i] + self.weights["w_of_point"]*self.card_point[i]
                    if score > maxscore:
                        maxscore = score
                        max_suit = i
                self.calling_suit = max_suit
                self.max_trick = max(self.weights["trick_table"][self.suit_stats[max_suit]], 1) 
                
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
                
                self.oppo_same_suit_nums = max(self.weights["oppo_call_table"][opponent_contract], 1)
                       
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
                        self.banker_contract = opponent_contract + 7
            return my_call
        
    def change_card(self, current_card, oppo_card):
        #計算當前牌的價值
        score = 0
        card_rank = self.out_myhand[current_card//13].index(current_card%13)
        #點力
        curr_point = self.weights["card_point"][len(self.out_myhand[current_card//13])-1 - card_rank]
        if current_card//13 == self.trump:  #王牌加分
            curr_point += self.weights["trump_score"]
            
        score += curr_point
        if self.trump == 4:
            score += self.weights["NT_compensate"] #無王補償
        
        lt = 0
        unknow = 0
        hand_detail = [[], [], [], []]
        oppo_detail = [[], [], [], []]
        self.card_point = [0, 0, 0, 0]
        for i in range(52):
            if self.card_state[i] == 2:
                lt += self.cmp(current_card, i)
                unknow += 1
            if self.card_state[i] == 0:
                hand_detail[i//13].append(i%13)
                self.suit_stats[i//13] += 1
            if self.card_state[i] == 1:
                oppo_detail[i//13].append(i%13)
        #下一張比翻開好的機率x權重
        score += (lt/unknow) * self.weights["w_of_prl"]      
        my_play = -1
        if oppo_card != -1: #後手
            oppo_card_rank = self.out_myhand[oppo_card//13].index(oppo_card%13)
            oppo_point = self.weights["card_point"][len(self.out_myhand[oppo_card//13])-1 - oppo_card_rank]
            if oppo_card//13 == self.trump:  #王牌加分
                oppo_point += self.weights["trump_score"]
            score += (curr_point - oppo_point) * self.weights["w_of_oppo_gain"]
                
            if score > 60:#當分數大於60就搶
                if len(hand_detail[oppo_card//13] > 0):
                    for i in hand_detail[oppo_card//13]:
                        if i > oppo_card%13:
                            my_play = i + oppo_card//13 * 13
                            break
                    if my_play == -1:
                        my_play = hand_detail[oppo_card//13][0] + oppo_card//13 * 13
                else:
                    if oppo_card//13 != self.trump:
                        if current_card//13 == self.trump:
                            tmp = self.out_myhand[self.trump] + hand_detail[self.trump]
                            tmp.sort()
                            if tmp.index(current_card%13) - tmp.index(hand_detail[self.trump][0]) > self.weights["t_change_t"]:
                                my_play = hand_detail[self.trump][0] + self.trump*13
                    else:
                        min = 13
                        for i in range(4):
                            if self.suit_stats[i] != 0:
                                curr = hand_detail[i][0]
                                if curr < min:
                                    min = curr
                                    my_play = curr + i*13
            elif score < self.weights["bad_card_threshold"]:   #爛牌
                if len(hand_detail[oppo_card//13]) > 0:
                    for i in hand_detail[oppo_card//13]:
                        if i < oppo_card%13:
                            my_play = i + oppo_card - oppo_card%13
                            break
                    if my_play == -1:
                        my_play = hand_detail[oppo_card//13][0] + oppo_card//13 * 13          
                else:
                    min = 13
                    for i in range(4):
                        if i != self.trump and i != oppo_card//13 and self.suit_stats[i] != 0 and len(hand_detail[i]) > 0:
                            
                            curr = hand_detail[i][0]
                            if curr < min:
                                min = curr
                                my_play = curr + i*13
            if my_play == -1:
                if len(hand_detail[oppo_card//13]) > 0:
                    my_play = hand_detail[oppo_card//13][0] + oppo_card//13 * 13 
                else:
                    tmp_stats = (self.suit_stats)
                    tmp_stats.sort()
                    min = 13
                    for i in range(len(tmp_stats)):
                        i = self.suit_stats.index(tmp_stats[i])
                        if i != self.trump and self.suit_stats[i] != 0 and len(hand_detail[i]) > 0:
                            if hand_detail[i][0] < 8:
                                my_play = hand_detail[i][0] + i*13
                                break
                            curr = hand_detail[i][0]
                            if curr < min:
                                min = curr
                                my_play = curr + i*13
        else: #先手
            
            if score > 60:#當分數大於60就搶
                for i in range(4):
                    if i != self.trump:
                        if len(oppo_card[i]) != 0 and len(hand_detail[i]) != 0:
                            for j in hand_detail[i]:
                                if j > oppo_detail[i][-1]:
                                    my_play = j + i*13
                                
            elif score < self.weights["bad_card_threshold"]:   #爛牌
                for i in range(4):
                    if i != self.trump:
                        if len(oppo_detail[i]) != 0:
                            for j in hand_detail[i]:
                                if j < oppo_detail[i][0]:
                                    my_play = j + i*13  
                        else:
                            if len(hand_detail[i]) > 0: 
                                my_play = hand_detail[i][0] + i*13
            if my_play == -1:
                tmp_stats = (self.suit_stats)
                tmp_stats.sort()
                min = 13
                for i in range(len(tmp_stats)):
                    i = self.suit_stats.index(tmp_stats[i])
                    if i != self.trump and self.suit_stats[i] != 0 and len(hand_detail[i]) > 0:
                        if hand_detail[i][0] < 8:
                            my_play = hand_detail[i][0] + i*13
                            break
                        curr = hand_detail[i][0]
                        if curr < min:
                            min = curr
                            my_play = curr + i*13     
        self.my_hand.remove(my_play)
        self.card_state[my_play] = 3
        self.change_truns += 1
        return my_play
    
    def dealchange(self, myget, oppoget, oppo_card):
        self.my_hand.append(myget)
        self.opponent_hand.append(oppoget)
        
        self.my_hand.sort()
        self.opponent_hand.sort()
        
        self.card_state[myget] = 0
        self.card_state[oppoget] = 1
        
        if oppo_card in self.opponent_hand:
            self.opponent_hand.remove(oppo_card)
            
        self.out_myhand[myget // 13].remove(myget % 13)
        self.out_myhand[oppo_card//13].remove(oppo_card%13)
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
    def cmp(self, curr, x):
        
        if curr//13 == x//13: #同花
            if x > curr:
                return 1
            else:
                return 0
        else:
            if curr//13 == self.trump:
                return 0
            elif x//13 == self.trump:
                return 1
            elif x%13 > curr%13:
                return 1
            else:
                return 0