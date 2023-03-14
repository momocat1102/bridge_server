# 通訊協定

使用Web Socket通訊，URL：ws://163.22.21.143:8082

## 加入競賽

token：由Google OAuth取得，client credential如下連結。

[OAuth2.0 client credential](client_secret)

competition：競賽頁面顯示的ID。

```json
{
    "action": "join",
    "data": {
        "source": "player",
        "token": "[token]",
        "competition": "[Competition ID]"
    }
}
```

傳送不合法的token，Server會拒絕Client加入競賽。

```json
{
    "action": "invalid_email"
}
```

## Play

通知Client某賽局ID需要落子。

```json
{
    "action": "request_move",
    "data": {
        "board": ["[二維list]"],
        "color": "[輪到哪個顏色]",
        "game_id": "[Game ID]"
    }
}
```

Client傳送落子資訊給Server，x代表由上而下的index(從0開始)，y代表由左而右的index(從0開始)

```json
{
    "action": "move",
    "data": {
        "game_id": "[Game ID]",
        "position": {
            "x": "[x position]",
            "y": "[y position]"
        },
        "board_check": "將board轉成一維並用逗號將element隔開後轉成字串"
    }
}
```
