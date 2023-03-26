import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Modal from "../ModalComponents/Modal";
import { Flipper, Flipped } from "react-flip-toolkit";
import ScoreboardItem from "./Tournament/ScoreboardItem";
import TurnList from "./TurnList";
// import file from "./bridge_history/play1.zip";


class PlayList extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      open_modal: false,
      zipFile: null,
      download: "下載對局資料"
    };
    this.modal_player_a = null;
    this.modal_player_b = null;
    this.open_modal = this.open_modal.bind(this);
  }

  componentDidMount() {
    const zipFilePath = "bridge_history/" + this.props.competition_id + ".zip";
    import(`./${zipFilePath}`)
    .then((module) => {
      this.setState({ zipFile: module.default });
      console.log(module);
    })
    .catch((err) => {
      console.error(err);
    });
    // this.setState({ zipFile: zipFilePath });
  }

  open_modal(player_a, player_b) {
    this.modal_player_a = player_a;
    this.modal_player_b = player_b;
    // alert(this.props.game_flow);
    this.setState({ open_modal: !this.state.open_modal });
  }
  

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

  handleDownloadError() {
    this.setState({ download: "下載資料錯誤 稍後在試" });
  }

  render() {
    return (
      <div className="round-robin-layout">
        {/* {console.log(this.props.one2onescore)} */}
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
        <table>
          <tbody>
            <tr>
              <td className="table-cell-slash"></td>
              {Object.keys(this.props.player_list).map((player, index) => (
                <td
                  key={index}
                  className="table-freeze-first-row"
                  style={{ backgroundColor: "rgb(200,196,191)" }}
                >
                  {player}
                </td>
              ))}
              <td
                  className="table-freeze-first-row"
                  style={{ backgroundColor: "rgb(200,196,191)" }}
                >
                  Score
                </td>
            </tr>
            {Object.keys(this.props.player_list).map((player_i, index_i) => (
              <tr key={"i_" + index_i}>
                <td
                  className="table-freeze-first-col"
                  style={{ backgroundColor: "rgb(200,196,191)" }}
                >
                  {player_i}
                </td>
                {Object.keys(this.props.player_list).map((player_j, index_j) =>
                  index_i !== index_j ? (
                    <ContextMenuTrigger
                      key={index_i + "_" + index_j}
                      id={
                      ""
                      }
                      renderTag={"td"}
                      attributes={{
                        onClick: (e) =>
                          this.open_modal(player_i, player_j),
                        style: { cursor: "pointer" },
                      }}
                    >
                      {
                        this.totalScore(player_i, player_j)
                      }
                    </ContextMenuTrigger>
                  ) : (
                    <td key={"j_" + index_j} className="table-cell-slash"></td>
                  )
                )}
                <td>
                  {this.finallScore(player_i)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {this.state.open_modal && (
          <Modal
            title={""}
            model_content={
              <TurnList
                p1={this.modal_player_a}
                p2={this.modal_player_b}
                num={this.props.num}
                updateState={this.props.updateState}
              ></TurnList>
            }
            model_footer={
                <div></div>
            }
            width={"52%"}
            margin_top={"1%"}
            close={this.open_modal}
          ></Modal>
        )}
        {
          this.props.competition_end ?
            <a href={this.state.zipFile} download onError={this.handleDownloadError}>下載對局資料</a>
          :
            <div></div>
            // <a href={this.state.zipFile} download>下載對局資料</a>
        }
        
      </div>
    );

  }
}

export default hot(module)(PlayList);



// 

// 


