import React, { Component } from "react";
import { hot } from "react-hot-loader";
import RoundRobinLayout from "./Tournament/RoundRobinLayout";
import PlayList from "./PlayList";
import Board from "./Board";

class CompetitionStart extends Component {
  constructor(props) {
    super(props);
    console.log(this.props.record["test1_test2_0"]);
    this.state = {
      type: "Playlist",
      p1: undefined,
      p2: undefined,
      index: 0
    };

    console.log(this.state)
  }

  updateState = (type, p1, p2, index) => {
    this.setState({ type: type, 
                    p1: p1, 
                    p2: p2, 
                    index: index});
  };

  renderTournament() {
    switch (this.state.type) {
      case "Playlist":
        return (
          <PlayList
            type={this.state.type}
            competition_id={this.props.competition_id}
            is_login={this.props.is_login}
            status={this.props.status}
            player_list={this.props.player_list}
            record={this.props.record}
            board_end={this.props.board_end}
            scoreboard={this.props.scoreboard}
            one2onescore={this.props.one2onescore}
            history_time={this.props.history_time}
            // loadHistory={this.props.loadHistory}
            player_name={this.props.player_name}
            num={this.props.num}
            competition_end={this.props.competition_end}
            updateState={this.updateState}
            p1={this.state.p1}
            p2={this.state.p2}
            index={this.state.index}
          ></PlayList>
          
        );
      case "round-robin":
        return (
          <Board
                p1={
                  "test1"
                  // ] !== undefined
                  //   ? this.props.player_name[
                  //       `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`
                  //     ].p1
                  //   : this.modal_player_a
                }
                p2={
                  "test2"
                  // this.props.player_name[
                  //   `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`
                  // ] !== undefined
                  //   ? this.props.player_name[
                  //       `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`
                  //     ].p2
                  //   : this.modal_player_b
                }
                record={
                  this.props.record["test1_test2_0"]
                  // this.props.record[
                  //   `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`
                  // ]
                  // `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`]
                }
          ></Board>
          // <RoundRobinLayout
          //   type={this.state.type}
          //   competition_id={this.props.competition_id}
          //   is_login={this.props.is_login}
          //   status={this.props.status}
          //   player_list={this.props.player_list}
          //   record={this.props.record}
          //   board_end={this.props.board_end}
          //   scoreboard={this.props.scoreboard}
          //   one2onescore={this.props.one2onescore}
          //   history_time={this.props.history_time}
          //   // loadHistory={this.props.loadHistory}
          //   player_name={this.props.player_name}
          //   num={this.props.num}
          //   updateState={this.updateState}
          //   p1={this.state.p1}
          //   p2={this.state.p2}
          //   index={this.state.index}
          // ></RoundRobinLayout>
        );
      default:
        return null;
    }
  }
  render() {
    return <div className="competition-start">{this.renderTournament()}</div>;
  }
}

export default hot(module)(CompetitionStart);
