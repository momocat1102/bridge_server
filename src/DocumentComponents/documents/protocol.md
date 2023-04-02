# 通訊協定

使用Web Socket通訊，URL：ws://163.22.21.143:8082

## Requirements
* Python 3
* websocket-client >= 0.59.0

## 加入競賽

Player ID：請傳入您的名稱 注意，名稱不可重複。
Competition ID：對局名稱，請傳入要進行的對局之名稱。


```json
{
    "action": "join",
    "data": {
        "source": "player",
        "player_id": "[Player ID]",
        "competition": "[Competition ID]"
    }
}
```
## Bot版本之Socket

請根據sample bot的格式撰寫您的BOT，然後引入您的BOT執行程式即可。

```python
from sample_bot import SampleBot

bot = SampleBot()
```

```python
aaa = CompetitionSocket('test', 'name')
```
[Socket](socket)

## EXE版本之Socket

用於之前使用EXE來執行之程式，請先引入您的EXE檔再執行程式，有依照之前的規則即可正常運行。

```python
exe_path = "./HoneymoonBridgeTest.exe"
```

```python
aaa = CompetitionSocket('test', 'name')
```

[Socket for exe](socket_for_exe)

