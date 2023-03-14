const {
    getValidMoves,
    isValidMove,
    executeMove,
    countStones,
} = require("./gameUtils.js");
const {
    viewer_endGame,
    player_requestMove,
    viewer_updateBoard,
    viewer_updateTimeLimit,
    viewer_updateStoneCount,
    viewer_updateWinTimes,
    viewer_changeColor,
} = require("./protocolTemplate.js");
const { timer } = require("./timer.js");

class game {
    static CANCEL_OUT_OF_TIME = 0;
    static CANCEL_RESTART_GAME = 1;
    static CANCEL_ASSIGN_WINNER = 2;
    // is socket clone ???
    constructor(
        game_id,
        black,
        white,
        viewers,
        time_limit,
        board_size,
        update_scoreboard,
        push_hist
    ) {
        this.game_id = game_id;
        this.black = black;
        this.white = white;
        this.viewers = viewers;
        this.time_limit = time_limit;
        this.board_size = board_size;
        this.update_scoreboard = update_scoreboard;
        this.push_hist = push_hist;

        this.init_black = black;
        this.init_white = white;

        this.cancel_request = undefined;
        this.hist = [];
        this.hist_download = [];
        this.black_win_times = 0;
        this.white_win_times = 0;

        this.BLACK = 1;
        this.WHITE = -1;
        this.is_end = false;

        this.reconnect_promise = {};
        this.assign_winner = undefined;
    }
    move = (position) => {
        if (isValidMove(this.board, this.current_player, position)) {
            this.board = executeMove(this.board, this.current_player, position);
            this.hist_download.push(`${this.current_player === this.BLACK?"B":"W"} ${position[0]} ${position[1]}`)
            this.current_player = -this.current_player;
        } else {
            throw new Error("invalid move");
        }
    };
    isEndGame = () => {
        let white_valid_moves = getValidMoves(this.board, this.WHITE).length;
        let black_valid_moves = getValidMoves(this.board, this.BLACK).length;
        if (white_valid_moves === 0 && black_valid_moves === 0) {
            if (this.black_stone_count > this.white_stone_count) {
                return this.BLACK;
            } else if (this.white_stone_count > this.black_stone_count) {
                return this.WHITE;
            } else {
                return 0;
            }
        } else {
            return undefined;
        }
    };

    reset = async() => {
        this.last_move = undefined;
        this.black_time_limit = this.time_limit * 60 * 1000;
        this.white_time_limit = this.time_limit * 60 * 1000;
        this.black_stone_count = 2;
        this.white_stone_count = 2;
        this.board = [];
        for (let i = 0; i < this.board_size; i++) {
            this.board.push(Array(this.board_size).fill(0));
        }
        this.board[parseInt(this.board_size / 2)][parseInt(this.board_size / 2)] = this.WHITE;
        this.board[parseInt(this.board_size / 2) - 1][parseInt(this.board_size / 2) - 1] = this.WHITE;
        this.board[parseInt(this.board_size / 2) - 1][parseInt(this.board_size / 2)] = this.BLACK;
        this.board[parseInt(this.board_size / 2)][parseInt(this.board_size / 2) - 1] = this.BLACK;
        this.hist.push({
            board: JSON.parse(JSON.stringify(this.board)),
            black: {
                name: this.black.name,
                time_limit: Math.ceil(this.black_time_limit / (60 * 1000)),
                stone_count: this.black_stone_count,
                win_times: this.black_win_times,
            },
            white: {
                name: this.white.name,
                time_limit: Math.ceil(this.white_time_limit / (60 * 1000)),
                stone_count: this.white_stone_count,
                win_times: this.white_win_times,
            },
        });
        Object.values(this.viewers).forEach((viewer) => {
            viewer.send(viewer_updateBoard(this.game_id, this.board));
            viewer.send(
                viewer_changeColor(this.game_id, this.black.name, this.white.name)
            );
            viewer.send(
                viewer_updateTimeLimit(
                    this.game_id,
                    Math.ceil(this.black_time_limit / (60 * 1000)),
                    Math.ceil(this.white_time_limit / (60 * 1000))
                )
            );
            viewer.send(
                viewer_updateStoneCount(
                    this.game_id,
                    this.black_stone_count,
                    this.white_stone_count
                )
            );
            viewer.send(
                viewer_updateWinTimes(
                    this.game_id,
                    this.black_win_times,
                    this.white_win_times
                )
            );
        });
        this.current_player = this.BLACK;
    };
    resetColor = () => {
        this.black = this.init_black;
        this.white = this.init_white;
    };
    changeColor = () => {
        let tmp = this.black;
        this.black = this.white;
        this.white = tmp;
        tmp = this.black_win_times;
        this.black_win_times = this.white_win_times;
        this.white_win_times = tmp;
    };
    update_win_times = (result) => {
        if (result === this.BLACK) {
            this.black_win_times += 1;
        } else if (result === this.WHITE) {
            this.white_win_times += 1;
        } else {
            this.black_win_times += 1;
            this.white_win_times += 1;
        }
        this.hist[this.hist.length - 1].black.win_times = this.black_win_times;
        this.hist[this.hist.length - 1].white.win_times = this.white_win_times;
        Object.values(this.viewers).forEach((viewer) => {
            viewer.send(viewer_updateWinTimes(this.game_id, this.black_win_times, this.white_win_times));
        });
    };
    reconnect_socket = (name, color) => {
        let reconnect_socket_promise;
        let p = new Promise((resolve, reject) => {
            reconnect_socket_promise = resolve;
        });
        this.reconnect_promise[name] = {
            resolve: reconnect_socket_promise,
            color: color,
        };
        return p;
    };

    getMove = (player) => {
        let socket = player.socket;
        let cancel_request_promise;
        let timeout = undefined;
        let tag = "#斷線";
        this.timer = { release: () => { return true } }
        let p = new Promise(async(resolve, reject) => {
            cancel_request_promise = (cancel_id) => {
                if (cancel_id !== game.CANCEL_OUT_OF_TIME) {
                    this.timer.release();
                }
                try {
                    clearTimeout(timeout);
                } catch (e) {
                    console.log(e);
                }
                reject(cancel_id);
            };

            let disconnect_pack = async() => {
                timeout = setTimeout(() => {
                    this.timer = new timer(this, this.current_player);
                }, 1000 * 60);
                if (this.current_player === this.BLACK) {
                    this.hist[this.hist.length - 1].black.name = this.black.name + tag;
                    Object.values(this.viewers).forEach((viewer) => {
                        viewer.send(
                            viewer_changeColor(
                                this.game_id,
                                this.black.name + tag,
                                this.white.name
                            )
                        );
                    });
                } else {
                    this.hist[this.hist.length - 1].white.name = this.white.name + tag;
                    Object.values(this.viewers).forEach((viewer) => {
                        viewer.send(
                            viewer_changeColor(
                                this.game_id,
                                this.black.name,
                                this.white.name + tag
                            )
                        );
                    });
                }
                socket = await this.reconnect_socket(player.name, this.current_player);
                clearTimeout(timeout);
                this.timer.release();
                tag = "#斷線";
                Object.values(this.viewers).forEach((viewer) => {
                    viewer.send(
                        viewer_changeColor(this.game_id, this.black.name, this.white.name)
                    );
                });
            };
            let restore_pack = () => {
                socket.addEventListener("message", handler);
                socket.addEventListener("close", handler_close);
                socket.send(
                    player_requestMove(this.game_id, this.board, this.current_player)
                );
                this.timer = new timer(this, this.current_player);
            };

            if (socket.readyState === 3) {
                await disconnect_pack();
            }
            let handler = (message) => {
                try {
                    let data = JSON.parse(message.data);
                    if (data.action === "move") {
                        if (
                            data.data.game_id === this.game_id &&
                            data.data.board_check === this.board.toString()
                        ) {
                            if (this.timer.release()) {
                                if (
                                    isValidMove(this.board, this.current_player, [
                                        parseInt(data.data.position.x),
                                        parseInt(data.data.position.y),
                                    ])
                                ) {
                                    resolve([
                                        parseInt(data.data.position.x),
                                        parseInt(data.data.position.y),
                                    ]);
                                    socket.removeEventListener("message", handler);
                                    socket.removeEventListener("close", handler_close);
                                } else {
                                    tag = "#不合法步";
                                    socket.close();
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log("game:getMove", "invalid protocol format");
                    socket.close();
                }
            };
            let handler_close = async() => {
                socket.removeEventListener("message", handler);
                socket.removeEventListener("close", handler_close);
                this.timer.release();
                await disconnect_pack();
                restore_pack();
            };
            restore_pack();
        });
        this.cancel_request = cancel_request_promise;
        return p;
    };
    showBoard = () => {
        console.log(this.game_id);
        for (let y = 0; y < this.board.length; y++) {
            let row = "";
            for (let x = 0; x < this.board[y].length; x++) {
                row += this.board[y][x] + " ";
            }
            console.log(row);
        }
    };
    play = async() => {
        await this.reset();
        return new Promise(async(resolve, reject) => {
            let early_stop = false;
            let early_stop_result = undefined;
            while (this.isEndGame() === undefined) {
                if (getValidMoves(this.board, this.current_player).length === 0) {
                    this.hist_download.push(`${this.current_player === this.BLACK?"B":"W"} P`)
                    this.current_player = -this.current_player;
                }
                if (this.current_player === this.BLACK) {
                    try {
                        this.last_move = await this.getMove(this.black);
                    } catch (e) {
                        if (e === game.CANCEL_OUT_OF_TIME) {
                            early_stop = true;
                            early_stop_result = this.WHITE;
                            break;
                        } else if (e === game.CANCEL_RESTART_GAME) {
                            reject(e);
                            return;
                        } else if (e === game.CANCEL_ASSIGN_WINNER) {
                            reject(e);
                            return;
                        }
                    }
                } else {
                    try {
                        this.last_move = await this.getMove(this.white);
                    } catch (e) {
                        if (e === game.CANCEL_OUT_OF_TIME) {
                            early_stop = true;
                            early_stop_result = this.BLACK;
                            break;
                        } else if (e === game.CANCEL_RESTART_GAME) {
                            reject(e);
                            return;
                        } else if (e === game.CANCEL_ASSIGN_WINNER) {
                            reject(e);
                            return;
                        }
                    }
                }
                try {
                    this.move(this.last_move);
                    let counts = countStones(this.board, this.BLACK, this.WHITE);
                    this.black_stone_count = counts.black;
                    this.white_stone_count = counts.white;
                    this.hist.push({
                        board: JSON.parse(JSON.stringify(this.board)),
                        black: {
                            name: this.black.name,
                            time_limit: Math.ceil(this.black_time_limit / (60 * 1000)),
                            stone_count: this.black_stone_count,
                            win_times: this.black_win_times
                        },
                        white: {
                            name: this.white.name,
                            time_limit: Math.ceil(this.white_time_limit / (60 * 1000)),
                            stone_count: this.white_stone_count,
                            win_times: this.white_win_times
                        },
                    });
                    Object.values(this.viewers).forEach((viewer) => {
                        viewer.send(viewer_updateBoard(this.game_id, this.board, this.last_move));
                        viewer.send(
                            viewer_updateStoneCount(
                                this.game_id,
                                this.black_stone_count,
                                this.white_stone_count
                            )
                        );
                    });
                } catch (e) {
                    continue;
                }
            }
            let counts = countStones(this.board, this.BLACK, this.WHITE);
            this.black_stone_count = counts.black;
            this.white_stone_count = counts.white;
            Object.values(this.viewers).forEach((viewer) => {
                viewer.send(
                    viewer_endGame(
                        this.game_id,
                        Math.ceil(this.black_time_limit / (60 * 1000)),
                        Math.ceil(this.white_time_limit / (60 * 1000)),
                        this.black_stone_count,
                        this.white_stone_count
                    )
                );
            });

            let result = undefined;
            if (early_stop) {
                result = early_stop_result;
            } else {
                result = this.isEndGame();
            }
            if (result === this.BLACK) {
                this.update_scoreboard(this.black.name, 2, this.black_time_limit);
                this.update_scoreboard(this.white.name, 0, this.white_time_limit);
            } else if (result === this.WHITE) {
                this.update_scoreboard(this.black.name, 0, this.black_time_limit);
                this.update_scoreboard(this.white.name, 2, this.white_time_limit);
            } else {
                this.update_scoreboard(this.black.name, 1, this.black_time_limit);
                this.update_scoreboard(this.white.name, 1, this.white_time_limit);
            }
            this.push_hist(this.game_id, this.hist);
            this.push_hist(this.game_id, this.hist_download, "download");
            resolve(result);
        });
    };

    BO1 = async() => {
        return new Promise(async(resolve) => {
            let finish = false;
            while (!finish) {
                finish = true;
                try {
                    let result = await this.play();
                    this.update_win_times(result);
                    this.is_end = true;
                    resolve(result);
                } catch (e) {
                    if (e === game.CANCEL_RESTART_GAME) {
                        this.resetColor();
                        this.hist = [];
                        this.hist_download = [];
                        this.black_win_times = 0;
                        this.white_win_times = 0;
                        finish = false;
                    } else if (e === game.CANCEL_ASSIGN_WINNER) {
                        let counts = countStones(this.board, this.BLACK, this.WHITE);
                        this.black_stone_count = counts.black;
                        this.white_stone_count = counts.white;
                        Object.values(this.viewers).forEach((viewer) => {
                            viewer.send(
                                viewer_endGame(
                                    this.game_id,
                                    Math.ceil(this.black_time_limit / (60 * 1000)),
                                    Math.ceil(this.white_time_limit / (60 * 1000)),
                                    this.black_stone_count,
                                    this.white_stone_count
                                )
                            );
                        });
                        if (this.assign_winner === this.black.name) {
                            this.hist[this.hist.length - 1].black.name =
                                this.black.name + "#指定贏家";
                            this.update_scoreboard(this.black.name, 2, this.black_time_limit);
                            this.update_scoreboard(this.white.name, 0, this.white_time_limit);
                            Object.values(this.viewers).forEach((viewer) => {
                                viewer.send(
                                    viewer_changeColor(
                                        this.game_id,
                                        this.black.name + "#指定贏家",
                                        this.white.name
                                    )
                                );
                            });
                        } else {
                            this.hist[this.hist.length - 1].white.name =
                                this.white.name + "#指定贏家";
                            this.update_scoreboard(this.black.name, 0, this.black_time_limit);
                            this.update_scoreboard(this.white.name, 2, this.white_time_limit);
                            Object.values(this.viewers).forEach((viewer) => {
                                viewer.send(
                                    viewer_changeColor(
                                        this.game_id,
                                        this.black.name,
                                        this.white.name + "#指定贏家"
                                    )
                                );
                            });
                        }
                        this.push_hist(this.game_id, this.hist);
                        this.push_hist(this.game_id, this.hist_download, "download");
                        this.is_end = true;
                        resolve(this.assign_winner);
                    }
                }
            }
        });
    };
    BO3 = async() => {
        return new Promise(async(resolve) => {
            let finish = false;
            while (!finish) {
                finish = true;
                try {
                    this.hist_download.push(`----- B-${this.black.name}VSW-${this.white.name} -----`)
                    let result = await this.play();
                    this.update_win_times(result);
                    this.changeColor();
                    this.hist_download.push(`----- B-${this.black.name}VSW-${this.white.name} -----`)
                    let result_sec = await this.play();
                    this.update_win_times(result_sec);
                    result += -result_sec;
                    if (result === 0) {
                        while (result === 0) {
                            this.changeColor();
                            this.hist_download.push(`----- B-${this.black.name}VSW-${this.white.name} -----`)
                            result = await this.play();
                            this.update_win_times(result);
                        }
                        if (result === 1) {
                            this.is_end = true;
                            resolve(this.black.name);
                        } else {
                            this.is_end = true;
                            resolve(this.white.name);
                        }
                    } else {
                        if (result < 0) {
                            this.is_end = true;
                            resolve(this.black.name);
                        } else {
                            this.is_end = true;
                            resolve(this.white.name);
                        }
                    }
                } catch (e) {
                    if (e === game.CANCEL_RESTART_GAME) {
                        this.resetColor();
                        this.hist = [];
                        this.hist_download = [];
                        this.black_win_times = 0;
                        this.white_win_times = 0;
                        finish = false;
                    } else if (e === game.CANCEL_ASSIGN_WINNER) {
                        if (this.assign_winner === this.black.name) {
                            this.hist[this.hist.length - 1].black.name =
                                this.black.name + "#指定贏家";
                            Object.values(this.viewers).forEach((viewer) => {
                                viewer.send(
                                    viewer_changeColor(
                                        this.game_id,
                                        this.black.name + "#指定贏家",
                                        this.white.name
                                    )
                                );
                            });
                        } else {
                            this.hist[this.hist.length - 1].white.name =
                                this.white.name + "#指定贏家";
                            Object.values(this.viewers).forEach((viewer) => {
                                viewer.send(
                                    viewer_changeColor(
                                        this.game_id,
                                        this.black.name,
                                        this.white.name + "#指定贏家"
                                    )
                                );
                            });
                        }
                        this.push_hist(this.game_id, this.hist);
                        this.push_hist(this.game_id, this.hist_download, "download");
                        resolve(this.assign_winner);
                    }
                }
            }
        });
    };
}

module.exports = { game: game };