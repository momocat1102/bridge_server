import websocket, threading, json, time, numpy as np
import subprocess


exe_path = "./HoneymoonBridgeTest.exe"
process = None

class CompetitionSocket(websocket.WebSocketApp):
    server_url = 'ws://127.0.0.1:8082'
    # server_url='ws://163.22.21.143:8082'
    # server_url='ws://10.21.23.46:8080'
    # server_url='ws://10.21.23.172:8080'
    
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
        # time.sleep(5)
        # print('REOPEN')
        # self.run_forever()
    
    
    def on_message(self, ws, message):
        global process
        # print(message)
        data=json.loads(message)
        if data['id'] == 0: # READY
            global process
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 1: # RESET
            if process != None:
                process.stdin.close()
                process.wait()
            process = subprocess.Popen(exe_path, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            process.stdin.write(b"0 ready\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            res={
                'id': data['id'],
                'name': self.player_id,
                'reset': 'success'
            }
            ws.send(json.dumps(res))
        elif data['id'] == 2: # DEAL
            # 拿手牌
            hand_card = [str(i) for i in data['data']['hand_card']]
            hand_card = ' '.join(hand_card)
            process.stdin.write(b"2 deal " + str(hand_card).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 3: # CALL
            process.stdin.write(b"3 call " + str(data['data']['call']).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            my_call = int(output.split(" ")[1])
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_call': my_call
            }
            ws.send(json.dumps(res))
        elif data['id'] == 4: # CALL_RESULT
            process.stdin.write(b"4 call_result " + str(data['data']['result']).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 5: # CHANGE_FIRST
            process.stdin.write(b"5 change_first " + str(data['data']['change_card']).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            my_change = int(output.split(" ")[1])
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_card_for_change': my_change
            }
            ws.send(json.dumps(res))
        elif data['id'] == 6: # CHANGE_SECOND
            process.stdin.write(b"6 change_second " + str(data['data']['change_card']).encode() + b" " + str(data['data']['opp_card']).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            my_change = int(output.split(" ")[1])
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_card_for_change': my_change
            }
            ws.send(json.dumps(res))
        elif data['id'] == 7: # CHANGE_RESULT
            process.stdin.write(f"7 change_result {data['data']['opp_card']} {data['data']['player_get']}\n".encode())
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 8: # PLAY_CARD_FIRST
            process.stdin.write(b"8 play_card_first\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            my_play = int(output.split(" ")[1])
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_play': my_play
            }
            ws.send(json.dumps(res))
        elif data['id'] == 9: # PLAY_CARD_SECOND
            process.stdin.write(b"9 play_card_second " + str(data['data']['opp_play']).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            my_play = int(output.split(" ")[1])
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_play': my_play
            }
            ws.send(json.dumps(res))
        elif data['id'] == 10: # PLAY_CARD_RESULT
            process.stdin.write(f"10 play_card_result {data['data']['opp_card']} {data['data']['result']}\n".encode())
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 11: # GAME_OVER
            process.stdin.write(b"11 game_over 1\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            process.stdin.close()
            process.wait()
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 12: # CHANGE_FINAL
            res={
                'id': data['id'],
                'name': self.player_id,
                'connect': 'success'
            }
            ws.send(json.dumps(res))
        elif data['id'] == 13: # TEST
            res={
                'id': data['id'],
                'player_name': self.player_id,
                'connect': 'success'
            }
            ws.send(json.dumps(res))
        elif data['id'] == 14: # PHASE_AND_PLAYER_STATUS
            # 傳送目前階段及先後手
            process.stdin.write(b"1 state " + data['state'].encode() + b" " + data['turn'].encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            res={
                'id': data['id'],
                'player_name': self.player_id,
            }
            ws.send(json.dumps(res))
            
    
    def on_error(self, ws, error):
        self.ws.close()
        self.ws=None
        print(error)



aaa = CompetitionSocket('test', 'test1')