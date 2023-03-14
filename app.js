const express = require("express");
const SocketServer = require("ws").Server;
const expressFormidable = require("express-formidable");
const cors = require("cors");
let sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const fs = require("fs");
const { player_invalidEmail } = require("./protocolTemplate.js");
const { game } = require("./game");

const SERVER_SECRET = "hsgijfkoksmrnebnhrvsmj";
const ADMIN_USERNAME =
    "$2b$10$B9LqazPOkMQkYoOZmVeUJOZRkJjYQr2XCnWV.ORYzUMye3zP/OQ.S";
const ADMIN_PASSWORD =
    "$2b$10$B9LqazPOkMQkYoOZmVeUJOXC6YpJ2EiQCxHJfVDMisetKxYntJb.S";

const OAuthClientID =
    "272292807664-ij5jkhcmhjft8q18s644j7msk8f7688b.apps.googleusercontent.com";
const client = new OAuth2Client(OAuthClientID);

const app = express();
app.use(expressFormidable());
app.use(cors());

// 資料庫
const pool = new sql.ConnectionPool({
    user: "othello",
    password: "othello",
    server: "DESKTOP-KF383EB/SQLEXPRESS", // 10.22.23.161 127.0.0.1
    database: "OthelloPlatform",
    options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
    },
});
const readonlyPoolPromise = pool.connect();
pool.on("error", (err) => {
    console.log("Database Connection Failed :", err); // ... error handler
});
// ------------------------------------------------------------------------------

const runSQL = async(sqlCode) => {
    const pool = await readonlyPoolPromise;
    const request = pool.request();
    const result = await request.query(sqlCode);
    return result.recordset;
};

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
// 比賽賽程
app.post("/competition_list", function(req, res) {
    runSQL("select * from Competition order by create_time ASC").then((data) => {
        res.end(JSON.stringify(data));
    });
});
// 
app.post("/competition_history", function(req, res) {
    let rawdata = fs.readFileSync(`history/${req.fields.competition_id}.json`);
    res.end(rawdata);
});

app.post("/download_history", function(req, res) {
    res.download(`history/${req.fields.competition_id}/${req.fields.game_id}.txt`);
});

app.post("/create_competition", function(req, res) {
    if (req.fields.Authorization !== undefined) {
        let token = req.fields.Authorization.replace("Bearer ", "");
        try {
            jwt.verify(token, SERVER_SECRET);
            runSQL(
                    `insert into Competition(id, type, time_limit, status, board_size) values('${req.fields.competition_name}', '${req.fields.competition_type}', '${req.fields.time_limit}', 'prepare', '${req.fields.board_size}')`
                )
                .then((data) => {
                    competitions[req.fields.competition_name] = new Competition(
                        req.fields.competition_name,
                        req.fields.competition_type,
                        req.fields.time_limit,
                        parseInt(req.fields.board_size),
                        runSQL,
                        removeCompetition
                    );
                    res.end(JSON.stringify(data));
                })
                .catch((e) => {
                    res.statusCode = 400;
                    res.end("create fail, duplicate name");
                });
        } catch (e) {
            res.statusCode = 401;
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
            runSQL(
                    `delete from Competition where id='${req.fields.competition_name}'`
                )
                .then((data) => {
                    delete competitions[req.fields.competition_name];
                    res.end("");
                })
                .catch((e) => {
                    res.statusCode = 400;
                    res.end("delete fail");
                });
        } catch (e) {
            res.statusCode = 401;
            res.end(e.message);
        }
    } else {
        res.end("null authorization");
    }
});

app.post("/competition_info", function(req, res) {
    runSQL(`select * from Competition where id='${req.fields.competition_name}'`)
        .then((data) => {
            res.end(JSON.stringify(data[0]));
        })
        .catch((e) => {
            res.statusCode = 400;
            res.end("competition name dose not exist");
        });
});
// 監聽
const server = app.listen(8082, function() {
    console.log("start server on port 8082");
});

/* WS server */
const wsserver = new SocketServer({ server });
wsserver.on("connection", (ws) => {
    let handler = (message) => {
        try {
            let data = JSON.parse(message.data);
            switch (
                data.action // need try catch to ignore bad command
            ) {
                case "join":
                    ws.removeEventListener("message", handler);
                    try {
                        if (data.data.source === "viewer") {
                            competitions[data.data.competition].add_viewer(ws);
                        } else if (data.data.source === "player") {
                            if (data.data.competition.includes("test") && data.data.player_id !== undefined) {
                                competitions[data.data.competition].add_player(
                                    data.data.player_id,
                                    ws
                                );
                            } else {
                                client
                                    .verifyIdToken({
                                        idToken: data.data.token,
                                        audience: OAuthClientID,
                                    })
                                    .then((ticket) => {
                                        if (
                                            true || ["mail.ncnu.edu.tw", "mail1.ncnu.edu.tw"].includes(
                                                ticket.getPayload().hd
                                            ) || [
                                                "z58774556@gmail.com",
                                                "h24563026@mailst.cjcu.edu.tw",
                                            ].includes(ticket.getPayload().email)
                                        ) {
                                            competitions[data.data.competition].add_player(
                                                ticket.getPayload().email.replace(/@.*$/, ""),
                                                ws
                                            );
                                        } else {
                                            ws.send(player_invalidEmail());
                                            ws.close();
                                        }
                                    })
                                    .catch((e) => {
                                        console.log("login fail or fail authentication");
                                    });
                            }
                        }
                    } catch (e) {
                        /*competition ended or fail authentication*/
                        ws.close();
                    }
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.log("app:wsserver.on('connection')", "invalid protocol format")
            ws.close();
        }
    };
    ws.addEventListener("message", handler);
});

const { Competition } = require("./competition");
const competitions = {}; // sync with SQL, initalize at startup. add new when create
runSQL("select * from Competition").then((data) => {
    data.forEach((d) => {
        if (["prepare", "start"].includes(d.status)) {
            competitions[d.id] = new Competition(
                d.id,
                d.type,
                d.time_limit,
                d.board_size,
                runSQL,
                removeCompetition
            );
        }
    });
});
const removeCompetition = (competition_id) => {
    delete competitions[competition_id];
};

app.post("/remove_player", function(req, res) {
    if (req.fields.Authorization !== undefined) {
        let token = req.fields.Authorization.replace("Bearer ", "");
        try {
            jwt.verify(token, SERVER_SECRET);
            competitions[req.fields.competition].delete_player(req.fields.player);
            res.end();
        } catch (e) {
            res.statusCode = 401;
            res.end(e.message);
        }
    } else {
        res.end("null authorization");
    }
});

app.post("/start_competition", function(req, res) {
    if (req.fields.competition_name.includes("test")) {
        if (Object.keys(competitions[req.fields.competition_name].players).length < 2) {
            res.statusCode = 400;
            res.end("start fail, ensure player count at least 2.");
        } else {
            runSQL(
                `update Competition set status='start' where id='${req.fields.competition_name}'`
            ).then((data) => {
                competitions[req.fields.competition_name].start();
                res.end();
            });
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
                    runSQL(
                        `update Competition set status='start' where id='${req.fields.competition_name}'`
                    ).then((data) => {
                        competitions[req.fields.competition_name].start();
                        res.end();
                    });
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

app.post("/restart_game", function(req, res) {
    if (req.fields.competition_name.includes("test")) {
        if (
            competitions[req.fields.competition_name] !== undefined &&
            competitions[req.fields.competition_name].games[req.fields.game_id] != undefined &&
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
    if (req.fields.competition_name.includes("test")) {
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