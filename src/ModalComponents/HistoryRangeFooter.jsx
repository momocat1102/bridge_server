import React, { Component } from "react";
import { hot } from "react-hot-loader";

class LoginFooter extends Component {
  render() {
    return (
      <div className="modal-board-footer">
        <input
          type="range"
          min="0"
          max={this.props.max}
          value={this.props.time}
          onChange={(e) =>
            this.props.loadHistory(this.props.game_id, e.target.value)
          }
        ></input>
      </div>
    );
  }
}

export default hot(module)(LoginFooter);
