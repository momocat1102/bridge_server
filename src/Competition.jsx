import React, { Component } from "react";
import { hot } from "react-hot-loader";
import CompetitionPrepare from "./Competition/CompetitionPrepare";
import CompetitionStart from "./Competition/CompetitionStart";
import RoundRobinLayout from "./Competition/Tournament/RoundRobinLayout";
import { competition_info, competition_history, ws_connect } from "./api";
// import {DataProvider} from "./context"
class Competition extends Component {
  constructor() {
    super();
    this.state = {
      initialize: false,
      competition_end: false,
      status: "prepare",
      type: "",
      player_list: {},
      record: {},
      num: 0,
      board_end: {},
      scoreboard: [],
      one2onescore: {},
      player_name: {},
      game_tree: undefined,
      history: undefined,
      history_time: undefined,
    };
  }

  onInit = (
    status,
    player_list,
    record,
    board_end,
    scoreboard,
    one2onescore,
    num
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
      record: record,
      board_end: board_end,
      scoreboard: scoreboard,
      one2onescore: one2onescore,
      num: num
    });
    console.log(this.state)
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
  onUpdateBoard = (game_id, record) => {
    let tmp = this.state.record;
    let tmp2 = this.state.board_end;
    tmp[game_id] = record;
    tmp2[game_id] = false;
    this.setState({ record: tmp, board_end: tmp2 });
  };
  onUpdateScoreboard = (scoreboard) => {
    this.setState({ scoreboard: scoreboard });
  };
  onUpdateone2oneScoreboard = (one2onescore) => {
    this.setState({ one2onescore: one2onescore });
  }

  onUpdateTree = (game_tree) => {
    this.setState({ game_tree: game_tree });
  };
  onEndGame = (game_id) => {
    let tmp = this.state.board_end;
    tmp[game_id] = true;
    this.setState({ board_end: tmp });
  };
  onEndCompetition = () => {
    this.setState({ competition_end: true });
  };
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
    });
    this.setState({ 
      player_list: tmp_player_list, 
      game_tree: data.game_tree, 
      scoreboard: data.scoreboard,
      one2onescore: data.one2onescore,
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
    // this.onUpdateTimeLimit(
    //   game_id,
    //   this.state.history[game_id][time].time_limit,
    //   this.state.history[game_id][time].time_limit
    // );
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
          this.onUpdateScoreboard,
          this.onUpdateone2oneScoreboard,
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
    return (
      this.state.initialize ? (
        this.state.status !== "prepare" ? (
          <CompetitionStart
            competition_id={this.props.match.params["id"]}
            is_login={this.props.is_login}
            status={this.state.status}
            type={this.state.type}
            player_list={this.state.player_list}
            record={this.state.record}
            board_end={this.state.board_end}
            scoreboard={this.state.scoreboard}
            one2onescore={this.state.one2onescore}
            game_tree={this.state.game_tree}
            history_time={this.state.history_time}
            loadHistory={this.loadHistory}
            player_name={this.state.player_name}
            num={this.state.num}
            competition_end={this.state.competition_end}
          />
          ) : (
            <CompetitionPrepare
              id={this.props.match.params["id"]}
              is_login={this.props.is_login}
              player_list={this.state.player_list}
            />
          )
        ) : null
      );
    
  }
}

export default hot(module)(Competition);