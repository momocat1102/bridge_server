import config from "./config.json";

const login = async (username, password) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    fetch(config.server_url + "/admin_login", {
      method: "POST",
      header: { "Content-Type": "multipart/form-data" },
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          return res.text();
        } else {
          reject();
        }
      })
      .then((token) => {
        window.localStorage.setItem("token", token);
        resolve(token);
      });
  });
};
// ''' '''
const competition_list = async () => {
  return new Promise((resolve, reject) => {
    fetch(config.server_url + "/competition_list", {
      method: "POST",
    })
      .then((res) => {
        if (res.ok) {
          return res.text();
        } else {
          reject();
        }
      })
      .then((data) => {
        resolve(data);
      });
  });
};

const competition_history = async (competition_id) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("competition_id", competition_id);
    fetch(config.server_url + "/competition_history", { 
      method: "POST",
      header: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          return res.text();
        } else {
          reject();
        }
      })
      .then((data) => {
        resolve(data);
      });
  });
};

const download_history = async (competition_id, game_id, filename) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("competition_id", competition_id);
    formData.append("game_id", game_id);
    fetch(config.server_url + "/download_history", {
      method: "POST",
      header: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          return res.blob();
        } else {
          reject();
        }
      })
      .then((blob) => {
        if (blob !== undefined) {
          require("downloadjs")(blob, filename, "text/plain");
          resolve();
        }
      });
  });
};

const create_competition = async (name, type, time_limit, board_size) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("competition_name", name);
    formData.append("competition_type", type);
    formData.append("time_limit", time_limit);
    formData.append("board_size", board_size);
    formData.append(
      "Authorization",
      "Bearer " + window.localStorage.getItem("token")
    );
    fetch(config.server_url + "/create_competition", {
      method: "POST",
      header: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    }).then((res) => {
      if (res.ok) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

const delete_competition = async (name) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("competition_name", name);
    formData.append(
      "Authorization",
      "Bearer " + window.localStorage.getItem("token")
    );
    fetch(config.server_url + "/delete_competition", {
      method: "POST",
      header: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    }).then((res) => {
      if (res.ok) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

const competition_info = async (competition_name) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("competition_name", competition_name);
    fetch(config.server_url + "/competition_info", {
      method: "POST",
      header: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          return res.text();
        } else {
          reject();
        }
      })
      .then((data) => {
        resolve(data);
      });
  });
};

const ws_connect = async (
  competition_name,
  onInit,
  onAddPlayer,
  onRemovePlayer,
  onStart,
  onUpdateBoard,
  onUpdateScoreboard,
  onUpdateone2oneScoreboard,
  onUpdateTree,
  onEndGame,
  onEndCompetition,
  onChangeName
) => {
  return new Promise((resolve, reject) => {
    let ws = new WebSocket(config.wss_url);
    ws.onopen = () => {
      console.log("open connection");
      resolve(ws);
      let join = {
        action: "join",
        data: {
          source: "viewer",
          competition: competition_name,
        },
      };
      ws.send(JSON.stringify(join));
    };
    
    ws.onmessage = (event) => {
      let data = JSON.parse(event.data);
      if (data.action === "init") {
        onInit(
          data.data.status,
          data.data.player_list,
          data.data.record,
          data.data.board_end,
          data.data.scoreboard,
          data.data.one2onescore,
          data.data.num
        );
      } else if (data.action === "add_player") {
        onAddPlayer(data.data);
      } else if (data.action === "remove_player") {
        onRemovePlayer(data.data);
      } else if (data.action === "start") {
        onStart();
      } else if (data.action === "update_board") {
        // console.log(data.data.game_flow);
        onUpdateBoard(
          data.data.game_id,
          data.data.record
        );
      } else if (data.action === "update_score_board") {
        // alert(data.data.scoreboard);
        onUpdateScoreboard(data.data.scoreboard);
        // console.log(data.data.scoreboard)
      } else if (data.action === "update_one2one_score_board") {
        onUpdateone2oneScoreboard(data.data.scoreboard);
      } else if (data.action === "update_tree") {
        onUpdateTree(data.data.game_tree);
      } else if (data.action === "end_game") {
        onEndGame(data.data.game_id);
      } else if (data.action === "end_competition") {
        onEndCompetition();
      } else if(data.action === "change_name") {
        onChangeName(data.data.game_id, data.data.p1, data.data.p2);
      }
    };
    ws.onclose = () => {
      console.log("close connection");
    };
  });
};

const remove_player = async (competition_id, player_id) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("competition", competition_id);
    formData.append("player", player_id);
    formData.append(
      "Authorization",
      "Bearer " + window.localStorage.getItem("token")
    );
    fetch(config.server_url + "/remove_player", {
      method: "POST",
      header: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    }).then((res) => {
      if (res.ok) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

// http://127.0.0.1:8082/start_competition
const start_competition = async (competition_id) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("competition_name", competition_id);
    formData.append(
      "Authorization",
      "Bearer " + window.localStorage.getItem("token")
    );
    fetch(config.server_url + "/start_competition", { // config.server_url + "/start_competition"
      method: "POST",
      header: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    }).then((res) => {
      if (res.ok) {
        resolve();
      } else {
        reject();
      }
    });
  });
};

const restart_game = async (competition_id, game_id) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("competition_name", competition_id);
    formData.append("game_id", game_id);
    formData.append(
      "Authorization",
      "Bearer " + window.localStorage.getItem("token")
    );
    fetch(config.server_url + "/restart_game", {
      method: "POST",
      header: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          return res.text();
        } else {
          reject();
        }
      })
      .then((data) => {
        resolve(data);
      });
  });
};

const assign_winner = async (competition_id, game_id, winner) => {
  return new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.append("competition_name", competition_id);
    formData.append("game_id", game_id);
    formData.append("winner", winner);
    formData.append(
      "Authorization",
      "Bearer " + window.localStorage.getItem("token")
    );
    fetch(config.server_url + "/assign_winner", {
      method: "POST",
      header: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })
      .then((res) => {
        if (res.ok) {
          return res.text();
        } else {
          reject();
        }
      })
      .then((data) => {
        resolve(data);
      });
  });
};

export {
  login,
  competition_list,
  competition_history,
  download_history,
  create_competition,
  delete_competition,
  competition_info,
  ws_connect,
  remove_player,
  start_competition,
  restart_game,
  assign_winner,
};
