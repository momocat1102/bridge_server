import random as rd

PASS = 0
CHANGE_FIRST = -1
PLAY_FIRST = -1
class SampleBot:
    '''
        這是一個簡單的範例bot，只會隨機叫牌、換牌和打牌
        你可以任意增加變數或函式，但請不要更動已經存在的函式名稱和參數
    '''
    def __init__(self, name="None"):
        self.name = name  # 玩家名稱
        self.my_hand = [] # 玩家手牌
        self.calling_suit = -1 # 叫牌花色
        self.trump = 0 # 王牌
        self.decraler_contract = 0 # 合約數
        
    def reset(self):
        self.my_hand = []
        self.trump = 0
        self.decraler_contract = 0
        self.calling_suit = -1
        
    
    def deal_init(self):
        '''
            玩家會收到自己的手牌，此時自己的手牌已知，因此可以去算牌力或是決定要叫什麼牌等等
        '''
        self.my_hand.sort()
        self.calling_suit = rd.randint(1, 15) # 目前是從1梅花到3無王隨機選擇一個
    # 叫牌
    def call_card(self, oppo_calls):
        """
            oppo_calls: 對手叫的牌，若自己是先手則為-1, 0為PASS
            會一直呼叫直到某一方到PASS為止
            請注意，叫牌只能越叫越大，請不要回傳比對手叫的牌小的數字
        """
        if oppo_calls != PASS:
            # 對手比自己叫大或一樣，PASS
            if oppo_calls >= self.calling_suit:
                my_call = PASS
                # 叫牌時的花色排序為梅花->黑桃，但其他時候的花色排序為黑桃->梅花，因此這裡要做轉換
                # self.trump = (oppo_calls % 5) * (-1) + 4
                self.decraler_contract = (oppo_calls - 1) // 5 + 7
                
            else:
                my_call = self.calling_suit  
 
            return my_call
        
    # 換牌
    def change_card(self, revealed_card, oppo_card):
        '''
            revealed_card: 翻出來的牌
            oppo_card:     對手出的牌，若是先手則為-1
            此函式需要回傳要換的牌
        '''
        # 自己先手
        if oppo_card == -1:
            my_change = rd.choice(self.my_hand)
        # 對手先手
        else:
            my_change = rd.choice(self.can_play(oppo_card))
            
        # 將換掉的牌從手牌中移除
        self.my_hand.remove(my_change) 
        
        return my_change

    def can_play(self, oppo):
        #算出能出的牌有哪些
        can_play_list = [i for i in self.my_hand if i//13 == oppo//13]
        
        if len(can_play_list) == 0:
            can_play_list = list(self.my_hand)
            
        return can_play_list
    
    def dealchange(self, myget, oppo_change):  
        '''
            myget:       自己得到的牌
            oppo_change: 對手在這次換牌所出的牌
            oppoget:     對手得到的牌(若換牌是贏的就不會知道，不知道的話為-1)
            這邊在每次換牌後會呼叫，可以知道換牌後的結果，並更新自己的參數、狀態
        '''
        self.my_hand.append(myget)
        self.my_hand.sort()
    
      
    def deal_play(self):
        """
            進行打牌前的處理
        """
        self.my_hand.sort()
        
    def play(self, oppo_play=-1):
        '''
            oppo_play: 對手出的牌，若是先手則為-1
            此函式需要回傳要出的牌
        '''
        self.my_hand.sort()
        #先手 
        if oppo_play == PLAY_FIRST:
            my_play = rd.choice(self.my_hand)
        #後手
        else:
            my_play = rd.choice(self.can_play(oppo_play))
            
        # 將出掉的牌從手牌中移除   
        self.my_hand.remove(my_play)
        
        return my_play
    def play_result(self, oppo_play, result):
        '''
            oppo_play: 剛才對手出的牌
            result:    這一輪的結果，0為輸，1為贏
            這邊在每次打牌後會呼叫，可以知道打牌後的結果和對手出的牌，因為如果自己是先手，不會知道對手出的牌
        '''
        print(result)
