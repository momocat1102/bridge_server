function getValidMoves(board, color) {
    let moves = [];
    let moves_unique_check = {};
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] === color) {
                [
                    [1, 1],
                    [1, 0],
                    [1, -1],
                    [0, -1],
                    [-1, -1],
                    [-1, 0],
                    [-1, 1],
                    [0, 1],
                ].forEach((direction) => {
                    let flips = [];
                    for (let size = 1; size < board.length; size++) {
                        let ydir = y + direction[1] * size;
                        let xdir = x + direction[0] * size;
                        if (
                            xdir >= 0 &&
                            xdir < board.length &&
                            ydir >= 0 &&
                            ydir < board.length
                        ) {
                            if (board[ydir][xdir] == -color) {
                                flips.push([ydir, xdir]);
                            } else if (board[ydir][xdir] == 0) {
                                if (flips.length != 0) {
                                    if (moves_unique_check[ydir] === undefined) {
                                        moves_unique_check[ydir] = [];
                                    }
                                    if (!moves_unique_check[ydir].includes(xdir)) {
                                        moves.push([ydir, xdir]);
                                        moves_unique_check[ydir].push(xdir);
                                    }
                                }
                                break;
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                });
            }
        }
    }
    return moves;
}

function isValidMove(board, color, position) {
    let valids = getValidMoves(board, color);
    if (valids.length != 0) {
        let position_in_valids = false;
        for (let i = 0; i < valids.length; i++) {
            let valid = valids[i];
            if (valid[0] === position[0] && valid[1] === position[1]) {
                position_in_valids = true;
                break;
            }
        }
        return position_in_valids;
    } else {
        return false;
    }
}

function executeMove(board, color, position) {
    let y = position[0],
        x = position[1];
    board[y][x] = color;
    [
        [1, 1],
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, 1],
    ].forEach((direction) => {
        let flips = [];
        let valid_route = false;
        for (let size = 1; size < board.length; size++) {
            let ydir = y + direction[1] * size;
            let xdir = x + direction[0] * size;
            if (
                xdir >= 0 &&
                xdir < board.length &&
                ydir >= 0 &&
                ydir < board.length
            ) {
                if (board[ydir][xdir] == -color) {
                    flips.push([ydir, xdir]);
                } else if (board[ydir][xdir] == color) {
                    if (flips.length > 0) {
                        valid_route = true;
                    }
                    break;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        if (valid_route) {
            flips.forEach((flip) => {
                board[flip[0]][flip[1]] = color;
            });
        }
    });
    return board;
}

function countStones(board, BLACK_id, WHITE_id) {
    let black_counts = 0,
        white_counts = 0;
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] == BLACK_id) {
                black_counts += 1;
            } else if (board[y][x] == WHITE_id) {
                white_counts += 1;
            }
        }
    }
    return { black: black_counts, white: white_counts }
};

module.exports = {
    getValidMoves: getValidMoves,
    isValidMove: isValidMove,
    executeMove: executeMove,
    countStones: countStones
};