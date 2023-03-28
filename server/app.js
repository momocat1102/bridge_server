const express = require("express");
const SocketServer = require("ws").Server;
const expressFormidable = require("express-formidable");
const cors = require("cors");
// let sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const { OAuth2Client } = require("google-auth-library");
// const fs = require("fs");
// const { player_invalidEmail } = require("./protocolTemplate.js");
const { game } = require("./bridge_game");

const SERVER_SECRET = "hsgijfkoksmrnebnhrvsmj";
const ADMIN_USERNAME =
    "$2b$10$tJQQ3O7CNUur2yewwLwqbelDgoaLNQ7SHCE1ld2.dqWfWD1Fpr4nm"; // 109321052
const ADMIN_PASSWORD =
    "$2b$10$vQyoYdIcVzcmmNDh0eo.YOlhgBYYyqZ/wRHtz1M0HuSWy4Ic2H8HW"; //109ncnucsie

// const OAuthClientID =
//     "272292807664-ij5jkhcmhjft8q18s644j7msk8f7688b.apps.googleusercontent.com";
// const client = new OAuth2Client(OAuthClientID);

const app = express();
app.use(expressFormidable());
app.use(cors());

app.post("/admin_login", function(req, res) {
    if (
        bcrypt.compareSync(req.fields.username, ADMIN_USERNAME) &&
        bcrypt.compareSync(req.fields.password, ADMIN_PASSWORD)
    ) {
        const token = jwt.sign({}, SERVER_SECRET, { expiresIn: "1 day" });
        res.end(token);
    } else {
        res.statusCode = 401;
        res.end();
    }
});
// 監聽
const server = app.listen(8082, function() {
    console.log("start server on port 8082");
});

/* WS server */
const wsserver = new SocketServer({ server });
wsserver.on("connection", (ws) => {
    console.log('Client connected')
    let handler = (message) => {
        try {
            let data = JSON.parse(message.data);
            // console.log(data)
            switch (
                data.action // need try catch to ignore bad command
            ) {
                case "join":
                    ws.removeEventListener("message", handler);
                    try {
                        if (data.data.source === "player") {
                            // console.log(data.data.competition.includes("test"), data.data.player_id)
                            if (data.data.player_id !== undefined) {
                                console.log("add one player");
                                com.add_player(data.data.player_id, ws);
                                // players.push([data.data.player_id, ws])
                                // competitions[data.data.competition].add_player(
                                //     data.data.player_id,
                                //     ws
                                // );
                            } else {
                                console.log("please send player name")
                            }
                        }
                        else if(data.data.source === "viewer"){
                            console.log("add viewer");
                            com.add_viewer(ws);
                        }
                    } catch (e) {
                        /*competition ended or fail authentication*/
                        ws.close();
                    }
                    break;
                default:
                    break
            }
        } catch (e) {
            console.log("app:wsserver.on('connection')", "invalid protocol format")
            ws.close();
        }
    };
    ws.addEventListener("message", handler);
});
// let players = [];

const { Competition } = require("./competition");
const competitions = {};

const removeCompetition = (competition_id) => {
    delete competitions[competition_id];
};

let com = new Competition(
    "play1",
    "round-robin",
    3,
    // runSQL,
    removeCompetition,
    2
);

// http://127.0.0.1:8082/test_game
app.get("/test_game", (req, res) => {
    console.log("test strat")
    com.start();
    // if(players.length === 2){
    //     let game_start = new game('test', {name: players[0][0], socket: players[0][1]}, {name: players[1][0], socket: players[1][1]});
    //     game_start.play();
    // }
    // else{
    //     console.log(players.length + "players")
    //     console.log("game start is fail")
    // }
    res.end();
});

app.post("/start_competition", function(req, res) {
    com.start();
    res.end();
    // if (req.fields.competition_name.includes("test")) {
    //     if (Object.keys(competitions[req.fields.competition_name].players).length < 2) {
    //         res.statusCode = 400;
    //         res.end("start fail, ensure player count at least 2.");
    //     } else {
    //         // runSQL(
    //         //     `update Competition set status='start' where id='${req.fields.competition_name}'`
    //         // ).then((data) => {
    //         competitions[req.fields.competition_name].start();
    //         res.end();
    //         // });
    //     }
    // } else {
    //     if (req.fields.Authorization !== undefined) {
    //         // let token = req.fields.Authorization.replace("Bearer ", "");
    //         try {
    //             // jwt.verify(token, SERVER_SECRET);
    //             if (Object.keys(competitions[req.fields.competition_name].players).length < 2) {
    //                 res.statusCode = 400;
    //                 res.end("start fail, ensure player count at least 2.");
    //             } else {
    //                 // runSQL(
    //                 //     `update Competition set status='start' where id='${req.fields.competition_name}'`
    //                 // ).then((data) => {
    //                 competitions[req.fields.competition_name].start();
    //                 res.end();
    //                 // });
    //             }

    //         } catch (e) {
    //             res.statusCode = 401;
    //             res.end(e.message);
    //         }
    //     } else {
    //         res.statusCode = 401;
    //         res.end("null authorization");
    //     }
    // }
});

app.post("/competition_list", function(req, res) {
    let data = [{"id":"play1","type":"round-robin","time_limit":3,"status":"prepare","create_time":"2021-06-15T12:34:03.823Z"}]
    res.end(JSON.stringify(data));
});

app.post("/competition_info", function(req, res) {
    let data = {"id":"play1","type":"round-robin","time_limit":3,"status":"prepare","create_time":"2021-06-15T12:34:03.823Z"}
    res.end(JSON.stringify(data));
});

app.post("/assign_winner", function(req, res) {
    if (req.fields.competition_name.includes("test")) {
        if (
            competitions[req.fields.competition_name] !== undefined &&
            competitions[req.fields.competition_name].games[req.fields.game_id] !== undefined &&
            !competitions[req.fields.competition_name].games[req.fields.game_id].is_end
        ) {
            if (
                competitions[req.fields.competition_name].games[req.fields.game_id].p1.name !== req.fields.winner &&
                competitions[req.fields.competition_name].games[req.fields.game_id].p2.name !== req.fields.winner
            ) {
                res.statusCode = 400;
                res.end("invalid winner");
            } else {
                competitions[req.fields.competition_name].games[
                    req.fields.game_id
                ].assign_winner = req.fields.winner;
                competitions[req.fields.competition_name].games[
                    req.fields.game_id
                ].cancel_request(game.CANCEL_ASSIGN_WINNER);
                res.end();
            }
        } else {
            res.statusCode = 400;
            res.end("game ended");
        }
    } else {
        if (req.fields.Authorization !== undefined) {
            let token = req.fields.Authorization.replace("Bearer ", "");
            try {
                jwt.verify(token, SERVER_SECRET);
                if (
                    competitions[req.fields.competition_name] !== undefined &&
                    competitions[req.fields.competition_name].games[req.fields.game_id] != undefined &&
                    !competitions[req.fields.competition_name].games[req.fields.game_id].is_end
                ) {
                    if (
                        competitions[req.fields.competition_name].games[req.fields.game_id].black.name !== req.fields.winner &&
                        competitions[req.fields.competition_name].games[req.fields.game_id].white.name !== req.fields.winner
                    ) {
                        res.statusCode = 400;
                        res.end("invalid winner");
                    } else {
                        competitions[req.fields.competition_name].games[
                            req.fields.game_id
                        ].assign_winner = req.fields.winner;
                        competitions[req.fields.competition_name].games[
                            req.fields.game_id
                        ].cancel_request(game.CANCEL_ASSIGN_WINNER);
                        res.end();
                    }
                } else {
                    res.statusCode = 400;
                    res.end("game ended");
                }
            } catch (e) {
                res.statusCode = 401;
                res.end(e.message);
            }
        } else {
            res.statusCode = 401;
            res.end("null authorization");
        }
    }

});