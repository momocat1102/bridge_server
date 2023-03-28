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
                "player_id": self.player_id
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
        print("### closed.  Will try to connect ###")
        time.sleep(1)
        ws.on_open()
    
    
    def on_message(self, ws, message):
        global process
        print(message)
        data=json.loads(message)
        # print(data['name'], type(data['id']))
        if data['id'] == 0:
            global process
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 1:  # reset
            print("dddd")
            if process != None:
                process.stdin.close()
                process.wait()
            # print("dddd")
            process = subprocess.Popen(exe_path, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            process.stdin.write(b"0 ready\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            print("Output:", output)
            res={
                'id': data['id'],
                'name': self.player_id,
                'reset': 'success'
            }
            ws.send(json.dumps(res))
        elif data['id'] == 2:
            # 拿手牌
            hand_card = [str(i) for i in data['data']['hand_card']]
            hand_card = ' '.join(hand_card)
            print(hand_card, type(hand_card))
            print(process)
            process.stdin.write(b"2 deal " + str(hand_card).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            print("Output:", output)
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 3:
            process.stdin.write(b"3 call " + str(data['data']['call']).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            my_call = int(output.split(" ")[1])
            print("Output:", output, my_call)
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_call': my_call
            }
            ws.send(json.dumps(res))
        elif data['id'] == 4:
            process.stdin.write(b"4 call_result " + str(data['data']['result']).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            print("Output:", output)
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 5:
            process.stdin.write(b"5 change_first " + str(data['data']['change_card']).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            my_change = int(output.split(" ")[1])
            print("Output:", output, my_change)
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_card_for_change': my_change
            }
            ws.send(json.dumps(res))
        elif data['id'] == 6:
            process.stdin.write(b"6 change_second " + str(data['data']['change_card']).encode() + b" " + str(data['data']['opp_card']).encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            my_change = int(output.split(" ")[1])
            print("Output:", output, my_change)
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_card_for_change': my_change
            }
            ws.send(json.dumps(res))
        elif data['id'] == 7:
            print(f"Sending command: 7 change_result {data['data']['opp_card']} {data['data']['player_get']}")
            process.stdin.write(f"7 change_result {data['data']['opp_card']} {data['data']['player_get']}\n".encode())
            # process.stdin.flush()
            # print("Command sent.")
            # command = "7 change_result {} {}\n".format(data['data']['opp_card'], data['data']['player_get'])
            # output, error = process.communicate(command.encode())
            # # output = process.stdout.readline().decode().strip()
            # print(f"Received output: {output}")
            # print(error)
            # process.stdin.write(b"7 change_result " + str(data['data']['opp_card']).encode() + b" " + str(data['data']['player_get']).encode() + b"\n")
            # process.stdin.flush()
            # output = process.stdout.readline().decode().strip()
            # print("Output:", output)
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 8:
            # my_play = bot.play()
            # print(my_play)
            process.stdin.write(b"8 play_card_first\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            my_play = int(output.split(" ")[1])
            print("Output:", output, my_play)
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_play': my_play
            }
            ws.send(json.dumps(res))
        elif data['id'] == 9:
            process.stdin.write(b"9 play_card_second " + str(data['data']['opp_play']).encode() + b"\n")
            print("Command sent.")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            my_play = int(output.split(" ")[1])
            print("Output:", output, my_play)
            res={
                'id': data['id'],
                'name': self.player_id,
                'player_play': my_play
            }
            ws.send(json.dumps(res))
        elif data['id'] == 10:
            print("Result in ")
            process.stdin.write(f"10 play_card_result {data['data']['opp_card']} {data['data']['result']}\n".encode())
            print("Result out")
            # process.stdin.flush()
            # output = process.stdout.readline().decode().strip()
            # print("Output:", output)
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 11:
            process.stdin.write(b"11 game_over 1\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            print("Output:", output)
            process.stdin.close()
            process.wait()
            res={
                'id': data['id'],
                'name': self.player_id
            }
            ws.send(json.dumps(res))
        elif data['id'] == 12: # change_finall
            # bot.deal("play")
            res={
                'id': data['id'],
                'name': self.player_id,
                'connect': 'success'
            }
            ws.send(json.dumps(res))
        elif data['id'] == 13: # test
            print("test")
            # print(bot.my_hand)
            # print(data['data']['data'] + ' is success.')
            res={
                'id': data['id'],
                'player_name': self.player_id,
                'connect': 'success'
            }
            ws.send(json.dumps(res))
        elif data['id'] == 14:
            # 傳送目前階段及先後手
            process.stdin.write(b"1 state " + data['state'].encode() + b" " + data['turn'].encode() + b"\n")
            process.stdin.flush()
            output = process.stdout.readline().decode().strip()
            print("Output:", output)
            res={
                'id': data['id'],
                'player_name': self.player_id,
            }
            ws.send(json.dumps(res))
            
    
    def on_error(self, ws, error):
        self.ws.close()
        self.ws=None
        print(error)


# g = "3 4 5 6 7 8 9"
# print(list(g))

aaa=CompetitionSocket('play1', 'test1')