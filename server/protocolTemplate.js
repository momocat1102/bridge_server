
const player_start = (game_id, color) => {
    return JSON.stringify({
        action: "start",
        data: {
            game_id: game_id,
            color: color,
        },
    });
};
const player_invalidEmail = () => {
    return JSON.stringify({
        action: "invalid_email"
    });
};

const player_requestChooseColor = (game_id) => {
    return JSON.stringify({
        action: "request_choose_color",
        data: {
            game_id: game_id,
        },
    });
}

const player_init = (game_id, color) => {
    return JSON.stringify({
        action: "init",
        data: {
            game_id: game_id,
            color: color
        },
    });
}

const viewer_addPlayer = (player_id) => {
    return JSON.stringify({
        action: "add_player",
        data: player_id,
    });
};
const viewer_removePlayer = (player_id) => {
    return JSON.stringify({
        action: "remove_player",
        data: player_id,
    });
};
const viewer_init = (status, player_list, record, board_end, scoreboard) => {
    return JSON.stringify({
        action: "init",
        data: {
            status: status,
            player_list: player_list,
            record: record,
            board_end: board_end,
            scoreboard: scoreboard,
        },
    });
};

const viewer_start = () => {
    return JSON.stringify({
        action: "start"
    });
};
const viewer_updateBoard = (game_id, record) => {
    return JSON.stringify({
        action: "update_board",
        data: {
            game_id: game_id,
            record: record,
        },
    });
};
// const viewer_UpdateTree = (game_tree) => {
//     return JSON.stringify({
//         action: "update_tree",
//         data: {
//             game_tree: game_tree,
//         },
//     });
// };
// const viewer_updateTimeLimit = (game_id, black_time_limit, white_time_limit) => {
//     return JSON.stringify({
//         action: "update_time_limit",
//         data: {
//             game_id: game_id,
//             black_time_limit: black_time_limit,
//             white_time_limit: white_time_limit
//         },
//     });
// }
// const viewer_updateStoneCount = (game_id, black_stone_count, white_stone_count) => {
//     return JSON.stringify({
//         action: "update_stone_count",
//         data: {
//             game_id: game_id,
//             black_stone_count: black_stone_count,
//             white_stone_count: white_stone_count
//         },
//     });
// }
// const viewer_updateWinTimes = (game_id, black_win_times, white_win_times) => {
//     return JSON.stringify({
//         action: "update_win_times",
//         data: {
//             game_id: game_id,
//             black_win_times: black_win_times,
//             white_win_times: white_win_times
//         },
//     });
// }
const viewer_updateScoreboard = (scoreboard) => {
    return JSON.stringify({
        action: "update_score_board",
        data: {
            scoreboard: scoreboard
        },
    });
}
const viewer_endGame = (game_id) => {
    return JSON.stringify({
        action: "end_game",
        data: {
            game_id: game_id,
        },
    });
};
const viewer_endCompetition = () => {
    return JSON.stringify({
        action: "end_competition"
    });
};

const viewer_changeName = (game_id, p1, p2) => {
    return JSON.stringify({
        action: "change_name",
        data: {
            game_id: game_id,
            p1: p1,
            p2: p2
        }
    });
};

module.exports = {
    player_start: player_start,
    player_invalidEmail: player_invalidEmail,
    player_requestChooseColor: player_requestChooseColor,
    player_init: player_init,
    viewer_addPlayer: viewer_addPlayer,
    viewer_endGame: viewer_endGame,
    viewer_init: viewer_init,
    viewer_removePlayer: viewer_removePlayer,
    viewer_start: viewer_start,
    viewer_updateBoard: viewer_updateBoard,
    // viewer_updateTimeLimit: viewer_updateTimeLimit,
    // viewer_updateStoneCount: viewer_updateStoneCount,
    // viewer_updateWinTimes: viewer_updateWinTimes,
    viewer_updateScoreboard: viewer_updateScoreboard,
    // viewer_UpdateTree: viewer_UpdateTree,
    viewer_endCompetition: viewer_endCompetition,
    viewer_changeName: viewer_changeName
};