import React, { Component } from "react";
import { hot } from "react-hot-loader";


class Board extends Component {
  constructor(props) {
    super(props);
    this.size = this.props.size;
  }

  ch_flower(name){
    var flower_color = ["heart", "diamond", "spades", "plumbossom"];
    if(name === flower_color[0]){
      return(
        <div className="card">
          <div class="heart"></div>
        </div>)
    }
    else if(name === flower_color[1]){
      return(
        <div className="card">
          <div class="diamond"></div>
        </div>)
    }
    else if(name === flower_color[2]){
      return(
        <div className="card">
          <span class="spades">
            <span class="spades_2"></span>
          </span>
        </div>)
    }
    else if(name === flower_color[3]){
      return(
        <div className="card">
          <div class="plumbossom_c"></div>
          <div class="plumbossom_t"></div>
          <div class="plumbossom_b"></div>
        </div>)
    }
    else{
      return(<div className="card"></div>)
    }
  }
  // "heart", "diamond", "spades", "plumbossom"
  func(num){
    let divlist = [];
    let x = 0
    for(let i = 0; i < num; i++){
      if(i === 5){
        divlist.push(this.ch_flower("diamond"));
        x += 2;
      }
      else if(i === 9){
        divlist.push(this.ch_flower("spades"));
        x += 2;
      }
      // else if(i === num - 1){
      //   divlist.push(this.ch_flower("plumbossom"));
      // }
      else{
        divlist.push(<div className="card" style={{right:39*(i - 1) + x}}></div>);
      }
    }
    return divlist
  }
  render() {
    const {
      black,
      black_time_limit,
      black_win_times,
      white,
      white_time_limit,
      white_win_times,
      game_flow,
      trump,
      dealer
    } = this.props;
    // let divlist= this.func(13)
    let shape = ['黑桃', '紅心', '方塊', '梅花', '無王'];
    return (
      <div className="board">
        <div className="board-status">
          <div className="hist-stytle">
            {game_flow}
          </div>
          {/* <div className="board-row">
            {Array.from(Array(13).keys()).map((_, i) => (
              <div className="card" style={{right:20*(i - 1)}}></div>
            ))}
          </div>
          <div className="board-row">
            {divlist}
          </div>
          <div className="board-row">
            {Array.from(Array(13).keys()).map((_, i) => (
              <div className="card" style={{left:20*(11 - i)}}></div>
            ))}
          </div> */}
        </div>

        {/* <div className="board-rows">
          {Array.from(Array(this.size).keys()).map((_, i) => (
            <div key={i} className="board-row">
              {Array.from(Array(this.size).keys()).map((_, j) => (
                <div key={i + "_" + j} className="board-cell">
                  {this.props.board[i][j] === 1 ? (
                    <div style={{width: j}} className="black-move"></div>
                  ) : this.props.board[i][j] === -1 ? (
                    <div className="white-move"></div>
                  ) : null}
                  {this.props.last_move !== undefined &&
                  (i === this.props.last_move[0]) &&
                    (j === this.props.last_move[1]) ? (
                    <div className="last-move"></div>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div> */}
        
        <div className="board-status">
          <div>
            {black.includes("#") ? (
              <>
                <div>({black.split("#")[1]})</div>
                <div>P1：{black.split("#")[0]}</div>
              </>
            ) : (
              <div>P1：{black}</div>
            )}
            <div>剩餘時間：{black_time_limit}</div>
            {/* <div>數量：{black_stone_count}</div> */}
            <div>勝場：{black_win_times}</div>
          </div>
          <hr style={{ width: "100%" }}></hr>
          <div>莊家：{dealer}</div>
          <div>王牌：{trump[1]} {shape[trump[0]]}</div>
          <hr style={{ width: "100%" }}></hr>
          <div>
            {white.includes("#") ? (
              <>
                <div>({white.split("#")[1]})</div>
                <div>P2：{white.split("#")[0]}</div>
              </>
            ) : (
              <div>P2：{white}</div>
            )}
            <div>剩餘時間：{white_time_limit}</div>
            {/* <div>數量：{white_stone_count}</div> */}
            <div>勝場：{white_win_times}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default hot(module)(Board);
