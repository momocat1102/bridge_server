import websocket, threading, json, time, numpy as np
from sample_bot import SampleBot

bot = SampleBot()

class CompetitionSocket(websocket.WebSocketApp):
    server_url = 'ws://127.0.0.1:6671'
    # server_url='ws://163.22.22.143:6671'
    
    def __init__(self, competition_id, player_id):
        self.competition_id=competition_id
        self.player_id = player_id
        # self.token=token
        self.ws=None
        # self.move_event_callback=move_event_callback
        super().__init__(
            url=CompetitionSocket.server_url,
            on_open=self.on_open,
            on_close=self.on_close,
            on_message=self.on_message,
            on_error=self.on_error
            )
        threading.Thread(target=self.run_forever).start()
    
    def on_open(self, ws):
        self.ws=ws
        join={
            "action": "join",
            "data": {
                "source": "player",
                "player_id": self.player_id,
                "competition": self.competition_id
            }
        }
        self.ws.send(json.dumps(join))
        print('OPEN')
    
    def on_close(self, ws):
        try:
            self.ws.close()
        except:
            pass
        self.ws=None
        print("### closed ###")
    
    
    def on_message(self, ws, message):
        print(message)
        data=json.loads(message)
        if 'id' in data and data['id'] == 0: # READY
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 1: # RESET
            bot.reset()
            res={
                'id': data['id'],
                'name': self.player_id,
                'reset': 'success'
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 2: # DEAL
            bot.my_hand = data['data']['hand_card']
            bot.deal_init()
            print(bot.my_hand)
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 3: # CALL
            if data['data']['call'] == 0:
                my_call = bot.call_card(-1)
            else:
                my_call = bot.call_card(data['data']['call'])
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_call': my_call
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 4: # CALL_RESULT
            bot.trump = (data['data']['result'] % 5) * (-1) + 4
            bot.decraler_contract = (data['data']['result'] - 1) // 5 + 7
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 5: # CHANGE_FIRST
            my_change = bot.change_card(revealed_card=data['data']['change_card'], oppo_card=-1)
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_card_for_change': my_change
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 6: # CHANGE_SECOND
            my_change = bot.change_card(revealed_card=data['data']['change_card'], oppo_card=data['data']['opp_card'])
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_card_for_change': my_change
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 7: # CHANGE_RESULT
            bot.dealchange(data['data']['player_get'], data['data']['opp_card'])
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 8: # PLAY_CARD_FIRST
            my_play = bot.play()
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_play': my_play
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 9: # PLAY_CARD_SECOND
            my_play = bot.play(data['data']['opp_play'])
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_play': my_play
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 10: # PLAY_CARD_RESULT
            bot.play_result(data['data']['opp_card'], data['data']['result'])
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 11: # GAME_OVER
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 12: # CHANGE_FINAL
            bot.deal_play()
            res={
                'id': data['id'],
                'name': self.player_id,
                'connect': 'success'
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 13: # TEST
            res={
                'id': data['id'],
                'player_name': self.player_id,
                'connect': 'success'
            }
            ws.send(json.dumps(res))
        elif 'id' in data and data['id'] == 14: # PHASE_AND_PLAYER_STATUS
            # 傳送目前階段及先後手
            res={
                'id': data['id'],
                'player_name': self.player_id,
            }
            ws.send(json.dumps(res))
    
    def on_error(self, ws, error):
        self.ws.close()
        self.ws=None
        print(error)


aaa = CompetitionSocket('test', 'name2')