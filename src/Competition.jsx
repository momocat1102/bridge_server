import React, { Component } from "react";
import { hot } from "react-hot-loader";
import CompetitionPrepare from "./Competition/CompetitionPrepare";
import CompetitionStart from "./Competition/CompetitionStart";
import { competition_info, competition_history, ws_connect } from "./api";

class Competition extends Component {
  constructor() {
    super();
    this.state = {
      initialize: false,
      status: "prepare",
      type: "",
      player_list: {},
      game_flow: {},
      trump: {},
      dealer: {},
      board_end: {},
      time_limit: {},
      win_times: {},
      scoreboard: [],
      player_name: {},
      game_tree: undefined,
      history: undefined,
      history_time: undefined,
    };
  }

  onInit = (
    status,
    player_list,
    game_flow,
    trump,
    dealer,
    board_end,
    time_limit,
    win_times,
    scoreboard,
  ) => {
    let tmp = this.state.player_list;
    player_list.forEach((player) => {
      tmp[player] = undefined;
    });
    // console.log(this.state.scoreboard, scoreboard)
    this.setState({
      initialize: true,
      status: status,
      player_list: tmp,
      game_flow: game_flow,
      trump: trump,
      dealer: dealer,
      board_end: board_end,
      time_limit: time_limit,
      win_times: win_times,
      scoreboard: scoreboard,
    });
    // console.log(this.state.scoreboard)
  };

  onAddPlayer = (player_id) => {
    let tmp = this.state.player_list;
    tmp[player_id] = undefined;
    this.setState({ player_list: tmp });
  };
  onRemovePlayer = (player_id) => {
    let tmp = this.state.player_list;
    delete tmp[player_id];
    this.setState({ player_list: tmp });
  };
  onStart = () => {
    this.setState({
      status: "start",
    });
  };
  onUpdateBoard = (game_id, game_flow, trump, dealer) => {
    // console.log(game_flow)
    let tmp = this.state.game_flow;
    tmp[game_id] = game_flow;
    let tmp2 = this.state.board_end;
    tmp2[game_id] = false;
    let tmp3 = this.state.trump;
    tmp3[game_id] = trump;
    let tmp4 = this.state.dealer;
    tmp4[game_id] = dealer;
    this.setState({ game_flow: tmp, board_end: tmp2, trump: tmp3, dealer: tmp4});
    // console.log(this.state.game_flow.value)
    // alert(this.state.game_flow.value)
  };
  onUpdateTimeLimit = (game_id, black_time_limit, white_time_limit) => {
    let tmp = this.state.time_limit;
    tmp[game_id] = { black: black_time_limit, white: white_time_limit };
    this.setState({ time_limit: tmp });
  };
  onUpdateWinTimes = (game_id, black_win_times, white_win_times) => {
    let tmp = this.state.win_times;
    // console.log(tmp);
    tmp[game_id] = { black: black_win_times, white: white_win_times };
    this.setState({ win_times: tmp });
    // console.log(this.state.win_times);
  };
  onUpdateScoreboard = (scoreboard) => {
    this.setState({ scoreboard: scoreboard });
  };
  onUpdateTree = (game_tree) => {
    this.setState({ game_tree: game_tree });
  };
  onEndGame = (game_id) => {
    let tmp = this.state.board_end;
    tmp[game_id] = true;
    this.setState({ board_end: tmp });
  };
  onEndCompetition = () => {};
  onChangeName = (game_id, p1, p2) => {
    let tmp = this.state.player_name;
    tmp[game_id] = {p1: p1, p2: p2};
    this.setState({player_name: tmp});
  } 
  initHistory = async (data) => {
    let tmp_player_list = this.state.player_list;
    data.players.forEach((player) => {
      tmp_player_list[player] = undefined;
    });
    let tmp_history_time = {};
    Object.entries(data.games).map(([key, value]) => {
      tmp_history_time[key] = { time: 0, max: value.length - 1 };
      this.onUpdateBoard(key, value[0].hist);
      this.onUpdateTimeLimit(key, value[0].black.time_limit, value[0].white.time_limit );
      this.onUpdateWinTimes(key, value[0].black.win_times, value[0].white.win_times);
    });
    this.setState({ 
      player_list: tmp_player_list, 
      game_tree: data.game_tree, 
      scoreboard: data.scoreboard,
      history: data.games,
      history_time: tmp_history_time,
      initialize: true,
      status: "ended"
    });
  };
  loadHistory = (game_id, time) => {
    let tmp = this.state.history_time;
    tmp[game_id].time = time;
    this.onUpdateBoard(game_id, this.state.history[game_id][time].hist);
    this.onUpdateTimeLimit(
      game_id,
      this.state.history[game_id][time].time_limit,
      this.state.history[game_id][time].time_limit
    );
    this.onUpdateWinTimes(
      game_id,
      this.state.history[game_id][time].black.win_times,
      this.state.history[game_id][time].white.win_times
    );
    this.setState({ history_time: tmp });
  };
  
  async componentDidMount() {
    try {
      let data = await competition_info(this.props.match.params["id"]);
      data = JSON.parse(data);
      this.setState({
        type: data.type,
      });
      if (data.status === "ended") {
        data = await competition_history(this.props.match.params["id"]);
        data = JSON.parse(data);
        this.initHistory(data);
      } else {
        this.ws = await ws_connect(
          this.props.match.params["id"],
          this.onInit,
          this.onAddPlayer,
          this.onRemovePlayer,
          this.onStart,
          this.onUpdateBoard,
          this.onUpdateTimeLimit,
          this.onUpdateWinTimes,
          this.onUpdateScoreboard,
          this.onUpdateTree,
          this.onEndGame,
          this.onEndCompetition,
          this.onChangeName
        );
      }
    } catch (e) {}
  }
  componentWillUnmount() {
    try {
      this.ws.close();
    } catch (e) {}
  }

  render() {
    return this.state.initialize ? (
      this.state.status !== "prepare" ? (
        <CompetitionStart
          competition_id={this.props.match.params["id"]}
          is_login={this.props.is_login}
          status={this.state.status}
          type={this.state.type}
          player_list={this.state.player_list}
          game_flow={this.state.game_flow}
          trump={this.state.trump}
          dealer={this.state.dealer}
          board_end={this.state.board_end}
          time_limit={this.state.time_limit}
          win_times={this.state.win_times}
          scoreboard={this.state.scoreboard}
          game_tree={this.state.game_tree}
          history_time={this.state.history_time}
          player_name={this.state.player_name}
          loadHistory={this.loadHistory}
        ></CompetitionStart>
      ) : (
        <CompetitionPrepare
          id={this.props.match.params["id"]}
          is_login={this.props.is_login}
          player_list={this.state.player_list}
        ></CompetitionPrepare>
      )
    ) : null;
  }
}

export default hot(module)(Competition);
