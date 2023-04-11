import React, { Component } from "react";
import { hot } from "react-hot-loader";

class ScoreboardItem extends Component {
  render() {
    const {order, id, score, color} = this.props
    return (
      <div className="scoreboard-item" style={{border: "solid 2px #" + color}}>
        <div className="player-id">{order+". "+id}</div>
        <div>Score: {score}</div>
      </div>
    );
  }
}

export default hot(module)(ScoreboardItem);
