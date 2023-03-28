import numpy as np
import time
from make_tree import make_tree as mt
from bots.dl_bots import CallBot_WinRate as CBWR
from bots.algorithm_bots import CurrBest, BotEV, BotAKQJ
import re
import tensorflow as tf
from models import TransFormer, mlp_model
import signal

def init_worker():
    signal.signal(signal.SIGINT, signal.SIG_IGN)

CALL_START = -1
CALL_PASS  = 0
CHANGE_UNKNOW_GET = -1
NO_OPPO_CARD = -1
SHOW_CALL    = 0
SHOW_CHANGE  = 1
SHOW_PLAY    = 2
SHOW_RESULT  = 3
ARGMAX = 0
TOP2_EV = 1

FOR_GEN =2
trump_table = ['\033[1;35;1m黑桃\033[0m', '\033[1;35;1m紅心\033[0m', '\033[1;35;1m方塊\033[0m', '\033[1;35;1m梅花\033[0m', '\033[1;35;1m無王\033[0m']
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
        
def phase_call(curr_player, next_player, isshow):
    currcall = CALL_START
    process = ""
    while currcall != CALL_PASS:
        #紀錄過程
        if isshow: process += curr_player.name + " first" if currcall == CALL_START else curr_player.name
            
        currcall = curr_player.call_card(currcall)
            
        if currcall == CALL_PASS:
            next_player.trump = curr_player.trump
            next_player.decraler_contract = curr_player.decraler_contract
            
        if isshow: process += " call: " + show_card(currcall, "call") + "\n"
            
        curr_player, next_player = next_player, curr_player
    return curr_player, next_player, process

def phase_change(curr_player:CBWR, next_player:CBWR, remain_cards, isshow):
    process = "------------------------ 換牌-1 ------------------------\n" if isshow else ""
    for j in range(13):
        
        curr_player.my_hand.sort()
        next_player.my_hand.sort()
        
        if isshow: process += f"Trump: {trump_table[curr_player.trump]}\n{curr_player.name} first\n{curr_player.name} cards: " + show_card(curr_player.my_hand).replace("\n", " ") + f"\n{next_player.name} cards: " + show_card(next_player.my_hand).replace("\n", " ") + f"\n翻開 {show_card(remain_cards[2*j])} 下一張 {show_card(remain_cards[2*j+1])}\n"
        #雙方出牌
        offensive = curr_player.change_card(revealed_card=remain_cards[2*j], oppo_card=NO_OPPO_CARD) #先手:oppo_card = -1
        defensive = next_player.change_card(revealed_card=remain_cards[2*j], oppo_card=offensive)
        
        if isshow: process += f"{curr_player.name}: " + show_card(offensive) + f"\n{next_player.name}: " + show_card(defensive) + '\n'
        
        #比較輸贏
        if cmp(offensive, defensive, curr_player.trump): #先手贏
            curr_player.dealchange(remain_cards[2*j  ], defensive)      
            next_player.dealchange(remain_cards[2*j+1], offensive)
             
        else:                                                #先手輸
            curr_player.dealchange(remain_cards[2*j+1], defensive)      
            next_player.dealchange(remain_cards[2*j  ], offensive)
            #先後手交換
            curr_player, next_player = next_player, curr_player
            
        if isshow: process += f"win: {curr_player.name}\n"
        if j != 12 and isshow: process += f"------------------------ 換牌-{j+2} ------------------------\n"
    return process 

def phase_play(curr_player:CBWR, next_player:CBWR, isshow):
    
    dummy_name = curr_player.name
    decraler_name = next_player.name
    score = {dummy_name:0, decraler_name:0}
    process = ""

    for i in range(13):
        if isshow: process += f"Trump: {trump_table[curr_player.trump]}\n" + f"{curr_player.name} cards: " + show_card(curr_player.my_hand).replace("\n", " ") + f"\n{next_player.name} cards: " + show_card(next_player.my_hand).replace("\n", " ") + '\n'
        #雙方出牌
        offensive = curr_player.play()   
        defensive = next_player.play(offensive)

        curr_player.opponent_hand.remove(defensive)
        
        if cmp(offensive, defensive, curr_player.trump) == 0:    
            curr_player, next_player = next_player, curr_player#先手輸，先後手交換
            
        score[curr_player.name] += 1
        
        if isshow: process += f"win:{curr_player.name}\n{decraler_name}:{dummy_name} = {score[decraler_name]}:{score[dummy_name]}\n"
        if i != 12 and isshow: process += f"------------------------ 打牌-{i+2} ------------------------\n"
    return score[decraler_name], score[dummy_name], process

def main(player_1:CBWR, player_2:CurrBest, num_of_game:int, show_history=[], save_to_file=[]):
    
    player_1.tree_table = player_2.tree_table
    total_wins = {player_1.name:0, player_2.name:0}
    round_wins = {player_1.name:0, player_2.name:0}
    single_wins = {player_1.name:0, player_2.name:0}
    card_his = dict()
    his = ""
    
    init_cards = np.random.choice(range(52), size=52, replace=False).tolist()
    f = open('game_his_dim.txt', 'w')

    for i in range(num_of_game*2):
        
        process = f"\n############################## {i//2}-{i%2+1} #############################\n"
        if i%40 == 0: 
            player_1.tree_table.clear()
        #初始化牌堆、先後手手牌
        if i%2 == 0:  
            while(tuple(init_cards) in card_his.keys()):
                init_cards = np.random.choice(range(52), size=52, replace=False).tolist()
            card_his[tuple(init_cards)] = True
            curr_player = player_1
            next_player = player_2
        else:
            curr_player = player_2
            next_player = player_1
            
        curr_player.my_hand = init_cards[0:13]
        next_player.my_hand = init_cards[13:26]
        remain_cards = init_cards[26:]  
        # 遊戲前處理
        curr_player.deal_init()
        next_player.deal_init()
        process += f"{curr_player.name} cards: " + show_card(curr_player.my_hand).replace("\n", ' ') + f"\n{next_player.name} cards: " + show_card(next_player.my_hand).replace("\n", ' ') + '\n'       
        #叫牌
        curr_player, next_player, call_history = phase_call(curr_player, next_player,((SHOW_CALL in show_history)or(SHOW_CALL in save_to_file)))
        #決定莊家(decraler)和夢家(dummy)，這邊curr_player剛好會是莊家
        decraler = curr_player
        dummy  = next_player
 
        process += call_history + f"Trump: {trump_table[player_2.trump]}\ndecraler: {decraler.name}\n"
        if SHOW_CALL in save_to_file: his += process
        if SHOW_CALL in show_history: print(process, end='')
        
        # 換牌，換牌莊家先
        process = phase_change(curr_player, next_player, remain_cards, ((SHOW_CHANGE in show_history)or(SHOW_CHANGE in save_to_file)))

        if SHOW_CHANGE in save_to_file: his += process
        if SHOW_CHANGE in show_history: print(process, end='')
        
        # 打牌前處理
        player_1.deal_play()
        player_2.deal_play()
   
        process = f"\033[1;31m{decraler.name} contract: {decraler.decraler_contract}\033[0m\n"
        # 打牌夢家先
        # 打牌
        # decraler_score, dummy_score , play_his = phase_play(dummy, decraler, ((SHOW_PLAY in show_history)or(SHOW_PLAY in save_to_file))) 
        
        # process += play_his + f"\nresult: \033[1;33;1m{decraler.name}:{dummy.name} = {decraler_score}:{dummy_score}\033[0m\n" 
        # if SHOW_PLAY in save_to_file: his += process
        # if SHOW_PLAY in show_history: print(process, end='')
        
        # 直接算分，不執行打牌過程
        dummy_score, decraler_score = mt.mk_tree_score_only(dummy.my_hand, decraler.my_hand, dummy.trump, decraler.tree_table)
        
        # 比較勝負
        winner = decraler if decraler_score - decraler.decraler_contract >= 0 else dummy
        
        # 紀錄比分
        single_wins[winner.name] += 1
        total_wins[winner.name] += 1
        process = winner.name + " win\n"
        
        if SHOW_RESULT in save_to_file: his += process
        if SHOW_RESULT in show_history: print(process, end='')
        
        his = re.compile(r".\[\d.*?m").sub("", his)
        if i%40==1:print(f"{player_1.name}:{player_2.name} {total_wins[player_1.name]}:{total_wins[player_2.name]}", end=" ")
        if i % 2 == 1:
            round_winner = -1
            if single_wins[player_1.name] == 2: round_winner = player_1
            if single_wins[player_2.name] == 2: round_winner = player_2

            if round_winner != -1:  
                round_wins[round_winner.name] += 1
                if save_to_file != []:
                    f.write(his.replace("\033[0m", ""))
                    f.write(f"{single_wins[player_1.name]} {single_wins[player_2.name]}\n")  
            single_wins = {player_1.name:0, player_2.name:0}
            if i%40 == 1: print(f"{round_wins[player_1.name]}:{round_wins[player_2.name]}")
            his = ""
        else:
            if i%40 == 0:print()
                   
        player_1.reset()        
        player_2.reset()
    f.close()
    return total_wins, round_wins
if __name__ == '__main__':
    t0 = time.time()
         
    # SHOW_CALL, SHOW_CHANGE, SHOW_PLAY, SHOW_RESULT
    show_history=[SHOW_CALL,SHOW_RESULT]
    save_to_file=[SHOW_CALL,SHOW_RESULT]
    
    show_history=[]
    save_to_file=[]# ！！！save_to_file目前還未完成，不建議用
    

    #各版本的bot
    classes1 = 5
    classes2 = 10
    calldl_wr       = CBWR(mlp_model(96, (57,1), classes1), f"./save/call_weight_encode_mlp_cls{classes1}.h5", "     calldl_wr", 1.15, TOP2_EV)
    calldl_wr_cls10 = CBWR(mlp_model(96, (57,1), classes2), f"./save/call_weight_encode_mlp_cls{classes2}.h5", "calldl_wrcls10", 2.5, TOP2_EV)
    
    curr_best_top2 = CurrBest("cb_top2", 2)
    akqj           = BotAKQJ("akqj")
    curr_best      = CurrBest("cb_top1")
    ev             = BotEV("Ev")
    # 任選兩個bot進行對戰
    main(calldl_wr, curr_best, num_of_game=4000, show_history=show_history, save_to_file=save_to_file)
