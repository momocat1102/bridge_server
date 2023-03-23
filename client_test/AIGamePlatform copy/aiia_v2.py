from bot import BotChSec
#狀態編號
READY = '0 ready'
STATE_CHANGE = '1'
DEAL = '2'
CALL = '3'
CALL_RESULT = '4'
CHANGE_FIRST = '5'
CHANGE_SECOND = '6'
CHANGE_RESULT = '7'
PLAY_FIRST = '8'
PLAY_SECOND = '9'
PLAY_RESULT = '10'
GAME_OVER = '11'
CALL_FIRST = '0'

def phase_call(bot:BotChSec):
    call_end = False
    while(not call_end):
        call_info = input().split()
        if(call_info[0] == CALL):
            #我方先叫的第一次叫牌
            if(call_info[2] == CALL_FIRST):
                my_call = bot.call_card(None)
            else:
                my_call = bot.call_card(int(call_info[2]))
            print('=3 ' + str(my_call))
        #叫牌結果
        elif(call_info[0] == CALL_RESULT):
            call_end = True
            bot.trump = (int(call_info[2]) % 5) * (-1) + 4
            print('=4')
        else:
            print('call errorr')
######################################換牌######################################
def phase_change(bot:BotChSec):
    #用我的手牌更新牌的狀態
    bot.my_hand.sort()
    for turn in range(13):
        change_info = input().split()
        #依照先後手做出不同行動
        if(change_info[0] == CHANGE_FIRST):
            my_change = bot.change_card(revealed_card=int(change_info[2]), oppo_card=-1)
            print('=5 ' + str(my_change))
        elif(change_info[0] == CHANGE_SECOND):
            my_change = bot.change_card(revealed_card=int(change_info[2]), oppo_card=int(change_info[3]))
            print('=6 ' + str(my_change))
        change_result = input().split()
        if(change_result[0] == CHANGE_RESULT):

            bot.dealchange(int(change_result[3]), int(change_result[2]))
            # #判我的輸贏，做不同動作
            # if(change_info[2] != change_result[3]):   #我輸
            #     bot.dealchange(int(change_result[3]), int(change_info[2]), int(change_result[2]))
            # else:
            #     bot.dealchange(int(change_result[3]), -1, int(change_result[2]))
            
######################################打牌######################################
def phase_play(bot:BotChSec):
    for turns in range(13):
        play_info = input().split()
        if(play_info[0] == PLAY_FIRST):
            my_play = bot.play()
            print('=8 ' + str(my_play))
            
            play_result = input().split()
            bot.opponent_hand.remove(int(play_result[2]))
        elif(play_info[0] == PLAY_SECOND):
            my_play = bot.play(int(play_info[2]))
            print('=9 ' + str(my_play))
            
            play_result = input().split()
        #print('=10')

#####################################主程式#####################################
if __name__ == '__main__':
    bot = BotChSec()
    ready = input()
    if(ready == READY):
        print('=0')
    else:
        print('start error')

    deal = input().split()
    if(deal[0] == DEAL):
        bot.my_hand = [int(deal[i + 2]) for i in range(13)]
        bot.deal('init')
        print('=2')
    else:
        print('deal error')

    #發牌後的三階段遊戲
    for phase in range(3):
        phase_info = input().split()
        if(phase_info[0] == STATE_CHANGE):
            print('=1')
            if(phase == 0):
                phase_call(bot)
            elif(phase == 1):
                phase_change(bot)
                bot.deal("play")
            elif(phase == 2):      
                phase_play(bot)
            else:
                print('state changing error' + str(phase))
    #整場遊戲結束，接收成果
    ending_info = input().split()
    if(ending_info[0] == GAME_OVER):
        print('=11')
        #result = int(ending_info[1]) #probably don't need this