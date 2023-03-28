const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const mkdirp = require('mkdirp');
const { game } = require("./game");
// const { colorHandshake } = require("./colorHandshake");
const { next_round } = require("./gameTreeUtils");
const {
    viewer_addPlayer,
    viewer_removePlayer,
    viewer_init,
    viewer_start,
    viewer_UpdateTree,
    viewer_updateScoreboard,
    viewer_endCompetition,
} = require("./protocolTemplate.js");

class Competition {
    // record hist when end, then remove from competitions
    constructor(competition_id, type, time_limit, board_size, runSQL, removeCompetition) {
        this.competition_id = competition_id;
        this.type = type;
        this.time_limit = time_limit;
        this.board_size = board_size;
        this.runSQL = runSQL;
        this.removeCompetition = removeCompetition;
        this.status = "prepare";
        this.players = {};
        this.viewers = {};
        this.games = {};
        this.game_tree = undefined;
        this.reconnect_promise = {};
        this.scoreboard = new Map();
        this.hist = { players: [], games: {}, scoreboard: {}, game_tree: [] };
    }

    add_reconnect_promise = (player_id) => {
        return new Promise((resolve, reject) => {
            if (this.reconnect_promise[player_id] === undefined) {
                this.reconnect_promise[player_id] = [resolve];              
            } else {
                this.reconnect_promise[player_id].push(resolve);
            }
        })
    }

    add_player = (name, socket) => {
        // if not exist, add, then brocast to viewers
        if (this.status === "prepare") {
            if (!Object.keys(this.players).includes(name)) {
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
            // else if (name === "s110321501") {
            //     name = String(parseInt(Math.random() * 10000000000));
            //     this.players[name] = socket;
            //     socket.on("close", () => {
            //         if (this.players[name] !== undefined) {
            //             this.delete_player(name);
            //         }
            //     });
            //     setInterval(() => {
            //         socket.send(JSON.stringify({ action: "ping" }));
            //     }, 1000 * 5);
            //     Object.values(this.viewers).forEach((viewer) => {
            //         viewer.send(viewer_addPlayer(name));
            //     });
            // }
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
                    if (this.games[game_id].black.name === name) {
                        this.games[game_id].black.socket = socket;
                    } else if (this.games[game_id].white.name === name) {
                        this.games[game_id].white.socket = socket;
                    }
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
        let socket = this.players[name];
        socket.close();
        if (this.status === "prepare") {
            delete this.players[name];
            Object.values(this.viewers).forEach((viewer) => {
                viewer.send(viewer_removePlayer(name));
            });
        }
    };
    add_viewer = (socket) => {
        // if not exist, add, then sent current state
        let id = uuidv4();
        this.viewers[id] = socket;
        socket.on("close", () => {
            delete this.viewers[id];
        });
        setInterval(() => {
            socket.send(JSON.stringify({ action: "ping" }));
        }, 1000 * 5);
        let boards = {};
        let last_move = {};
        let boards_isEnd = {};
        let time_limit = {};
        let stone_count = {};
        let win_times = {};
        let player_color = {};
        Object.keys(this.games).forEach((game_id) => {
            if (this.games[game_id].hist.length === 0) {
                player_color[game_id] = {
                    black: this.games[game_id].black.name,
                    white: this.games[game_id].white.name,
                };
            } else {
                let last_hist =
                    this.games[game_id].hist[this.games[game_id].hist.length - 1];
                player_color[game_id] = {
                    black: last_hist.black.name,
                    white: last_hist.white.name,
                };
            }
            boards[game_id] = this.games[game_id].board;
            last_move[game_id] = this.games[game_id].last_move;
            time_limit[game_id] = {
                black: Math.ceil(this.games[game_id].black_time_limit / (60 * 1000)),
                white: Math.ceil(this.games[game_id].white_time_limit / (60 * 1000)),
            };
            stone_count[game_id] = {
                black: this.games[game_id].black_stone_count,
                white: this.games[game_id].white_stone_count,
            };
            win_times[game_id] = {
                black: this.games[game_id].black_win_times,
                white: this.games[game_id].white_win_times,
            };
            boards_isEnd[game_id] = this.games[game_id].is_end;
        });
        socket.send(
            viewer_init(
                this.status,
                Object.keys(this.players),
                boards,
                last_move,
                boards_isEnd,
                time_limit,
                stone_count,
                win_times,
                this.calc_scoreboard_order(this.scoreboard),
                this.game_tree,
                player_color
            )
        );
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

    push_hist = (game_id, boards, type = 'view') => {
        if (type === 'view') {
            this.hist.games[game_id] = boards;
        } else if (type === 'download') {
            let competition_id = this.competition_id;
            if (!this.competition_id.includes("test")) {
                mkdirp(`history/${this.competition_id}`)
                    .catch(
                        err => { console.log(err) }
                    ).then(
                        p => {
                            // console.log(`made dir staring with ${p}`)
                            fs.writeFileSync(`history/${competition_id}/${game_id}.txt`, boards.join('\n') + "\n");
                        }
                    )
            }
        }
    };

    start = async() => {
        this.status = "start";
        if (this.type === "round-robin") {
            this.init_scoreboard();
            Object.values(this.viewers).forEach((viewer) => {
                viewer.send(viewer_start());
                viewer.send(
                    viewer_updateScoreboard(this.calc_scoreboard_order(this.scoreboard))
                );
            });
            let running_games = {};
            for (let i = 0; i < Object.keys(this.players).length; i++) {
                for (let j = i + 1; j < Object.keys(this.players).length; j++) {
                    let player_name_i = Object.keys(this.players)[i];
                    let player_name_j = Object.keys(this.players)[j];
                    this.games[player_name_i + "_" + player_name_j] = new game(
                        player_name_i + "_" + player_name_j, { name: player_name_i, socket: this.players[player_name_i] }, { name: player_name_j, socket: this.players[player_name_j] },
                        this.viewers,
                        this.time_limit,
                        this.board_size,
                        this.update_scoreboard,
                        this.push_hist
                    );
                    // running_games[player_name_i + "_" + player_name_j] =
                    //     this.games[player_name_i + "_" + player_name_j].BO1();
                    await this.games[player_name_i + "_" + player_name_j].BO1();
                    this.games[player_name_j + "_" + player_name_i] = new game(
                        player_name_j + "_" + player_name_i, { name: player_name_j, socket: this.players[player_name_j] }, { name: player_name_i, socket: this.players[player_name_i] },
                        this.viewers,
                        this.time_limit,
                        this.board_size,
                        this.update_scoreboard,
                        this.push_hist
                    );
                    await this.games[player_name_j + "_" + player_name_i].BO1();
                }
            }
            // for (let i = 0; i < Object.keys(running_games).length; i++) {
            //     let result = await running_games[Object.keys(running_games)[i]];
            // }
        } else if (this.type === "knockout") {
            Object.values(this.viewers).forEach((viewer) => {
                viewer.send(viewer_start());
            });

            const init_round = [];
            const shuffle_players = Object.keys(this.players).sort(
                () => Math.random() - 0.5
            );
            shuffle_players.forEach((player) => {
                init_round.push({ g: [player], w: player });
            });
            this.game_tree = {
                g: init_round,
            };

            Object.values(this.viewers).forEach((viewer) => {
                viewer.send(viewer_UpdateTree(this.game_tree));
            });

            let last_round = false;
            while (!last_round) {
                if (this.game_tree.g.length === 1) {
                    last_round = true;
                }
                let running_games = {};
                this.game_tree.g.map((game_node, node_ind) => {
                    if (game_node.g.length === 2) {
                        let player_name_i = game_node.g[0].w;
                        let player_name_j = game_node.g[1].w;
                        if (Math.random() > 0.5) {
                            this.games[player_name_i + "_" + player_name_j] = new game(
                                player_name_i + "_" + player_name_j, { name: player_name_i, socket: this.players[player_name_i] }, { name: player_name_j, socket: this.players[player_name_j] },
                                this.viewers,
                                this.time_limit,
                                this.board_size,
                                this.update_scoreboard,
                                this.push_hist
                            );
                        } else {
                            this.games[player_name_i + "_" + player_name_j] = new game(
                                player_name_i + "_" + player_name_j, { name: player_name_j, socket: this.players[player_name_j] }, { name: player_name_i, socket: this.players[player_name_i] },
                                this.viewers,
                                this.time_limit,
                                this.board_size,
                                this.update_scoreboard,
                                this.push_hist
                            );
                        }
                        running_games[node_ind] =
                            this.games[player_name_i + "_" + player_name_j].BO3();
                    } else {
                        if (typeof game_node.g[0] === "object") {
                            this.game_tree.g[node_ind].w = game_node.g[0].w;
                        }
                    }
                });
                for (let i = 0; i < Object.keys(running_games).length; i++) {
                    let key = Object.keys(running_games)[i];
                    let value = running_games[key];
                    let test = await value;
                    this.game_tree.g[key].w = test;
                }
                this.game_tree = next_round(this.game_tree);
                if (last_round) {
                    this.game_tree.winner = this.game_tree.g[0].w;
                }
                Object.values(this.viewers).forEach((viewer) => {
                    viewer.send(viewer_UpdateTree(this.game_tree));
                });
            }
        }

        Object.keys(this.players).forEach((player) =>
            this.hist.players.push(player)
        );
        this.hist.scoreboard = this.calc_scoreboard_order(this.scoreboard);
        this.hist.game_tree = this.game_tree;
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
            this.game_tree = undefined;
            this.scoreboard = new Map();
            this.hist = { players: [], games: {}, scoreboard: {}, game_tree: [] };
        } else {
            fs.writeFileSync(
                `history/${this.competition_id}.json`,
                JSON.stringify(this.hist)
            );
            // this.runSQL(
            //     `update Competition set status='ended' where id='${this.competition_id}'`
            // ).then((data) => {
            //     this.removeCompetition(this.competition_id);
            //     Object.values(this.viewers).forEach((viewer) => {
            //         viewer.send(viewer_endCompetition());
            //     });
            //     for (let i = 0; i < Object.keys(this.players).length; i++) {
            //         this.players[Object.keys(this.players)[i]].close();
            //     }
            // });
        }
    };
}

module.exports = { Competition: Competition };