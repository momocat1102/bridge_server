import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Modal from "../ModalComponents/Modal";
import Board from "./Board";
import { Flipper, Flipped } from "react-flip-toolkit";
import ScoreboardItem from "./Tournament/ScoreboardItem";
import { assign_winner, download_history } from "../api";
import WinnerChooserBody from "../ModalComponents/WinnerChooserBody";

class PlayList extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
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
    this.images = this.importAll(require.context('./cards', false, /\.(png|jpe?g|svg)$/));
    this.imguser = this.iconUser();
  }

  open_modal(player_a, player_b, nu) {
    this.modal_player_a = player_a;
    this.modal_player_b = player_b;
    // alert(this.props.game_flow);
    this.setState({ 
      open_modal: !this.state.open_modal,
      numBoard: nu
    });
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
    console.log(game_id, winner);
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
      let lastUnderscoreIndex = key.lastIndexOf("_");
      let game_id = [key.substring(0, lastUnderscoreIndex), key.substring(lastUnderscoreIndex + 1)][0];
      if (game_id === (player1 + "_" + player2) || game_id === (player2 + "_" + player1)) {
        acc += this.props.one2onescore[key][player1];
        if (this.props.one2onescore[key][player1] === undefined) {
          console.log(this.props.one2onescore[key], key, player1);
        };
        // console.log(this.props.one2onescore[key][player1], key);
      }
      return acc;
    }, 0);
    // console.log(totalScore);
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
    // console.log(this.props.one2onescore[game_id], game_id)
    let game = this.props.one2onescore[game_id];
    let psid = [this.state.showBoards[0], this.state.showBoards[1]] // game_id.split('_');
    // console.log(psid)
    let winr = game[psid[0]] === 1 ? psid[0] : psid[1];
    // console.log(winr)
    // return <apan>{psid[0]} {game[psid[0]]} {psid[1]} {game[psid[1]]} {this.props.record[game_id].winner}</apan>
    if (winr === this.state.showBoards[0]) {
      return <apan style={{ color: "blue"}}>已結束</apan>;
    }
    else if (winr === this.state.showBoards[1]) {
      return <apan style={{ color: "red"}}>已結束</apan>;
    }
    else {
      return <apan style={{ color: "green"}}>未結束</apan>;
    }
  }

  one2oneScoreboard(p, ps, index) {
    let p1 = p;
    let p2 = ps[(p === ps[0] ? 1 : 0)];
    let p1_score = 0;
    let game_1 = this.props.one2onescore[p1 + "_" + p2 + "_" + index];
    let game_2 = this.props.one2onescore[p2 + "_" + p1 + "_" + index];
    if(game_1 !== undefined){
      p1_score += game_1[p1];
    }
    if(game_2 !== undefined){
      p1_score += game_2[p1];
    }
    return p1_score;
  }

  Goback = () => {
    this.setState({ showBoards: [] });
  }

  playScore(ply, shb, id) {
    let player_i = ply;
    let player_j = shb[(ply === shb[0] ? 1 : 0)];
    let score = this.one2oneScoreboard(ply, shb, id + 1);
    return [player_j, player_i + "_" + player_j + "_" + (id + 1), score]
  }

  importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => {
      images[item.replace('./', '')] = r(item);
    });
    return images;
  }

  iconUser() {
    let arr = []
    let ars = [];
    let ico = {};
    let pls = Object.keys(this.props.player_list);
    let rol = ['01','02','03','04','05','06','07','08','09','10'];
    let col = ['000000','8C0044','880000','A42D00','BB5500','886600','888800','668800','227700','008800','008866','008888','007799','003377','000088','220088','3A0088','550088','660077','770077',
              'DDDDDD','FF88C2','FF8888','FFA488','FFBB66','FFDD55','FFFF77','DDFF77','BBFF66','66FF66','77FFCC','66FFFF','77DDFF','99BBFF','9999FF','9F88FF','B088FF','D28EFF','E38EFF','FF77FF',
              '444444','666666','888888','FF0088','FF0000','FF5511','FF8800','FFBB00','FFFF00','0000FF'];
    for (let r = 0; r < rol.length; r++) {
      ars = [];
      for (let c = 0; c < col.length; c++) {
        ars[c] = rol[r] + '_' + col[c];
      }
      arr[r] = this.shuffle(ars);
    }
    arr = this.shuffle(arr);
    for (let i = 0; i < pls.length; i++) {
      ico[pls[i]] = arr[i % rol.length][(Math.floor(i / rol.length)) % col.length];
    }
    return ico;
  }

  shuffle(array) {
    let v = [];
    for (let i = array.length - 1; i > 0; i--) {
      v[0] = Math.floor(Math.random() * (i + 1));
      v[1] = array[i];
      v[2] = array[v[0]];
      array[i] = v[2];
      array[v[0]] = v[1];
    }
    return array;
  }

  board_table() {
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
                    <img src={this.images["s" + this.imguser[player].split('_')[0] + ".png"]} className="icon_user" style={{border: "solid 1px #" + this.imguser[player].split('_')[1]}} alt="user"></img>
                    <div style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "8px", color: (index === 0 ? "blue" : "red") }}>{player}</div>
                  </td>
                  <td className="table_bear_hr width_15" style={{ backgroundColor: "rgb(0,139,139)", paddingRight: (this.props.num > 10 ? "25px" : "0px") }}>Score</td>
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
                    <>
                      <ContextMenuTrigger
                        key={"p_" + id + "_" + index}
                        id={
                          (
                            this.props.status !== "end" &&
                            this.props.board_end[this.playScore(player, this.state.showBoards, id)[1]] !==
                              undefined) ||
                          (this.props.competition_id.includes("test") &&
                            this.props.record[this.playScore(player, this.state.showBoards, id)[1]] !==
                              undefined)
                            ? "contextmenu"
                            : ""
                        }
                        renderTag={"td"}
                        attributes={{
                          onClick: (e) =>
                            this.props.board_end[this.playScore(player, this.state.showBoards, id)[1]] !==
                            undefined
                              ? this.open_modal(player, this.playScore(player, this.state.showBoards, id)[0], (id + 1))
                              : null,
                          style: { cursor: "pointer", borderStyle: "none", width: "30%" },
                          game_id: this.playScore(player, this.state.showBoards, id)[1],
                          player_a: player,
                          player_b: this.playScore(player, this.state.showBoards, id)[0],
                        }}
                      >
                        {this.props.board_end[this.playScore(player, this.state.showBoards, id)[1]] ===
                        undefined
                          ? "未開始"
                          : this.props.board_end[this.playScore(player, this.state.showBoards, id)[1]] ===
                              true || this.props.status === "end"
                          ? this.win_game(this.playScore(player, this.state.showBoards, id)[1]) 
                          : "(進行中)"}
                          {/* {player}{ "  " + this.playScore(player, this.state.showBoards, id)[0]} */}
                      </ContextMenuTrigger>
                      <td key={"s_" + id + "_" + index} className="table_bear_tr1 width_15">
                        {this.playScore(player, this.state.showBoards, id)[2]}
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
                  <td className="table_bear_tr1 width_15" style={{ backgroundColor: "rgb(165,212,212)", paddingRight: (this.props.num > 10 ? "25px" : "0px") }}>
                    {this.totalScore(player, this.state.showBoards[(player === this.state.showBoards[0] ? 1 : 0)])}
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
                width = {this.imguser}
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
                    color={this.imguser[player].split('_')[1]}
                  ></ScoreboardItem>
                </li>
              </Flipped>
            ))}
          </ul>
        </Flipper>
        <table className="table_bear">
          <tbody>
            <tr>
              <td className="table_bear_hr width90" style={{ backgroundColor: "rgb(0,139,139)" }}></td>
              <td className="table_bear_hr" style={{ backgroundColor: "rgb(0,139,139)" }}></td>
              {Object.keys(this.props.player_list).map((player, index) => (
                <td
                  key={index}
                  className="table_bear_hr"
                  style={{ backgroundColor: "rgb(0,139,139)" }}
                >
                  {player}
                </td>
              ))}
              <td
                  className="table_bear_hr"
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
                  <img src={this.images["s" + this.imguser[player_i].split('_')[0] + ".png"]} className="icon_user" style={{border: "solid 1px #" + this.imguser[player_i].split('_')[1]}} alt="user"></img>
                </td>
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
          this.props.status === "ended" ?
            <div className="btn_bottom">
              <button className="btn1" onClick={this.downloadHistory}>Download</button>
            </div>
          :
            <div></div>
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