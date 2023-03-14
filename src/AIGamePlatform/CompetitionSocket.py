import websocket, threading, json, numpy as np

class CompetitionSocket(websocket.WebSocketApp):
    server_url='ws://163.22.21.143:8082'
    # server_url='ws://10.21.23.46:8080'
    # server_url='ws://10.21.23.172:8080'
    
    def __init__(self, competition_id, token, move_event_callback):
        self.competition_id=competition_id
        self.token=token
        self.ws=None
        self.move_event_callback=move_event_callback
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
                "token": self.token,
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
        data=json.loads(message)
        if data['id']==3: # game_id
            opcal=data['content']
            res={
                'id': data['id'],
                'content': self.cards[0]
            }
            ws.send(json.dumps(res))
        elif data['action']=='invalid_email':
            print('join fail: invalid email.')
        elif data['action']=='request_choose_color':
            print('game:',data['data']['game_id'], 'choose color(B/W):')
            choose_result=input()
            while choose_result not in ['B', 'W']:
                print('invalid color')
                print('game:',data['data']['game_id'], 'choose color(B/W):')
                choose_result=input()
            choose_result={'B':1, 'W':-1}[choose_result]
            choose={
                "action": "choose_color",
                "data": {
                    "game_id": data['data']['game_id'],
                    "color": choose_result
                }
            }
            ws.send(json.dumps(choose))
        
    
    def on_error(self, ws, error):
        self.ws.close()
        self.ws=None
        print(error)


aaa=CompetitionSocket('test', 'fff', 'jjj')
