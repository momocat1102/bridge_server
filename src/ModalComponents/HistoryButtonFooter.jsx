import React, { Component } from "react";
import { hot } from "react-hot-loader";

class LoginFooter extends Component {
  render() {
    return (
      <div className="modal-board-footer">
        <button
          {...(this.props.history_time[this.props.game_id].time === 0
            ? { disabled: true }
            : {})}
          onClick={(e) =>
            this.props.loadHistory(
              this.props.game_id,
              this.props.history_time[this.props.game_id].time - 1
            )
          }
        >
          <i className="far far fa-angle-left fa-2x"></i>
        </button>
        <div>　　</div>
        <button
          {...(this.props.history_time[this.props.game_id].time ===
          this.props.history_time[this.props.game_id].max
            ? { disabled: true }
            : {})}
          onClick={(e) =>
            this.props.loadHistory(
              this.props.game_id,
              this.props.history_time[this.props.game_id].time + 1
            )
          }
        >
          <i className="far far fa-angle-right fa-2x"></i>
        </button>
      </div>
    );
  }
}

export default hot(module)(LoginFooter);
