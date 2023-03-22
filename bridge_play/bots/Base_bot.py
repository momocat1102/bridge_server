from make_tree import make_tree
import random as rd
ON_MYHAND = 0
ON_OPPONENTHAND = 1
UNKNOWN = 2
USED = 3
class BaseBot:
    def __init__(self, name="None"):
        self.name = name
        self.my_hand = []
        self.opponent_hand = []
        self.card_state = [UNKNOWN for i in range(52)]
        self.calling_suit = -1
        self.trump = 0
        self.decraler_contract = 0
        
    def reset(self):
        self.my_hand = []
        self.opponent_hand = []
        self.card_state = [UNKNOWN for i in range(52)]
        self.trump = 0
        self.decraler_contract = 0
        self.calling_suit = -1
        
    def deal_init(self):
        self.my_hand.sort()
        for i in range(len(self.my_hand)):
            self.card_state[self.my_hand[i]] = ON_MYHAND
        self.calling_suit = rd.randint(1, 15) 
     
    def call_card(self, oppo_calls):
        if oppo_calls != 0:
            
            if oppo_calls >= self.calling_suit:
                my_call = 0
                self.trump = (oppo_calls % 5) * (-1) + 4
                self.decraler_contract = (oppo_calls - 1) // 5 + 7
                
            else:
                my_call = self.calling_suit  
 
            return my_call
        
    def change_card(self, revealed_card, oppo_card):
        
        if oppo_card == -1:#先手
            my_change = rd.choice(self.my_hand)
       
        else: #後手
            my_change = rd.choice(self.can_play(oppo_card))
            
        self.my_hand.remove(my_change) 
        self.card_state[my_change] = USED
        
        return my_change
    
    def can_play(self, oppo): #算出可以出什麼
        
        can_play_list = [i for i in self.my_hand if i//13 == oppo//13]
        if len(can_play_list) == 0:
            can_play_list = list(self.my_hand)
        return can_play_list
    
    def dealchange(self, myget, oppoget, oppo_change):
        '''
            myget:       自己得到的牌
            oppoget:     對手得到的牌(若換牌是贏的就不會知道，不知道的話為-1)
            oppo_change: 對手在這次換牌所出的牌
        '''
        self.my_hand.append(myget)
        self.my_hand.sort()
        self.card_state[myget] = ON_MYHAND
        
        if oppoget != -1:
            self.opponent_hand.append(oppoget)
            self.opponent_hand.sort()
            self.card_state[oppoget] = ON_OPPONENTHAND
      
        if oppo_change in self.opponent_hand:
            self.opponent_hand.remove(oppo_change)
                        
        self.card_state[oppo_change] = 3
        
    def deal_play(self):
        
        for i in range(52):
            if self.card_state[i] == UNKNOWN:
                self.opponent_hand.append(i)
        
        self.my_hand.sort()
        self.opponent_hand.sort()
        
    def play(self, oppo_play=-1):
        
        self.opponent_hand.sort()
        self.my_hand.sort()
        
        if oppo_play == -1:#先手
            my_play = rd.choice(self.my_hand)
        
        else:#後手
            my_play = rd.choice(self.can_play(oppo_play))
            self.opponent_hand.remove(oppo_play)
            
        self.my_hand.remove(my_play)
        
        return my_play