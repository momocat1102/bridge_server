import random
import numpy as np
import time
from mk_tree import make_tree
from random_Bot import RandomBot
from bot_beta import  BotBeta
from bot_ev import  BotEV
from bot_org import  BotOrg
from bot_org_akqj import  BotOrg_akqj
from bot_nch import BotOrg_sec_more
from bot_ch_sec import BotChSec
from curr_best import CurrBest
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
        if defensive//13 == trump : # defensive//13 為0-3
            return 0
        else:
            return 1
number_list = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
suit_table = ['黑桃', '紅心', '方塊', '梅花']

def show_card(inputs, mode = None):
    if mode == "call":
        if inputs == 0: return "\033[1;32;1mpass\033[0m"
        call_suit = ['梅花', '方塊', '紅心', '黑桃', '無王']
        contract = (inputs - 1) // 5
        suit = (inputs - 1) % 5 + 1 
        return '\033[1;32;1m' + str(contract+1) + call_suit[suit-1] + '\033[0m'
    else:
        if type(inputs) ==  type(1):
            return f"\033[1;36;1m{suit_table[inputs//13]}{number_list[inputs%13]}\033[0m" 
        else:
            inputs = list(inputs)
            output = ""
            for n in range(len(inputs)):
                i = inputs[n]
                if n == 0 or (i != 0 and i//13 != inputs[n-1]//13):
                    output = output[:-2] + f"\n\033[1;34;1m{suit_table[i//13]}\033[0m: {number_list[i%13]}, "
                else:
                        output += f"{number_list[i%13]}, "
            return output[:-2]

def main(num_of_game, show_history=1):
    trump_table = ['\033[1;35;1m黑桃\033[0m', '\033[1;35;1m紅心\033[0m', '\033[1;35;1m方塊\033[0m', '\033[1;35;1m梅花\033[0m', '\033[1;35;1m無王\033[0m']
    player_1 = CurrBest()
    player_2 = BotChSec()
    p1_total_wins = 0
    p2_total_wins = 0
    p1_round_wins = 0
    p2_round_wins = 0
    p1wins = 0
    p2wins = 0
    his = ""
    for i in range(num_of_game*2):
        if i%2 == 0:
            init_cards = random.sample(range(52), 52)    
            if i%16 == 0: 
                player_1.tree_table.clear()
                player_2.tree_table.clear()
        for first in range(2):
            #  1 --> player_1
            # -1 --> player_2
            process = f"############################## {i//2}-{i%2*2+first+1} #############################\n"
            if i%2 == 0:
                player_1.my_hand = init_cards[0:13]
                player_2.my_hand = init_cards[13:26]
            else:
                player_1.my_hand = init_cards[13:26]
                player_2.my_hand = init_cards[0:13]
            remain_cards = init_cards[26:] 
            
            player_1.deal("init")
            player_2.deal("init")
            
            process += "P1 cards: " + show_card(player_1.my_hand) + "\n\nP2 cards: " + show_card(player_2.my_hand) + '\n'
            process += "############################## 開始叫牌 ##############################\n"
            
            if not first:
                curr_player = 1
                currcall = player_1.call_card(None)
                process += "P1 first call: " + show_card(currcall, "call") + '\n'
            else:
                curr_player = -1
                currcall = player_2.call_card(None)
                process += "P2 first call: " + show_card(currcall, "call") + '\n'
            curr_player *= -1 #換人
#---------------------------------------------叫牌--------------------------------------------------------           
            while currcall != 0:
                if curr_player == 1:
                    currcall = player_1.call_card(currcall)
                    if currcall == 0:
                        player_2.trump = player_1.trump
                        player_2.banker_contract = player_1.banker_contract
                    process += "P1 call: " + show_card(currcall, "call") + '\n'
                else:
                    currcall = player_2.call_card(currcall)
                    if currcall == 0:
                        player_1.trump = player_2.trump
                        player_1.banker_contract = player_2.banker_contract
                    process += "P2 call: " + show_card(currcall, "call") + '\n'
                curr_player *= -1
            banker = curr_player
            
            process += f"Trump: {trump_table[player_2.trump]}\nbanker: {banker}\n"
            if 0 in show_history:
                print(process, end='')
                process = ""
             
            process += "------------------------ 換牌-1 ------------------------\n"
#---------------------------------------------換牌--------------------------------------------------------             
            # 換牌莊家先
            for j in range(13):
                player_1.my_hand.sort()
                player_2.my_hand.sort()
            
                process += f"Trump: {trump_table[player_2.trump]}\n"

                if curr_player == 1:
                    process += "p1 first\nP1 cards: " + show_card(player_1.my_hand).replace("\n", " ") + "\nP2 cards: " + show_card(player_2.my_hand).replace("\n", " ") + f"\n翻開 {show_card(remain_cards[2*j])} 下一張 {show_card(remain_cards[2*j+1])}\n"
                    
                    offensive = player_1.change_card(revealed_card=remain_cards[2*j], oppo_card=-1) #先手:oppo_card = -1
                    defensive = player_2.change_card(revealed_card=remain_cards[2*j], oppo_card=offensive)        
                    process += "p1: " + show_card(offensive) + "\np2: " + show_card(defensive) + '\n'
             
                    if cmp(offensive, defensive, player_1.trump):           #player1 先手贏
                        process += "win: p1\n"
                        player_1.dealchange(remain_cards[2*j  ], remain_cards[2*j+1], defensive)      
                        player_2.dealchange(remain_cards[2*j+1], remain_cards[2*j  ], offensive)
                        
                    else:                                                   #player1 先手輸
                        process += "win: p2\n" 
                        player_1.dealchange(remain_cards[2*j+1], remain_cards[2*j  ], defensive)      
                        player_2.dealchange(remain_cards[2*j  ], remain_cards[2*j+1], offensive)
                        curr_player = -1
                else:
                    process += "p2 first\nP2 cards: " + show_card(player_2.my_hand).replace("\n", " ") + "\nP1 cards: " + show_card(player_1.my_hand).replace("\n", " ") + f"\n翻開 {show_card(remain_cards[2*j])}\n下一張 {show_card(remain_cards[2*j+1])}\n"
                    
                    offensive = player_2.change_card(revealed_card=remain_cards[2*j], oppo_card=-1) #先手:-1
                    defensive = player_1.change_card(revealed_card=remain_cards[2*j], oppo_card=offensive)
                    process += "p2: " + show_card(offensive) + "\np1: " + show_card(defensive) + '\n'
                    
                    if cmp(offensive, defensive, player_1.trump):           #player2 先手贏
                        process += "win: p2\n" 
                        player_2.dealchange(remain_cards[2*j  ], remain_cards[2*j+1], defensive)      
                        player_1.dealchange(remain_cards[2*j+1], remain_cards[2*j  ], offensive)
                        
                    else:                                                   #player2 先手輸
                        process += "win: p1\n"  
                        player_2.dealchange(remain_cards[2*j+1], remain_cards[2*j  ], defensive)      
                        player_1.dealchange(remain_cards[2*j  ], remain_cards[2*j+1], offensive)
                        curr_player = 1
                if j != 12:
                    process += f"------------------------ 換牌-{j+2} ------------------------\n"
#---------------------------------------------換牌結束--------------------------------------------------------         
            if 1 in show_history:
                print(process, end='')
                change_his = process
                process = ""    
            player_1.deal("play")
            player_2.deal("play")
            
            curr_player = banker*-1
            p1_score = 0
            p2_score = 0
            if banker+1:
                process += f"\033[1;31mp1 contract: {player_1.banker_contract}\033[0m\n"
            else:
                process += f"\033[1;31mp2 contract: {player_1.banker_contract}\033[0m\n"
                
            #t = time.time()
#---------------------------------------------打牌--------------------------------------------------------        
            process += "------------------------ 打牌-1 ------------------------\n"
            for k in range(13):
                process += f"p1:p2 = {p1_score}:{p2_score}\n"
                if curr_player == 1:
                    process += f"Trump: {trump_table[player_2.trump]}\n" + "P1 cards: " + show_card(player_1.my_hand).replace("\n", " ") + "\nP2 cards: " + show_card(player_2.my_hand).replace("\n", " ") + '\n'
                    
                    if k == 0:
                        player_1.tree_table.update(make_tree.build_tree(player_1.my_hand, player_2.my_hand, player_1.trump, player_2.tree_table))
                        player_2.tree_table = player_1.tree_table
                        
                    offensive = player_1.play()
                    defensive = player_2.play(offensive)
                    player_1.opponent_hand.remove(defensive)
                    
                    process += "p1 first\n" + "p1: " + show_card(offensive) + "\np2: " + show_card(defensive) + '\n'
                    
                    if cmp(offensive, defensive, player_1.trump):           #player1 先手贏
                        process += "win:p1\n"
                        p1_score += 1
                    else:                                                   #player1 先手輸
                        process += "win:p2\n"
                        p2_score += 1
                        curr_player *= -1
                else:
                    process += f"Trump: {trump_table[player_2.trump]}\n" + "P2 cards: " + show_card(player_2.my_hand).replace("\n", " ") + "\nP1 cards: " + show_card(player_1.my_hand).replace("\n", " ") + '\n'
                    
                    if k == 0:
                        player_2.tree_table.update(make_tree.build_tree(player_2.my_hand, player_1.my_hand, player_1.trump, player_1.tree_table))
                        player_1.tree_table = player_2.tree_table
                        
                    offensive = player_2.play()
                    defensive = player_1.play(offensive)
                    player_2.opponent_hand.remove(defensive)
                    
                    process += "p2 first\n" + "p2: " + show_card(offensive) + "\np1: " + show_card(defensive) + '\n'
                    
                    if cmp(offensive, defensive, player_1.trump):           #player2 先手贏
                        process += "win:p2\n"
                        p2_score += 1
                    else:                                                  #player2 先手輸
                        process += "win:p1\n"
                        p1_score += 1
                        curr_player *= -1
                if k != 12:
                    process += f"------------------------ 打牌-{k+2} ------------------------\n"
            process += f"result: \033[1;33;1m{p1_score}:{p2_score} "
            g_result = ''
            if banker == 1:
                if p1_score >= player_1.banker_contract:
                    g_result += "p1 win"
                    p1wins += 1
                    p1_total_wins += 1
                else:
                    g_result += "p2 win"
                    p2wins += 1
                    p2_total_wins += 1
            else:
                if p2_score >= player_2.banker_contract:
                    g_result += "p2 win"
                    p2wins += 1
                    p2_total_wins += 1
                else:
                    g_result += "p1 win"
                    p1wins += 1
                    p1_total_wins += 1
                    
            player_1.reset()        
            player_2.reset()
            if 2 in show_history:
                print(process, end='')
                print(g_result)
            his += process.replace("\033[1;36;1m", '').replace("\033[1;35;1m", '').replace("\033[1;34;1m", "").replace("\033[1;33;1m", "").replace("\033[0m", "")
            #print("\033[0mcost: " + str(time.time()-t))
            if i % 2 == 1 and first == 1:
                if p1wins > 2:
                    p1_round_wins += 1
                    f = open('his.txt', 'a')
                    f.write(his.replace("\033[1;32;1m", ""))   
                    f.close()     
                if p2wins > 2:
                    p2_round_wins += 1
                    f = open('his.txt', 'a')
                    f.write(his.replace("\033[1;32;1m", ""))
                    f.close()
                his = ""
                print(f"p1:p2 {p1_total_wins}:{p2_total_wins}  {p1_round_wins}:{p2_round_wins}")
                p1wins = 0
                p2wins = 0
            else:
                print(f"p1:p2 {p1_total_wins}:{p2_total_wins}")
                   
if __name__ == '__main__':
    t0 = time.time()
    #from contextlib import redirect_stdout
    #with open('data0.txt', 'w') as f:
    #    with redirect_stdout(f):
    #        print(np.array(data))
    main(num_of_game=1000, show_history=[]) #玩幾輪遊戲，1輪會有4局遊戲，4局是 (交換手牌)x(交換先後手) = 2 x 2 = 4
    print("total cost:", time.time()-t0)
