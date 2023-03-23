#from keras_preprocessing.sequence import pad_sequences
import numpy as np
import tensorflow as tf
from bots.algorithm_bots import CurrBest
from keras import applications
import random
#from data_process import hand2suit_val
PASS = 0
THREE_NT = 16
ARGMAX = 0
TOP2_EV = 1
FOR_GEN =2
class DLCallCls(CurrBest):
    def __init__(self, call_model, random_call=False, weights=-1, name="None"):
        super().__init__(name)
   
        self.random_call = random_call
        self.call_model = call_model
        if weights != -1:
            self.call_model.load_weights(weights)
            print(f"\nfrom {weights} load weights")
        
        # 叫牌資料
        self.call_input = []
        #self.call_pred_history = []

    def reset(self):
        super().reset()
        self.call_input = []
        #self.call_pred_history = []

    def deal_init(self):
        # 拿到牌後初始化各變數
        self.my_hand.sort()
        for i in range(len(self.my_hand)):
            self.card_state[self.my_hand[i]] = 0
            self.suit_stats[self.my_hand[i] // 13] += 1
            self.suit_point[self.my_hand[i] // 13] += self.point_table[12 - self.my_hand[i] % 13]

    def call_card(self, oppo_calls, isshow):

        if oppo_calls != 0:
            mask = np.arange(0, 36, 1)
            mask = np.where((mask != 0) & (mask <= oppo_calls), 0, 1)
            mask[0] = 0 if oppo_calls == -1 else 2

            model_inputs = np.concatenate(
                [self.my_hand, self.suit_point, self.suit_stats, [oppo_calls]], -1)
            my_call_score = self.call_model(model_inputs[:, np.newaxis])

            p = my_call_score + tf.random.normal(my_call_score.shape)*2 if self.random_call else my_call_score
            p = (p*mask)[0].numpy()
            my_call = int(np.random.choice(36, 1, p=p/p.sum()))

            inputs = np.concatenate(
                [self.my_hand, self.suit_point, self.suit_stats, [oppo_calls, my_call]], 0)
            inputs = inputs[np.newaxis, :]

            self.call_input.append(inputs)
            # self.call_pred_history.append(my_call)

            if my_call == 0:
                self.trump = (oppo_calls % 5) * (-1) + 4
                self.banker_contract = (oppo_calls - 1) // 5 + 7
            return my_call

class CallBot_WinRate(CurrBest):
    def __init__(self,call_model=-1, weights=-1, name="None", wr_threshold=6.2, pred_mode=1):
        super().__init__(name)
        
        self.call_ev = None
        self.call_wr_threshold = wr_threshold
        self.pred_mode = pred_mode
        
        self.call_model = call_model
        if weights != -1:
            self.call_model.load_weights(weights)
            print(f"\nfrom {weights} load weights")
            
    def reset(self):
        super().reset()
        self.call_ev = None
        
    def deal_init(self):
        # 拿到牌後初始化各變數
        self.my_hand.sort()
        for i in range(len(self.my_hand)):
            self.card_state[self.my_hand[i]] = 0
            self.suit_stats[self.my_hand[i] // 13] += 1
            self.suit_point[self.my_hand[i] // 13] += self.point_table[12 - self.my_hand[i] % 13]
        
        if self.pred_mode == ARGMAX:
            pred = self.call_model(self.data_preprocessing())
            self.call_ev = np.argmax(pred, -1)
        
        elif self.pred_mode == TOP2_EV:
            pred = self.call_model(self.data_preprocessing())
            top2 = tf.nn.top_k(pred, 2,sorted=False)
            self.call_ev = np.array(top2[1], np.float32)
            self.call_ev = np.sum(top2[0]*self.call_ev, -1) / np.sum(top2[0],-1)
            
        elif self.pred_mode == FOR_GEN:
            self.trump = (self.calling_suit % 5) * (-1) + 4
            self.decraler_contract = (self.calling_suit - 1) // 5 + 7
        
        else:
            raise ValueError("pred_mode error")   

    def data_preprocessing(self):
      
        call_contract = np.reshape(np.arange(1, 16), [15, 1])/5
        
        encode = tf.reduce_sum(tf.one_hot(np.array(self.my_hand), 52,axis=-1), 0)
        suit_num = np.array(self.suit_stats)/13
        
        inputs = np.concatenate([encode, suit_num], -1)#[encode, suit_val/90, suit_num/13, call_contract/5]
        inputs = np.tile(inputs, (15,1))
        inputs = np.concatenate([inputs, call_contract], -1)
         
        return inputs
    
    def call_card(self, oppo_calls, isshow=False):
        if oppo_calls != 0:
            
            mask = np.arange(0, 15, 1)
            call_ev = np.where(mask <= oppo_calls-1, 0, 1) * self.call_ev
            
            if oppo_calls == -1 or max(call_ev) >= self.call_wr_threshold: 
                my_call = int(np.argmax(call_ev))+1
                
                if oppo_calls % 5 == my_call % 5 and oppo_calls != -1:
                    my_call = 0
                    
            else:
                my_call = 0

            if my_call == 0:
                self.trump = (oppo_calls % 5) * (-1) + 4
                self.decraler_contract = (oppo_calls - 1) // 5 + 7
                
            return my_call

class DLChangeBot(CurrBest):
    def __init__(self,is_random_ch=False, name="None"):
        super().__init__(name)
        self.is_random_ch=is_random_ch

        #換牌紀錄
        self.turn_change = -1
        self.change_map = {}
        self.change_data = {}
    def reset(self):
        super().reset()
        #換牌紀錄
        self.turn_change = -1
        self.change_map = {}
        self.change_data = {}
    def deal_init(self): 
        # 拿到牌後初始化各變數
        self.my_hand.sort()
        for i in range(len(self.my_hand)):
            self.card_state[self.my_hand[i]] = 0
            self.suit_stats[self.my_hand[i] // 13] += 1
            self.suit_point[self.my_hand[i] // 13] += self.point_table[12 - self.my_hand[i] % 13]
            self.change_map[self.my_hand[i]] = -1
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
   
    def change_card(self, revealed_card, oppo_card):
        '''
            換牌，先判斷先後手，再呼叫對應的對函式，self.change_first()、self.change_second()來計算要出哪張牌
        '''
        #後手
        if oppo_card != -1:
            my_change = self.change_second(revealed_card, oppo_card)
        ##先手
        else:
            my_change = self.change_first(revealed_card)
        
        if self.is_random_ch :my_change = random.choice(self.can_play(oppo_card))
        
        data = np.array(self.card_state + [self.trump, revealed_card, oppo_card, my_change, -1], dtype=np.float32)
        self.change_data[my_change] = data
        self.turn_change = my_change
        
        self.my_hand.remove(my_change) 
        self.card_state[my_change] = 3
        self.remain_cards[my_change//13].remove(my_change%13)
        
        return my_change
    def dealchange(self, myget, oppoget, oppo_change):
        super().dealchange(myget, oppoget, oppo_change)
        if self.change_map[self.turn_change] == -1:
            self.change_map[self.turn_change] = [self.turn_change]
        else:
            self.change_map[self.turn_change].append(self.turn_change)
            
        self.change_map[myget] = self.change_map[self.turn_change]