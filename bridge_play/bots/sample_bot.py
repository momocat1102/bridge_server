import random as rd
class SampleBot:
    def __init__(self, name="None"):
        self.name = name
        self.my_hand = []
        self.calling_suit = -1
        self.trump = 0
        self.decraler_contract = 0
        
    def reset(self):
        self.my_hand = []
        self.trump = 0
        self.decraler_contract = 0
        self.calling_suit = -1
        
    def deal_init(self):
        self.my_hand.sort()
        self.calling_suit = rd.randint(1, 15) 
     
    def call_card(self, oppo_calls):
        if oppo_calls != 0:
            
            if oppo_calls >= self.calling_suit:
                my_call = 0
                #叫牌時的花色排序為梅花->黑桃，但其他時候的花色排序為黑桃->梅花，因此這裡要做轉換
                self.trump = (oppo_calls % 5) * (-1) + 4
                self.banker_contract = (oppo_calls - 1) // 5 + 7
                
            else:
                my_call = self.calling_suit  
 
            return my_call
        
    def change_card(self, revealed_card, oppo_card):
        '''
            revealed_card: 翻出來的牌
            oppo_card:     對手出的牌，若是先手則為-1
            此函式需要回傳要換的牌
        '''
        if oppo_card == -1:
            my_change = rd.choice(self.my_hand)
        else:
            my_change = rd.choice(self.can_play(oppo_card))
            
        self.my_hand.remove(my_change) 
        
        return my_change
    
    def can_play(self, oppo):
        #算出能出的牌有哪些
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
    
      
    def deal_play(self):
        self.my_hand.sort()
        
    def play(self, oppo_play=-1):
        '''
            oppo_play: 對手出的牌，若是先手則為-1
            此函式需要回傳要出的牌
        '''
        self.my_hand.sort()
         
        if oppo_play == -1:#先手
            my_play = rd.choice(self.my_hand)
        
        else:#後手
            my_play = rd.choice(self.can_play(oppo_play))
            
        self.my_hand.remove(my_play)
        
        return my_play      
