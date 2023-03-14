import React, { Component } from "react";
import { hot } from "react-hot-loader";
import ModalButton from "./ModalButton";

class WinnerChooserBody extends Component {
  render() {
    const { game_id, player_a, player_b, doAssignWinner } = this.props;

    return (
      <div className="modal-delete-competition-body">
        <div></div>
        <div></div>
        <ModalButton
          text={player_a}
          onClick={()=>{doAssignWinner(game_id, player_a)}}
          processing={false}
          buttonColor={[240, 240, 240]}
          textColor={[0, 0, 0]}
        ></ModalButton>
        <ModalButton
          text={player_b}
          onClick={()=>{doAssignWinner(game_id, player_b)}}
          processing={false}
          buttonColor={[240, 240, 240]}
          textColor={[0, 0, 0]}
        ></ModalButton>
        <div></div>
        <div></div>
      </div>
    );
  }
}

export default hot(module)(WinnerChooserBody);
