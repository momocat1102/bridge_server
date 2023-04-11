const express = require("express");
const SocketServer = require("ws").Server;
const expressFormidable = require("express-formidable");
const cors = require("cors");
// let sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const { OAuth2Client } = require("google-auth-library");
const fs = require("fs");
// const { player_invalidEmail } = require("./protocolTemplate.js");
const { game } = require("./bridge_game");

const SERVER_SECRET = "hsgijfkoksmrnebnhrvsmj";
const ADMIN_USERNAME =
    "$2b$10$tJQQ3O7CNUur2yewwLwqbelDgoaLNQ7SHCE1ld2.dqWfWD1Fpr4nm"; // 109321052
const ADMIN_PASSWORD =
    "$2b$10$vQyoYdIcVzcmmNDh0eo.YOlhgBYYyqZ/wRHtz1M0HuSWy4Ic2H8HW"; //109ncnucsie

const COMPETITIONSFILE = "./server/bridge_history/competitions.json";
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
const server = app.listen(6671, function() {
    console.log("start server on port 6671");
});


const { Competition } = require("./competition");
const competitions = {};

const removeCompetition = (competition_id) => {
    delete competitions[competition_id];
};

fs.readFile(COMPETITIONSFILE, "utf8", (err, data) => {
    data = JSON.parse(data);
    Object.values(data).forEach((d) => {
        // console.log(d)
        if(["prepare", "start"].includes(d.status)){
            competitions[d.id] = new Competition(
                d.id,
                d.type,
                d.time_limit,
                removeCompetition,
                d.num
            );
        }
        
    });
});

// console.log(competitions)
/* WS server */
const wsserver = new SocketServer({ server });
wsserver.on("connection", (ws) => {
    console.log('Client connected')
    // console.log(competitions)
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
                                competitions[data.data.competition].add_player(
                                    data.data.player_id,
                                    ws
                                );
                                
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
                            competitions[data.data.competition].add_viewer(ws);
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



// http://127.0.0.1:8082/test_game
// app.get("/test_game", (req, res) => {
//     console.log("test strat")
//     com.start();
//     // if(players.length === 2){
//     //     let game_start = new game('test', {name: players[0][0], socket: players[0][1]}, {name: players[1][0], socket: players[1][1]});
//     //     game_start.play();
//     // }
//     // else{
//     //     console.log(players.length + "players")
//     //     console.log("game start is fail")
//     // }
//     res.end();
// });

app.post("/start_competition", function(req, res) {
    // console.log(req.fields)
    if (req.fields.competition_name.includes("test")) {
        if (Object.keys(competitions[req.fields.competition_name].players).length < 2) {
            res.statusCode = 400;
            res.end("start fail, ensure player count at least 2.");
        } else {
            fs.readFile(COMPETITIONSFILE, "utf8", (err, data) => {
                if (err) throw err;
                const competitionsData = JSON.parse(data);
                competitionsData[req.fields.competition_name].status = "start";
                const updatedData = JSON.stringify(competitionsData);
                fs.writeFile(COMPETITIONSFILE, updatedData, (err) => {
                    if (err) throw err;
                    res.end("");
                });
            });
            competitions[req.fields.competition_name].start();
        }
    } else {
        if (req.fields.Authorization !== undefined) {
            let token = req.fields.Authorization.replace("Bearer ", "");
            try {
                jwt.verify(token, SERVER_SECRET);
                if (Object.keys(competitions[req.fields.competition_name].players).length < 2) {
                    res.statusCode = 400;
                    res.end("start fail, ensure player count at least 2.");
                } else {
                    fs.readFile(COMPETITIONSFILE, "utf8", (err, data) => {
                        if (err) throw err;
                        const competitionsData = JSON.parse(data);
                        competitionsData[req.fields.competition_name].status = "start";
                        const updatedData = JSON.stringify(competitionsData);
                        fs.writeFile(COMPETITIONSFILE, updatedData, (err) => {
                            if (err) throw err;
                            res.end("");
                        });
                    });
                    competitions[req.fields.competition_name].start();
                }

            } catch (e) {
                console.log(e);
                res.statusCode = 401;
                res.end(e.message);
            }
        } else {
            res.statusCode = 401;
            res.end("null authorization");
        }
    }
});

app.post("/competition_list", function(req, res) {
    let competitionsData = JSON.parse(fs.readFileSync(COMPETITIONSFILE));
    res.end(JSON.stringify(competitionsData));
});

// 給React用的
app.post("/competition_info", function(req, res) {
    let competitionsData = JSON.parse(fs.readFileSync(COMPETITIONSFILE));
    res.end(JSON.stringify(competitionsData[req.fields.competition_name]));
});

app.post("/create_competition", function(req, res) {
    if (req.fields.Authorization !== undefined) {
        console.log("create_competition");
        let token = req.fields.Authorization.replace("Bearer ", "");
        try {
            jwt.verify(token, SERVER_SECRET);
            if (!fs.existsSync(COMPETITIONSFILE)) {
                fs.writeFileSync(COMPETITIONSFILE, JSON.stringify({}));
            }
            else{
                const competitionsData = JSON.parse(fs.readFileSync(COMPETITIONSFILE)); // 讀取資料
                if (competitionsData[req.fields.competition_name]) { // 檢查是否已有同名的比賽
                    res.statusCode = 400;
                    res.end('create fail, duplicate name');
                } else {
                    competitionsData[req.fields.competition_name] = { // 新增比賽資料到 JSON 檔案
                    id: req.fields.competition_name,
                    type: req.fields.competition_type,
                    time_limit: req.fields.time_limit,
                    status: 'prepare',
                    num: req.fields.num,
                    create_time: new Date()
                    };
                    fs.writeFileSync(COMPETITIONSFILE, JSON.stringify(competitionsData)); // 寫入檔案
                    const newCompetition = competitionsData[req.fields.competition_name];
                    competitions[req.fields.competition_name] = new Competition(
                        newCompetition.id,
                        newCompetition.type,
                        newCompetition.time_limit,
                        removeCompetition,
                        newCompetition.num
                    );
                    res.end(JSON.stringify(newCompetition));
                }
            }
        } catch (e) {
            res.statusCode = 401;
            console.log(e.message);
            res.end(e.message);
        }
    } else {
        res.end("null authorization");
    }
});

app.post("/delete_competition", function(req, res) {
    if (req.fields.Authorization !== undefined) {
        let token = req.fields.Authorization.replace("Bearer ", "");
        try {
            jwt.verify(token, SERVER_SECRET);
            fs.readFile(COMPETITIONSFILE, "utf8", (err, data) => {
                if (err) throw err;
                const competitionsData = JSON.parse(data);
                delete competitionsData[req.fields.competition_name];
                const updatedData = JSON.stringify(competitionsData);
                fs.writeFile(COMPETITIONSFILE, updatedData, (err) => {
                    if (err) throw err;
                    res.end("");
                });
            });
        } catch (e) {
            res.statusCode = 401;
            res.end(e.message);
        }
    } else {
        res.end("null authorization");
    }
});

app.post("/competition_history", function(req, res) {
    // console.log(req.fields)
    let rawdata = fs.readFileSync(`./server/bridge_history/${req.fields.competition_id}.json`);
    res.end(rawdata);
});

app.post("/download_history", function(req, res) {
    res.download(`./server/bridge_history/${req.fields.competition_id}.zip`);
});

app.post("/remove_player", function(req, res) {
    // console.log(req.fields);
    if (req.fields.Authorization !== undefined) {
        let token = req.fields.Authorization.replace("Bearer ", "");
        try {
            jwt.verify(token, SERVER_SECRET);
            console.log("remove_player")
            competitions[req.fields.competition].delete_player(req.fields.player);
            res.end();
        } catch (e) {
            console.log(e);
            res.statusCode = 401;
            res.end(e.message);
        }
    } else {
        res.end("null authorization");
    }
});



app.post("/restart_game", function(req, res) {
    // console.log(req.fields);
    if (req.fields.competition_name.includes("test")) {
        if (
            competitions[req.fields.competition_name] !== undefined &&
            competitions[req.fields.competition_name].games[req.fields.game_id] !== undefined &&
            !competitions[req.fields.competition_name].games[req.fields.game_id].is_end
        ) {
            // competitions[req.fields.competition_name].games[req.fields.game_id].restart_promise = true;
            competitions[req.fields.competition_name].games[
                req.fields.game_id
            ].cancel_request(game.CANCEL_RESTART_GAME);
            res.end();
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
                    competitions[req.fields.competition_name].games[req.fields.game_id] !== undefined &&
                    !competitions[req.fields.competition_name].games[req.fields.game_id].is_end
                ) {
                    // competitions[req.fields.competition_name].games[req.fields.game_id].restart_promise = true;
                    competitions[req.fields.competition_name].games[
                        req.fields.game_id
                    ].cancel_request(game.CANCEL_RESTART_GAME);
                    res.end();
                } else {
                    res.statusCode = 400;
                    res.end("game ended");
                }
            } catch (e) {
                console.log(e);
                res.statusCode = 401;
                res.end(e.message);
            }
        } else {
            res.statusCode = 401;
            res.end("null authorization");
        }
    }
});

app.post("/assign_winner", function(req, res) {
    console.log(req.fields.game_id, req.fields.winner);
    if (req.fields.competition_name.includes("test")) {
        // console.log("test assign winner_1");
        // console.log(competitions[req.fields.competition_name]);
        // console.log(competitions[req.fields.competition_name].games[req.fields.game_id]);
        if (
            competitions[req.fields.competition_name] !== undefined &&
            competitions[req.fields.competition_name].games[req.fields.game_id] !== undefined &&
            !competitions[req.fields.competition_name].games[req.fields.game_id].is_end
        ) {
            // console.log("test assign winner_2");
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
                ].cancel_request("assign winner");
                res.end();
            }
        } else {
            // console.log("test assign winner_3");
            res.statusCode = 400;
            res.end("game ended");
        }
    } else {
        // console.log("test assign winner_3");
        if (req.fields.Authorization !== undefined) {
            let token = req.fields.Authorization.replace("Bearer ", "");
            try {
                jwt.verify(token, SERVER_SECRET);
                if (
                    competitions[req.fields.competition_name] !== undefined &&
                    competitions[req.fields.competition_name].games[req.fields.game_id] !== undefined &&
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
                        ].cancel_request("assign winner");
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