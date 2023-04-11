const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const archiver = require('archiver');
const { game } = require("./bridge_game");
// const {COMPETITIONSFILE} = require("./app.js");
// const { colorHandshake } = require("./colorHandshake");
const COMPETITIONSPATH = "server/bridge_history/";
const {
    viewer_addPlayer,
    viewer_removePlayer,
    viewer_init,
    viewer_start,
    viewer_updateScoreboard,
    viewer_endCompetition,
    viewer_updateone2oneScoreboard
} = require("./protocolTemplate.js");

class Competition {
    // record hist when end, then remove from competitions
    constructor(competition_id, type, time_limit, removeCompetition, num) {
        this.competition_id = competition_id;
        this.type = type;
        this.time_limit = time_limit;
        // this.runSQL = runSQL;
        this.removeCompetition = removeCompetition;
        this.status = "prepare";
        this.players = {};
        this.viewers = {};
        this.games = {};
        // this.game_tree = undefined;
        this.reconnect_promise = {};
        this.scoreboard = new Map();
        this.one2onescore = {}
        this.num = num;
        this.hist = { players: [], record: {}, board_end: {}, scoreboard: {}, one2onescore: {} };
    }

    add_reconnect_promise = (player_id) => {
        return new Promise((resolve, reject) => {
            console.log("add_reconnect_promise")
            // console.log(this.reconnect_promise)
            if (this.reconnect_promise[player_id] === undefined) {
                this.reconnect_promise[player_id] = [resolve];
            } else {
                this.reconnect_promise[player_id].push(resolve);
            }
            console.log(this.reconnect_promise)
        })
    }

    add_player = (name, socket) => {
        // if not exist, add, then brocast to viewers
        if (this.status === "prepare") {
            console.log("test add_player")
            if (!Object.keys(this.players).includes(name)) {
                this.players[name] = socket;
                socket.on("close", () => {
                    if (this.players[name] !== undefined) {
                        this.delete_player(name);
                        // console.log("斷線" + name);
                    }
                });
                setInterval(() => {
                    socket.send(JSON.stringify({ action: "ping" }));
                }, 1000 * 5);
                Object.values(this.viewers).forEach((viewer) => {
                    viewer.send(viewer_addPlayer(name));
                });
            } else if (name === "s110321501") {
                name = String(parseInt(Math.random() * 10000000000));
                this.players[name] = socket;
                socket.on("close", () => {
                    if (this.players[name] !== undefined) {
                        this.delete_player(name);
                    }
                });
                setInterval(() => {
                    socket.send(JSON.stringify({ action: "ping" }));
                }, 1000 * 5);
                Object.values(this.viewers).forEach((viewer) => {
                    viewer.send(viewer_addPlayer(name));
                });
            }
        } else if (this.status === "start") {
            if (Object.keys(this.players).includes(name)) {
                this.players[name] = socket;
                socket.on("close", () => {
                    if (this.players[name] !== undefined) {
                        this.delete_player(name);
                    }
                });
                setInterval(() => {
                    socket.send(JSON.stringify({ action: "ping" }));
                }, 1000 * 5);
                Object.keys(this.games).forEach((game_id) => {
                    if (this.games[game_id].p1.name === name) {
                        this.games[game_id].p1.socket = socket;
                    } else if (this.games[game_id].p2.name === name) {
                        this.games[game_id].p2.socket = socket;
                    }
                    console.log(this.games[game_id].reconnect_promise);
                    if (Object.keys(this.reconnect_promise).includes(name)) {
                        this.reconnect_promise[name].forEach((resolve) => {
                            resolve(socket);
                        });
                        delete this.reconnect_promise[name];
                    }
                });
            }
        }
    };

    delete_player = (name) => {
        // console.log("delete_player");
        let socket = this.players[name];
        socket.close();
        if (this.status === "prepare") {
            delete this.players[name];
            Object.values(this.viewers).forEach((viewer) => {
                viewer.send(viewer_removePlayer(name));
            });
        }
        // console.log(this.players);
    };

    add_viewer = (socket) => {
        // if not exist, add, then sent current state
        // console.log("In");
        let id = uuidv4();
        this.viewers[id] = socket;
        socket.on("close", () => {
            delete this.viewers[id];
        });
        setInterval(() => {
            socket.send(JSON.stringify({ action: "ping" }));
        }, 1000 * 5);
        let record = {};
        // let game_flow = {};
        // let trump = {};
        // let dealer = {};
        let boards_isEnd = {};
        // let time_limit = {};
        // let win_times = {};
        // console.log(this.games)
        Object.keys(this.games).forEach((game_id) => {
            // game_flow[game_id] = this.games[game_id].hist;
            // trump[game_id] = [this.games[game_id].trump, this.games[game_id].dealer_win_condition - 6];
            // dealer[game_id] = this.games[game_id].dealer_name;
            // time_limit[game_id] = {
            //     black: Math.ceil(this.games[game_id].black_time_limit / (60 * 1000)),
            //     white: Math.ceil(this.games[game_id].white_time_limit / (60 * 1000)),
            // };
            // win_times[game_id] = {
            //     black: this.games[game_id].p1_score,
            //     white: this.games[game_id].p2_score,
            // };
            record[game_id] = this.games[game_id].record;
            boards_isEnd[game_id] = this.games[game_id].is_end;
        });
        console.log(
            // this.status,
            // Object.keys(this.players),
            // game_flow,
            // trump,
            // dealer,
            // boards_isEnd,
            // time_limit,
            // win_times,
            this.calc_scoreboard_order(this.scoreboard));
        socket.send(
            viewer_init(
                this.status,
                Object.keys(this.players),
                record,
                // game_flow,
                // trump,
                // dealer,
                boards_isEnd,
                // time_limit,
                // win_times,
                this.calc_scoreboard_order(this.scoreboard),
                this.one2onescore,
                parseInt(this.num)
            )
        );
        console.log(this.num);
    };

    init_scoreboard = () => {
        Object.keys(this.players).forEach((player) => {
            this.scoreboard.set(player, 0);
        });
    };

    sort_scoreboard = () => {
        let old_scoreboard = this.scoreboard;
        let new_scoreboard = new Map();
        let items = [];
        old_scoreboard.forEach((score, player) => {
            items.push([player, score]);
        });
        items.sort((a, b) => {
            return b[1] - a[1];
        });
        items.forEach((item) => {
            new_scoreboard.set(item[0], item[1]);
        });
        this.scoreboard = new_scoreboard;
    };

    update_scoreboard = (player_id, add_score, time_remain) => {
        this.scoreboard.set(player_id, this.scoreboard.get(player_id) + add_score);
        this.sort_scoreboard();
        Object.values(this.viewers).forEach((viewer) => {
            viewer.send(
                viewer_updateScoreboard(this.calc_scoreboard_order(this.scoreboard))
            );
        });
    };

    calc_scoreboard_order = (scoreboard) => {
        let tmp = [];
        let order = 1;
        let order_value = scoreboard.get(Array.from(scoreboard.keys())[0]);
        for (let i = 0; i < scoreboard.size; i++) {
            let player = Array.from(scoreboard.keys())[i];
            let score = scoreboard.get(player);
            if (score < order_value) {
                order += 1;
                order_value = score;
            }
            tmp.push([order, player, score]);
        }
        return tmp;
    };

    push_hist = (game_id, data, type = 'view') => {
        if (type === 'view') {
            this.hist.record[game_id] = data;
            this.hist.board_end[game_id] = true;
        } else if (type === 'download') {
            let mkdirp = require('mkdirp');
            mkdirp(`${COMPETITIONSPATH}${this.competition_id}`, (err) => {
                if (err)
                    console.log(err)
                else {
                    console.log("made dir staring with");
                    fs.writeFileSync(`${COMPETITIONSPATH}${this.competition_id}/${game_id}.txt`, data);

                }
            })
            // if (!this.competition_id.includes("test")) {
            
            // mkdirp(`${COMPETITIONSPATH}${this.competition_id}`).catch(err => {
            //     console.log(err);
            //     }).then(p => {
            //         console.log("made dir staring with");
            //         fs.writeFileSync(`${COMPETITIONSPATH}${this.competition_id}/${game_id}.txt`, data);
            //     })
        }
        // }
    };

    push_zip = () => {
        let competition_id = this.competition_id;
        const output = fs.createWriteStream(`${COMPETITIONSPATH}${competition_id}.zip`);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(`${COMPETITIONSPATH}${competition_id}`, false);
        archive.finalize();
    }

    start = async () => {
        this.status = "start";
        if (this.type === "round-robin") {
            this.init_scoreboard();
            for (let i = 0; i < Object.keys(this.players).length; i++) {
                for (let j = i + 1; j < Object.keys(this.players).length; j++) {
                    for (let game_num = 1; game_num <= this.num; game_num++) {
                        let player_name_i = Object.keys(this.players)[i];
                        let player_name_j = Object.keys(this.players)[j];
                        let game_id_1 = player_name_i + "_" + player_name_j + "_" + game_num;
                        let game_id_2 = player_name_j + "_" + player_name_i + "_" + game_num;
                        this.one2onescore[game_id_1] = {}
                        this.one2onescore[game_id_1][player_name_i] = 0
                        this.one2onescore[game_id_1][player_name_j] = 0
                        this.one2onescore[game_id_2] = {}
                        this.one2onescore[game_id_2][player_name_i] = 0
                        this.one2onescore[game_id_2][player_name_j] = 0
                    }

                }
            }
            Object.values(this.viewers).forEach((viewer) => {
                viewer.send(viewer_start());
                viewer.send(
                    viewer_updateScoreboard(this.calc_scoreboard_order(this.scoreboard))
                );
                viewer.send(
                    viewer_updateone2oneScoreboard(this.one2onescore)
                );
            });

            // let one2onescore = {};
            let winner = undefined;
            for (let i = 0; i < Object.keys(this.players).length; i++) {
                for (let j = i + 1; j < Object.keys(this.players).length; j++) {
                    // 打100場
                    for (let game_num = 1; game_num <= this.num; game_num++) {
                        console.log("場次 " + game_num);
                        let player_name_i = Object.keys(this.players)[i];
                        let player_name_j = Object.keys(this.players)[j];
                        let game_id_1 = player_name_i + "_" + player_name_j + "_" + game_num;
                        let game_id_2 = player_name_j + "_" + player_name_i + "_" + game_num;
                        this.games[game_id_1] = new game(
                            game_id_1, { name: player_name_i, socket: this.players[player_name_i] }, { name: player_name_j, socket: this.players[player_name_j] },
                            this.time_limit,
                            this.push_hist,
                            this.viewers,
                            this.update_scoreboard,
                            this.add_reconnect_promise,
                            game_num
                        );
                        // running_games[player_name_i + "_" + player_name_j] =
                        // this.games[player_name_i + "_" + player_name_j].BO1();
                        console.log("第一小場", game_id_1);
                        winner = await this.games[game_id_1].play()
                        console.log("winner is " + winner);
                        // console.log("winner is " + winner, player_name_i, player_name_j);
                        if (winner === player_name_i) {
                            this.one2onescore[game_id_1][player_name_i] += 1;
                        } else {
                            this.one2onescore[game_id_1][player_name_j] += 1;
                        }
                        Object.values(this.viewers).forEach((viewer) => {
                            viewer.send(
                                viewer_updateone2oneScoreboard(this.one2onescore)
                            );
                        });
                        // .catch(err => {
                        //     console.log("disconnect")
                        // });
                        let cardlist = this.games[game_id_1].outcard();
                        this.games[game_id_2] = new game(
                            game_id_2, { name: player_name_j, socket: this.players[player_name_j] }, { name: player_name_i, socket: this.players[player_name_i] },
                            this.time_limit,
                            this.push_hist,
                            this.viewers,
                            this.update_scoreboard,
                            this.add_reconnect_promise,
                            game_num
                        );
                        // console.log(cardlist);
                        this.games[game_id_2].loadcard(cardlist);
                        console.log("第二小場", game_id_2);
                        winner = await this.games[game_id_2].play(0)
                        console.log("winner is " + winner);
                        if (winner === player_name_i) {
                            this.one2onescore[game_id_2][player_name_i] += 1;
                        } else {
                            this.one2onescore[game_id_2][player_name_j] += 1;
                        }
                        Object.values(this.viewers).forEach((viewer) => {
                            viewer.send(
                                viewer_updateone2oneScoreboard(this.one2onescore)
                            );
                        });
                        // console.log(this.one2onescore);
                        // console.log("winner is " + winner, player_name_i, player_name_j);
                        // .catch(err => {
                        //     console.log("disconnect")
                        // });
                    }
                }
            }
            // console.log(this.one2onescore);
            this.push_zip()
            // console.log("結束")
            // for (let i = 0; i < Object.keys(running_games).length; i++) {
            //     let result = await running_games[Object.keys(running_games)[i]];
            // }
        } else if (this.type === "knockout") {
            // Object.values(this.viewers).forEach((viewer) => {
            //     viewer.send(viewer_start());
            // });

            // const init_round = [];
            // const shuffle_players = Object.keys(this.players).sort(
            //     () => Math.random() - 0.5
            // );
            // shuffle_players.forEach((player) => {
            //     init_round.push({ g: [player], w: player });
            // });
            // this.game_tree = {
            //     g: init_round,
            // };

            // Object.values(this.viewers).forEach((viewer) => {
            //     viewer.send(viewer_UpdateTree(this.game_tree));
            // });

            // let last_round = false;
            // while (!last_round) {
            //     if (this.game_tree.g.length === 1) {
            //         last_round = true;
            //     }
            //     let running_games = {};
            //     this.game_tree.g.map((game_node, node_ind) => {
            //         if (game_node.g.length === 2) {
            //             let player_name_i = game_node.g[0].w;
            //             let player_name_j = game_node.g[1].w;
            //             if (Math.random() > 0.5) {
            //                 this.games[player_name_i + "_" + player_name_j] = new game(
            //                     player_name_i + "_" + player_name_j, { name: player_name_i, socket: this.players[player_name_i] }, { name: player_name_j, socket: this.players[player_name_j] },
            //                     this.viewers,
            //                     this.time_limit,
            //                     this.board_size,
            //                     this.update_scoreboard,
            //                     this.push_hist
            //                 );
            //             } else {
            //                 this.games[player_name_i + "_" + player_name_j] = new game(
            //                     player_name_i + "_" + player_name_j, { name: player_name_j, socket: this.players[player_name_j] }, { name: player_name_i, socket: this.players[player_name_i] },
            //                     this.viewers,
            //                     this.time_limit,
            //                     this.board_size,
            //                     this.update_scoreboard,
            //                     this.push_hist
            //                 );
            //             }
            //             running_games[node_ind] =
            //                 this.games[player_name_i + "_" + player_name_j].BO3();
            //         } else {
            //             if (typeof game_node.g[0] === "object") {
            //                 this.game_tree.g[node_ind].w = game_node.g[0].w;
            //             }
            //         }
            //     });
            //     for (let i = 0; i < Object.keys(running_games).length; i++) {
            //         let key = Object.keys(running_games)[i];
            //         let value = running_games[key];
            //         let test = await value;
            //         this.game_tree.g[key].w = test;
            //     }
            //     this.game_tree = next_round(this.game_tree);
            //     if (last_round) {
            //         this.game_tree.winner = this.game_tree.g[0].w;
            //     }
            //     Object.values(this.viewers).forEach((viewer) => {
            //         viewer.send(viewer_UpdateTree(this.game_tree));
            //     });
            // }
        }

        Object.keys(this.players).forEach((player) =>
            this.hist.players.push(player)
        );
        this.hist.one2onescore = this.one2onescore;
        this.hist.scoreboard = this.calc_scoreboard_order(this.scoreboard);
        if (this.competition_id.includes("test")) {
            // this.runSQL(
            //     `update Competition set status='prepare' where id='${this.competition_id}'`
            // );
            this.status = "prepare";
            Object.entries(this.players).map(([player, socket]) => {
                if (socket.readyState === 3) {
                    delete this.players[player];
                }
            });
            this.games = {};
            this.scoreboard = new Map();
            this.hist = { players: [], record: {}, board_end: {}, scoreboard: {}, one2onescore: {} };
        } else {
            this.status = "end";
            Object.entries(this.players).map(([player, socket]) => {
                if (socket.readyState === 3) {
                    delete this.players[player];
                }
            });
            this.games = {};
            this.scoreboard = new Map();
            this.removeCompetition(this.competition_id);
            Object.values(this.viewers).forEach((viewer) => {
                viewer.send(viewer_endCompetition());
            });
            for (let i = 0; i < Object.keys(this.players).length; i++) {
                this.players[Object.keys(this.players)[i]].close();
            }
            // console.log(this.hist)
            fs.writeFileSync(
                `${COMPETITIONSPATH}${this.competition_id}.json`,
                JSON.stringify(this.hist)
            );
            this.hist = { players: [], record: {}, board_end: {}, scoreboard: {}, one2onescore: {} };
            // console.log(COMPETITIONSPATH)
            fs.readFile(COMPETITIONSPATH + "competitions.json", "utf8", (err, data) => {
                if (err) throw err;
                const competitionsData = JSON.parse(data);
                competitionsData[this.competition_id].status = "ended";
                const updatedData = JSON.stringify(competitionsData);
                fs.writeFile(COMPETITIONSPATH + "competitions.json", updatedData, (err) => {
                    if (err) throw err;
                });
            });
            this.removeCompetition(this.competition_id);
            Object.values(this.viewers).forEach((viewer) => {
                viewer.send(viewer_endCompetition());
            });
            for (let i = 0; i < Object.keys(this.players).length; i++) {
                this.players[Object.keys(this.players)[i]].close();
            }
        }
    };
}

module.exports = { Competition: Competition };