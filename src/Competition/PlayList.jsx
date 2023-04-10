import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Modal from "../ModalComponents/Modal";
import Board from "./Board";
import { Flipper, Flipped } from "react-flip-toolkit";
import ScoreboardItem from "./Tournament/ScoreboardItem";
import { assign_winner, download_history } from "../api";
import WinnerChooserBody from "../ModalComponents/WinnerChooserBody";
import HistoryButtonFooter from "../ModalComponents/HistoryButtonFooter";

class PlayList extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      open_modal: false,
      open_modal_winner_chooser: false,
      zipFile: null,
      download: "下載對局資料",
      showBoards: [],
      numBoard: 0,
    };
    this.modal_player_a = null;
    this.modal_player_b = null;
    this.open_modal = this.open_modal.bind(this);
    this.open_modal_winner_chooser = this.open_modal_winner_chooser.bind(this);
    this.contextMenuHandler = this.contextMenuHandler.bind(this);
  }


  open_modal(player_a, player_b, nu) {
    this.modal_player_a = player_a;
    this.modal_player_b = player_b;
    // alert(this.props.game_flow);
    this.setState({ 
      open_modal: !this.state.open_modal,
      numBoard: nu
    });
    console.log(player_a + "-->" + player_b + "-->" + nu);
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
    if (data.action === "assign-winner") {
      this.open_modal_winner_chooser(
        target.getAttribute("game_id"),
        target.getAttribute("player_a"),
        target.getAttribute("player_b")
      );
    }
  }

  doAssignWinner = async (game_id, winner) => {
    try {
      await assign_winner(this.props.competition_id, game_id, winner);
      this.setState({ open_modal_winner_chooser: false });
    } catch (e) {
      console.log(e);
      alert("指派失敗");
    }
  };

  downloadHistory = async () => {
    try {
      await download_history(this.props.competition_id);
    } catch (e) {
      alert("下載失敗");
    }
  };

  totalScore = (player1, player2) => {
    let totalScore = Object.keys(this.props.one2onescore).reduce((acc, key) => {
      if (key.includes(player1 + "_" + player2) || key.includes(player2 + "_" + player1)) {
        acc += this.props.one2onescore[key][player1];
      }
      return acc;
    }, 0);
    return totalScore;
  }

  finallScore = (player) => {
    let totalScore = Array.from(this.props.scoreboard).reduce((acc, index) => {
      if (index[1] === player) {
        acc += index[2];
      }
      return acc;
    }, 0);
    return totalScore;
  }

  win_game = (game_id) => {
    let win_game = this.props.record[game_id].winner;
    console.log(this.state);
    if (win_game === this.state.showBoards[0]) {
      return <apan style={{ color: "blue"}}>"已結束"</apan>;
    }
    else if (win_game === this.state.showBoards[1]) {
      return <apan style={{ color: "red"}}>"已結束"</apan>;
    }
    else {
      return <apan style={{ color: "green"}}>"未結束"</apan>;
    }
  }

  one2oneScoreboard(p, ps, index) {
    let p1 = p;
    let p2 = ps[(p === ps[0] ? 1 : 0)];
    let p1_score = 0;
    let p2_score = 0;
    let game_1 = this.props.one2onescore[p1 + "_" + p2 + "_" + index];
    let game_2 = this.props.one2onescore[p2 + "_" + p1 + "_" + index];
    if(game_1 !== undefined){
      // console.log(game_1, game_1[p1], game_1[p2]);
      p1_score += game_1[p1];
      p2_score += game_1[p2];
    }
    if(game_2 !== undefined){
      // console.log(game_2, game_2[p1], game_2[p2]);
      p1_score += game_2[p1];
      p2_score += game_2[p2];
    }
    return p1_score;
  }

  Goback = () => {
    this.setState({ showBoards: [] });
  }

  board_table() {
    let player_i = "";
    let player_j = "";
    let score = 0;
    if (this.state.showBoards.length !== 0) {
      return <>
        <table className="table_bear margintop_50">
          <tbody>
            <tr>
              <td className="table_bear_hr width_10" style={{ backgroundColor: "rgb(0,139,139)" }}>No.</td>
              {this.state.showBoards.map((player, index) => (
                <>
                  <td
                    key={"h_" + index}
                    className="table_bear_hr width_30" 
                    style={{ backgroundColor: "rgb(0,139,139)" }}
                  >
                    {index === 0 ? <apan style={{ color: "blue"}}>{player}</apan> : <apan style={{ color: "red"}}>{player}</apan>}
                  </td>
                  <td className="table_bear_hr width_15" style={{ backgroundColor: "rgb(0,139,139)" }}>Score</td>
                </>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="div_height width_100">
          <table className="table_bear">
            <tbody>
              {Array.from(Array(this.props.num).keys()).map((_, id) => (
                <tr key={"r_" + id}>
                  <td key={"d_" + id} className="table_bear_tr1 width_10">
                    {id + 1}
                  </td>
                  {this.state.showBoards.map((player, index) => (
                    player_i = player,
                    player_j = this.state.showBoards[(player === this.state.showBoards[0] ? 1 : 0)],
                    score = this.one2oneScoreboard(player_i, this.state.showBoards, id + 1),
                    <>
                      <ContextMenuTrigger
                        key={"p_" + id + "_" + index}
                        id={
                          (
                            this.props.status !== "end" &&
                            this.props.board_end[player_i + "_" + player_j + "_" + (id + 1)] !==
                              undefined) ||
                          (this.props.competition_id.includes("test") &&
                            this.props.record[player_i + "_" + player_j + "_" + (id + 1)] !==
                              undefined)
                            ? "contextmenu"
                            : ""
                        }
                        renderTag={"td"}
                        attributes={{
                          onClick: (e) =>
                            this.props.board_end[player_i + "_" + player_j + "_" + (id + 1)] !==
                            undefined
                              ? this.open_modal((index === 0 ? player_j : player_i), (index === 0 ? player_i : player_j), (id + 1))
                              : null,
                          style: { cursor: "pointer", borderStyle: "none", width: "30%" },
                          game_id: `${player_i}_${player_j}_${id + 1}`,
                          player_a: player_i,
                          player_b: player_j,
                        }}
                      >
                        {this.props.board_end[player_i + "_" + player_j + "_" + (id + 1)] ===
                        undefined
                          ? "未開始"
                          : this.props.board_end[player_i + "_" + player_j + "_" + (id + 1)] ===
                              true || this.props.status === "end"
                          ? this.win_game(`${player_i}_${player_j}_${id + 1}`) //`${player_i}_${player_j}_${id + 1}`
                          : "(進行中)"}
                          {/* {this.props.board_end[player_i + "_" + player_j + "_" + (id + 1)]} */}
                      </ContextMenuTrigger>
                      <td key={"s_" + id + "_" + index} className="table_bear_tr1 width_15">
                        {score}
                      </td>
                    </>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <table className="table_bear">
          <tbody>
            <tr>
              <td className="table_bear_tr1 width_10" style={{ backgroundColor: "rgb(165,212,212)" }}>Total</td>
              {this.state.showBoards.map((player, index) => (
                <>
                  <td className="table_bear_tr1 width_30" style={{ backgroundColor: "rgb(165,212,212)" }}></td>
                  <td className="table_bear_tr1 width_15" style={{ backgroundColor: "rgb(165,212,212)", paddingRight: "15px" }}>
                    {this.finallScore(player)}
                  </td>
                </>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="btn_bottom">
          <button className="btn" onClick={this.Goback}>Go Back</button>
        </div>
        {this.state.open_modal && (
          <Modal
            title={""}
            model_content={
              <Board
                p1={
                  this.props.player_name[
                    `${this.modal_player_a}_${this.modal_player_b}_${this.state.numBoard}`
                  ] !== undefined
                    ? this.props.player_name[
                        `${this.modal_player_a}_${this.modal_player_b}_${this.state.numBoard}`
                      ].p1
                    : this.modal_player_a
                }
                p2={
                  this.props.player_name[
                    `${this.modal_player_a}_${this.modal_player_b}_${this.state.numBoard}`
                  ] !== undefined
                    ? this.props.player_name[
                        `${this.modal_player_a}_${this.modal_player_b}_${this.state.numBoard}`
                      ].p2
                    : this.modal_player_b
                }
                record={
                  this.props.record[
                    `${this.modal_player_a}_${this.modal_player_b}_${this.state.numBoard}`
                  ]
                }
                close = {this.open_modal}
              ></Board>
            }
            model_footer={
              <div></div>              
            }
            width={"100%"}
            margin_top={"-53px"}
            close={this.open_modal}
            
          ></Modal>
        )}
        <ContextMenu id="contextmenu">
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
      </>
    }
    else {
      return <>
          <Flipper flipKey={this.props.scoreboard.join("")}>
            <ul className="scoreboard">
              {this.props.scoreboard.map(([order, player, score]) => (
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
          <table className="table_bear">
            <tbody>
              <tr>
                <td className="width_25 table_bear_hr" style={{ backgroundColor: "rgb(0,139,139)" }}></td>
                {Object.keys(this.props.player_list).map((player, index) => (
                  <td
                    key={index}
                    className="width_25 table_bear_hr"
                    style={{ backgroundColor: "rgb(0,139,139)" }}
                  >
                    {player}
                  </td>
                ))}
                <td
                    className="width_25 table_bear_hr"
                    style={{ backgroundColor: "rgb(0,139,139)" }}
                  >
                    Score
                  </td>
              </tr>
              {Object.keys(this.props.player_list).map((player_i, index_i) => (
                <tr key={"i_" + index_i}>
                  <td className="table_bear_tr"
                    style={{ backgroundColor: "rgb(165,212,212)" }}
                  >
                    {player_i}
                  </td>
                  {Object.keys(this.props.player_list).map((player_j, index_j) =>
                    index_i !== index_j ? (
                      <ContextMenuTrigger 
                        key={index_i + "_" + index_j}
                        id={""}
                        renderTag={"td"}
                        attributes={{
                          onClick: (e) => 
                            this.setState({ showBoards: [player_i, player_j] }),
                          style: { cursor: "pointer", backgroundColor: "white", border: "solid 3px rgb(244,244,244)" },
                        }}
                      >
                        {this.totalScore(player_i, player_j)}
                      </ContextMenuTrigger>
                    ) : (
                      <td 
                        key={"j_" + index_j} 
                        className="table-cell-slash" 
                        style={{backgroundColor: "white", border: "solid 3px rgb(244,244,244)" }}></td>
                    )
                  )}
                  <td style={{backgroundColor: "rgb(200,196,191)", border: "solid 3px rgb(244,244,244)" }}>
                    {this.finallScore(player_i)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {
            this.props.status === "ended"?
            <span onClick={this.downloadHistory}>
              對局資料下載 <i className="fas fa-download fa-xs"></i>
            </span>
            // <div></div>// this.downloadHistory(this.props.competition_id, this.props.game_id, this.props.game_id + ".zip")
          :
            <div></div>
              // <a href={this.state.zipFile} download>下載對局資料</a>
          }
      </>
    }
  }

  render() {
    return (
      <div className="width_100">
        {this.board_table()}
      </div>
    );
  }
}

export default hot(module)(PlayList);