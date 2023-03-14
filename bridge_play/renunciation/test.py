import tensorflow as tf
import keras
import os
import numpy as np
from renunciation.Strategy_Bot import StrategyBot
import make_tree
import random
np.set_printoptions(threshold=np.inf)

def cmp(offensive, defensive, trump):
    if defensive//13 == offensive//13: #同花
        if offensive > defensive:
            return 1
        elif offensive < defensive:
            return 0
        else:
            raise ValueError("There are two same cards!!")
    else:
        if defensive//13 == trump : #defensive//13 為0-3
            return 0
        else:
            return 1
  
def play_game(weights1, weights2):
    num_of_game = 1
    player_1 = StrategyBot(weights1[0])
    player_2 = StrategyBot(weights2[0])
    p1_wintimes = 0
    p1_winscore = 0
    for i in range(num_of_game*2):
        if i%2 == 0:
            init_cards = random.sample(range(52), 52)
            if i%16 == 0: 
                player_1.tree_table.clear()
                player_2.tree_table.clear()
        for first in range(2):
            if i%2 == 0:
                player_1.my_hand = init_cards[0:13]
                player_2.my_hand = init_cards[13:26]
            else:
                player_1.my_hand = init_cards[13:26]
                player_2.my_hand = init_cards[0:13]
            remain_cards = init_cards[26:] 
            
            player_1.deal("init")
            player_2.deal("init")
              
            if not first:
                curr_player = 1
                currcall = player_1.call_card(None)
            else:
                curr_player = -1
                currcall = player_2.call_card(None)
            curr_player *= -1 #換人
#---------------------------------------------叫牌--------------------------------------------------------           
            while currcall != 0:
                if curr_player == 1:
                    currcall = player_1.call_card(currcall)
                    if currcall == 0:
                        player_2.trump = player_1.trump
                        player_2.banker_contract = player_1.banker_contract
                        
                else:
                    currcall = player_2.call_card(currcall)
                    if currcall == 0:
                        player_1.trump = player_2.trump
                        player_1.banker_contract = player_2.banker_contract
                        
                curr_player *= -1
            banker = curr_player
            
#---------------------------------------------換牌--------------------------------------------------------             
            # 換牌莊家先
            for j in range(13):
                player_1.my_hand.sort()
                player_2.my_hand.sort()
                

                if curr_player == 1:
                    
                    offensive = player_1.change_card(current_card=remain_cards[2*j], oppo_card=-1) #先手:oppo_card = -1
                    defensive = player_2.change_card(current_card=remain_cards[2*j], oppo_card=offensive)        
             
                    if cmp(offensive, defensive, player_1.trump):           #player1 先手贏
                        player_1.dealchange(remain_cards[2*j  ], remain_cards[2*j+1], defensive)      
                        player_2.dealchange(remain_cards[2*j+1], remain_cards[2*j  ], offensive)
                        
                    else:                                                   #player1 先手輸
                        player_1.dealchange(remain_cards[2*j+1], remain_cards[2*j  ], defensive)      
                        player_2.dealchange(remain_cards[2*j  ], remain_cards[2*j+1], offensive)
                        curr_player = -1
                else:
                    
                    offensive = player_2.change_card(current_card=remain_cards[2*j], oppo_card=-1) #先手:-1
                    defensive = player_1.change_card(current_card=remain_cards[2*j], oppo_card=offensive)
                    
                    if cmp(offensive, defensive, player_1.trump):           #player2 先手贏
                        player_2.dealchange(remain_cards[2*j  ], remain_cards[2*j+1], defensive)      
                        player_1.dealchange(remain_cards[2*j+1], remain_cards[2*j  ], offensive)
                        
                    else:                                                   #player2 先手輸
                        player_2.dealchange(remain_cards[2*j+1], remain_cards[2*j  ], defensive)      
                        player_1.dealchange(remain_cards[2*j  ], remain_cards[2*j+1], offensive)
                        curr_player = 1
                        
#---------------------------------------------換牌結束--------------------------------------------------------         
            player_1.deal("play")
            player_2.deal("play")
            
            curr_player = banker*-1
#---------------------------------------------打牌--------------------------------------------------------     
            if curr_player == 1:
                player_1.tree_table = make_tree.build_tree(player_1.my_hand, player_2.my_hand, player_1.trump, player_1.tree_table)
                player_2.tree_table = player_1.tree_table
                key = "f:" + str(player_1.my_hand) + "s:" + str(player_2.my_hand) + "t:" + str(player_1.trump)
                p1_score = player_1.tree_table[key][0]
                p2_score = 13-p1_score
            else:
                player_2.tree_table = make_tree.build_tree(player_2.my_hand, player_1.my_hand, player_1.trump, player_2.tree_table)
                player_1.tree_table = player_2.tree_table
                key = "f:" + str(player_2.my_hand) + "s:" + str(player_1.my_hand) + "t:" + str(player_2.trump)
                p2_score = player_2.tree_table[key][0]
                p1_score = 13-p2_score
                 
            if banker == 1:
                if p1_score >= player_1.banker_contract:
                    p1_wintimes += 1
                    p1_winscore += p1_score
            else:
                if p2_score < player_2.banker_contract:
                    p1_wintimes += 1
                    p1_winscore += 13-p2_score
            player_1.reset()        
            player_2.reset()
    p1wr = p1_wintimes/(num_of_game*4)
    p1_wsr = p1_winscore/(13*num_of_game*4)
    p1_loss = tf.reduce_mean(weights1*0) + (1-p1wr) + (1-p1_wsr)
    p2_loss = tf.reduce_mean(weights2*0) + p1wr + p1_wsr
    return p1_loss, p2_loss
class Weight(keras.Model):

    def __init__(self):
        super().__init__()
        self.vars = tf.Variable(tf.random.normal([1,52]) + tf.ones([1,52])*2, True)  
        
    def call(self, inputs, training=False):
        return inputs*self.vars
    
def main():

    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    assert tf.__version__.startswith('2.')
    
    epochs = 6000
    learning_rate = 0.001
    model = Weight()
    model2 = Weight()
    m_optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate*3, beta_1=0.1)
    m2_optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate*3, beta_1=0.1)
    for epoch in range(epochs):
        
        with tf.GradientTape() as tape1, tf.GradientTape() as tape2:
            weight1 = model(tf.ones([1]), training=True)
            weight2 = model2(tf.ones([1]), training=True)
            loss1, loss2 = play_game(weight1, weight2)
            
        m1_gradients = tape1.gradient(loss1, model.trainable_variables)
        m_optimizer.apply_gradients(zip(m1_gradients, model.trainable_variables))
        
        m2_gradients = tape2.gradient(loss2, model2.trainable_variables)
        m2_optimizer.apply_gradients(zip(m2_gradients, model2.trainable_variables))
        
        if epoch % 2 == 0:
            print(epoch, 'loss:1',float(loss1), 'loss2:',float(loss2))
            if epoch % 6 == 0:
                print(weight1[0][24:34])
                print(weight2[0][24:34])
            if epoch % 20 == 0:
                model.save_weights("./save/m1")
                model2.save_weights("./save/m2")
if __name__ == '__main__':
    main()