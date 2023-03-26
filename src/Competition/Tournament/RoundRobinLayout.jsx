import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Modal from "../../ModalComponents/Modal";
import Board from "../Board";
import { Flipper, Flipped } from "react-flip-toolkit";
import ScoreboardItem from "./ScoreboardItem";
import { restart_game, assign_winner, download_history } from "../../api";
import WinnerChooserBody from "../../ModalComponents/WinnerChooserBody";
import HistoryButtonFooter from "../../ModalComponents/HistoryButtonFooter";

class RoundRobinLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open_modal: false,
      open_modal_winner_chooser: false,
    };
    this.modal_player_a = null;
    this.modal_player_b = null;
    this.open_modal = this.open_modal.bind(this);
    this.open_modal_winner_chooser = this.open_modal_winner_chooser.bind(this);
    this.contextMenuHandler = this.contextMenuHandler.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  
  open_modal(player_a, player_b) {
    this.modal_player_a = player_a;
    this.modal_player_b = player_b;
    // alert(this.props.game_flow);
    this.setState({ open_modal: !this.state.open_modal });
  }
  open_modal_winner_chooser(game_id, player_a, player_b) {
    this.game_id = game_id;
    this.modal_player_a = player_a;
    this.modal_player_b = player_b;
    this.setState({
      open_modal_winner_chooser: !this.state.open_modal_winner_chooser,
    });
  }
  
  async contextMenuHandler(e, data, target) {
    if (data.action === "restart") {
      try {
        await restart_game(
          this.props.competition_id,
          target.getAttribute("game_id")
        );
      } catch (e) {
        alert("重啟失敗");
      }
    } else if (data.action === "assign-winner") {
      this.open_modal_winner_chooser(
        target.getAttribute("game_id"),
        target.getAttribute("player_a"),
        target.getAttribute("player_b")
      );
    }
  }
  doAssignWinner = async (game_id, winner) => {
    try {
      await assign_winner(this.context.competition_id, game_id, winner);
      this.setState({ open_modal_winner_chooser: false });
    } catch (e) {
      console.log(e);
      alert("指派失敗");
    }
  };

  downloadHistory = async (competition_id, game_id, filename) => {
    try {
      await download_history(competition_id, game_id, filename);
    } catch (e) {
      alert("下載失敗");
    }
  };

  handleClick(type, p1, p2, index) {
    this.props.updateState(type, p1, p2, index);
  }

  one2oneScoreboard(){
    let scoreboard = [];
    let p1_score = 0;
    let p2_score = 0;
    let game_1 = this.props.one2onescore[this.props.p1 + "_" + this.props.p2 + "_" + this.props.index];
    let game_2 = this.props.one2onescore[this.props.p2 + "_" + this.props.p1 + "_" + this.props.index];
    if(game_1 !== undefined){
      console.log(game_1, game_1[this.props.p1], game_1[this.props.p2]);
      p1_score += game_1[this.props.p1];
      p2_score += game_1[this.props.p2];
    }
    if(game_2 !== undefined){
      console.log(game_2, game_2[this.props.p1], game_2[this.props.p2]);
      p1_score += game_2[this.props.p1];
      p2_score += game_2[this.props.p2];
    }
    if(p1_score > p2_score){
      scoreboard.push([1, this.props.p1, p1_score]);
      scoreboard.push([2, this.props.p2, p2_score]);
    }else{
      scoreboard.push([1, this.props.p2, p2_score]);
      scoreboard.push([2, this.props.p1, p1_score]);
    }
    // console.log(scoreboard);
    return scoreboard;
  }

  render() {
    const {
      p1,
      p2,
    } = this.props;
    let players = {};
    players[p1] = undefined;
    players[p2] = undefined;
    return (
      <div className="round-robin-layout">
        <button onClick={() => this.handleClick("Playlist", undefined, undefined, 0)}> 上一頁 </button>
        {/* {this.props.one2onescore[this.props.p1 + "_" + this.props.p2 + "_" + this.props.index]} */}
        <Flipper flipKey={this.one2oneScoreboard().join("")}>
          <ul className="scoreboard">
            {this.one2oneScoreboard().map(([order, player, score]) => (
              <Flipped key={player} flipId={player}>
                <li>
                  <ScoreboardItem
                    order={order}
                    id={player}
                    score={score}
                  ></ScoreboardItem>
                </li>
              </Flipped>
            ))}
          </ul>
        </Flipper>
        <table>
          <tbody>
            <tr>
              <td className="table-cell-slash"></td>
              {Object.keys(players).map((player, index) => (
                <td
                  key={index}
                  className="table-freeze-first-row"
                  style={{ backgroundColor: "rgb(200,196,191)" }}
                >
                  {player}
                </td>
              ))}
            </tr>
            {Object.keys(players).map((player_i, index_i) => (
              <tr key={"i_" + index_i}>
                <td
                  className="table-freeze-first-col"
                  style={{ backgroundColor: "rgb(200,196,191)" }}
                >
                  {player_i}
                </td>
                {Object.keys(players).map((player_j, index_j) =>
                  index_i !== index_j ? (
                    <ContextMenuTrigger
                      key={index_i + "_" + index_j}
                      id={
                        (
                          this.props.status !== "end" &&
                          this.props.board_end[player_i + "_" + player_j + "_" + this.props.index] !==
                            undefined) ||
                        (this.props.competition_id.includes("test") &&
                          this.props.record[player_i + "_" + player_j + "_" + this.props.index] !==
                            undefined)
                          ? "contextmenu"
                          : ""
                      }
                      renderTag={"td"}
                      attributes={{
                        onClick: (e) =>
                          this.props.board_end[player_i + "_" + player_j + "_" + this.props.index] !==
                          undefined
                            ? this.open_modal(player_i, player_j)
                            : null,
                        style: { cursor: "pointer" },
                        game_id: `${player_i}_${player_j}`,
                        player_a: player_i,
                        player_b: player_j,
                      }}
                    >
                      {this.props.board_end[player_i + "_" + player_j + "_" + this.props.index] ===
                      undefined
                        ? "未開始"
                        : this.props.board_end[player_i + "_" + player_j + "_" + this.props.index] ===
                            true || this.props.status === "end"
                        ? "已結束"
                        : "(進行中)"}
                        {this.props.board_end[player_i + "_" + player_j + "_" + this.props.index]}
                    </ContextMenuTrigger>
                  ) : (
                    <td key={"j_" + index_j} className="table-cell-slash"></td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {this.state.open_modal && (
          <Modal
            title={""}
            model_content={
              <Board
                p1={
                  this.props.player_name[
                    `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`
                  ] !== undefined
                    ? this.props.player_name[
                        `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`
                      ].p1
                    : this.modal_player_a
                }
                p2={
                  this.props.player_name[
                    `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`
                  ] !== undefined
                    ? this.props.player_name[
                        `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`
                      ].p2
                    : this.modal_player_b
                }
                record={
                  this.props.record[
                    `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`
                  ]
                  // `${this.modal_player_a}_${this.modal_player_b}_${this.props.index}`]
                }
              ></Board>
            }
            model_footer={
              this.props.status === "end" ? (
                <HistoryButtonFooter
                  history_time={this.props.history_time}
                  game_id={this.modal_player_a + "_" + this.modal_player_b + "_" + this.props.index}
                  loadHistory={this.props.loadHistory}
                ></HistoryButtonFooter>
              ) : (
                <div></div>
              )
            }
            width={"52%"}
            margin_top={"1%"}
            close={this.open_modal}
            download={this.props.status === "end" ? true : false}
            download_cb={(e) =>
              this.downloadHistory(
                this.props.competition_id,
                this.modal_player_a + "_" + this.modal_player_b + "_" + this.props.index,
                `B-${this.modal_player_a}VSW-${this.modal_player_b}`
              )
            }
          ></Modal>
        )}
        <ContextMenu id="contextmenu">
          <MenuItem
            onClick={this.contextMenuHandler}
            data={{ action: "restart" }}
          >
            重新開始
          </MenuItem>
          <MenuItem
            onClick={this.contextMenuHandler}
            data={{ action: "assign-winner" }}
          >
            指定贏家
          </MenuItem>
        </ContextMenu>
        {this.state.open_modal_winner_chooser && (
          <Modal
            title={"選擇贏家"}
            model_content={
              <WinnerChooserBody
                game_id={this.game_id}
                player_a={this.modal_player_a}
                player_b={this.modal_player_b}
                doAssignWinner={this.doAssignWinner}
              ></WinnerChooserBody>
            }
            model_footer={<div></div>}
            width={"35%"}
            margin_top={"10%"}
            close={this.open_modal_winner_chooser}
          ></Modal>
        )}
        </div>
    );

  }
}

export default hot(module)(RoundRobinLayout);


          