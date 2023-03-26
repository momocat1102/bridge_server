import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { remove_player, start_competition } from "../api";

class Competition extends Component {
  constructor(props) {
    super(props);
    // console.log(this.props)
    this.state = {
      starting: false,
    };
  }
  startCompetition = () => {
    console.log("GO")
    this.setState({ starting: true });
    try {
      start_competition(this.props.id);
    } catch (e) {
      alert("啟動失敗");
    }
    this.setState({ starting: false });
  };

  render() {
    // const styles = this.props.id.includes("test") ? null : { visibility: "hidden" };
    return (
      <div className="competition-prepare">
        <div className="id">
          <span>{this.props.id}</span>
        </div>
        <div className="control-bar">
          <div className="user-counter">
            <i className="fa fa-user fa-lg"></i>
            <span>{Object.keys(this.props.player_list).length}</span>
          </div>
          <button
            className="start-button"
            // style={styles}
            onClick={this.startCompetition}
          >
            {this.state.starting ? (
              <i className="far fa-circle-notch fa-spin"></i>
            ) : (
              <span>Start</span>
            )}
          </button>
        </div>
        <div className="connection-list">
          {Object.keys(this.props.player_list).map((player, index) => (
            <div
              key={index}
              className={this.props.is_login ? "player-item-deletable" : null}
              onClick={
                this.props.is_login
                  ? (e) => remove_player(this.props.id, player)
                  : null
              }
            >
              <span>{player}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default hot(module)(Competition);
