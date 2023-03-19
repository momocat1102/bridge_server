import React, { Component } from "react";
import { hot } from "react-hot-loader";
import RoundRobinLayout from "./Tournament/RoundRobinLayout";
import KnockoutLayout from "./Tournament/KnockoutLayout";

class CompetitionStart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: props.type,
    };
  }

  renderTournament() {
    switch (this.state.type) {
      case "round-robin":
        return (
          <RoundRobinLayout
            competition_id={this.props.competition_id}
            is_login={this.props.is_login}
            status={this.props.status}
            player_list={this.props.player_list}
            record={this.props.record}
            board_end={this.props.board_end}
            scoreboard={this.props.scoreboard}
            history_time={this.props.history_time}
            loadHistory={this.props.loadHistory}
            player_name={this.props.player_name}
          ></RoundRobinLayout>
        );
      // case "knockout":
      //   return (
      //     <KnockoutLayout
      //       competition_id={this.props.competition_id}
      //       is_login={this.props.is_login}
      //       board_size={this.props.board_size}
      //       status={this.props.status}
      //       player_list={this.props.player_list}
      //       board={this.props.board}
      //       last_move={this.props.last_move}
      //       time_limit={this.props.time_limit}
      //       stone_count={this.props.stone_count}
      //       win_times={this.props.win_times}
      //       game_tree={this.props.game_tree}
      //       player_color={this.props.player_color}
      //       history_time={this.props.history_time}
      //       loadHistory={this.props.loadHistory}
      //     ></KnockoutLayout>
      //   );
      default:
        return null;
    }
  }
  render() {
    return <div className="competition-start">{this.renderTournament()}</div>;
  }
}

export default hot(module)(CompetitionStart);
