import React, { Component } from "react";
import { hot } from "react-hot-loader";
import myCardImage from './cards/1.jpg';


class Board extends Component {
  constructor(props) {
    super(props);
    this.size = this.props.size;
  }

  importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => {
      images[item.replace('./', '')] = r(item);
    });
    return images;
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
        divlist.push(this.ch_flower("heart"));
        x += 2;
      }
      else if(i === 9){
        divlist.push(this.ch_flower("plumbossom"));
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
  
  visual_handcards(player_name, hand_cards) {
    // console.log(hand_cards);
    let number_list = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let shape = ['黑桃', '紅心', '方塊', '梅花'];
    let shape_list = [[], [], [], []];
    let visual_cards = "";
    for(let i = 0; i < hand_cards.length; i++){
      for(let j = 0; j < 4; j++){
        if(Math.floor(hand_cards[i] / 13) === j){
            // console.log(Math.floor(p1_cards[i] / 13));
            shape_list[j].push(number_list[hand_cards[i] % 13]);
            break;
        }
      }
    }

    visual_cards += player_name + ":\n";
    for(let i = 0; i < 4; i++){
      // if(shape_list[j][i].length !== 0)
      // console.log(shape[i] + ":" + shape_list[j][i]);
      visual_cards += shape[i] + ":" + shape_list[i] + "\n";
    }

    return visual_cards;

  }

  render() {
    const {
      p1,
      p2,
      record
    } = this.props;
    // let p1_hand_cards;
    // if (record.hand_card.p1_call_handcards === undefined) {
    //   p1_hand_cards = {record.hand_card.p1_call_handcards.from(Array(13).keys()).map((_, i) => (
    //     <div key={i} className="card">
    //       <img src={images["3.jpg"].default} alt="card" width="35px" height="60px"/>
    //     </div>
    //   ))}
    // } else {
    //   {Array.from(Array(13).keys()).map((_, i) => (
    //     <div key={i} className="card">
    //       <img src={images["3.jpg"].default} alt="card" width="35px" height="60px"/>
    //     </div>
    //   ))}
    // }
    let divlist= this.func(13);
    // let p1_call_handcards = this.visual_handcards(record.hand_card.p1_call_handcards, p1);
    // let p2_call_handcards = this.visual_handcards(record.hand_card.p2_call_handcards, p2);
    let shape = ['黑桃', '紅心', '方塊', '梅花', '無王'];
    const images = this.importAll(require.context('./cards', false, /\.(png|jpe?g|svg)$/));
    console.log(images);
    return (
      <div className="board">
        <div className="background">
          <div className="hist-stytle"> 
          </div>
          <div className="board-row">
            {record.hand_card.p1_call_handcards.map((card, _) => (
              <div className="card">{console.log(record.hand_card.p1_call_handcards)}
                {record.hand_card.p1_call_handcards === undefined ? 
                {}
                 : <img src={images[card + ".jpg"].default} alt="card" width="35px" height="60px"/>
                }
              </div>
            ))}
          </div>
          <div className="board-row">
            {divlist}
          </div>
          <div className="board-row">
            {record.hand_card.p2_call_handcards.map((card, _) => (
                <div className="card">
                  {record.hand_card.p2_call_handcards === undefined ? 
                  {}
                  : <img src={images[card + ".jpg"].default} alt="card" width="35px" height="60px"/>
                  }
                </div>
              ))}
          </div>
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
            {p1.includes("#") ? (
              <>
                <div>({p1.split("#")[1]})</div>
                <div>P1：{p1.split("#")[0]}</div>
              </>
            ) : (
              <div>P1：{p1}</div>
            )}
            <div>剩餘時間：{"test"}</div>
            {/* <div>數量：{black_stone_count}</div> */}
            <div>勝場：{record.play.length === 0 ? 0 
            : record.play[record.play.length - 1].score.p1}</div>
          </div>
          <hr style={{ width: "100%" }}></hr>
          <div>莊家：{record.dealer === undefined ? "" : record.dealer}</div>
          <div>王牌：{record.trump === undefined ? "" : record.trump[1]} {shape[record.trump[0]]}</div>
          <hr style={{ width: "100%" }}></hr>
          <div>
            {p2.includes("#") ? (
              <>
                <div>({p2.split("#")[1]})</div>
                <div>P2：{p2.split("#")[0]}</div>
              </>
            ) : (
              <div>P2：{p2}</div>
            )}
            <div>剩餘時間：{"test"}</div>
            {/* <div>數量：{white_stone_count}</div> */}
            <div>勝場：{record.play.length === 0 ? 0 
            : record.play[record.play.length - 1].score.p2}</div>
          </div>
        </div>
        <div className="board-status">
        <div>初始手牌</div>
        <div className="hist-stytle">{record.hand_card.p1_call_handcards === undefined ? "" : this.visual_handcards(p1, record.hand_card.p1_call_handcards)}{"\n"}
                                    {record.hand_card.p2_call_handcards === undefined ? "" : this.visual_handcards(p2, record.hand_card.p2_call_handcards)}</div>
        <hr style={{ width: "100%" }}></hr>
        <div>打牌手牌</div>
        <div className="hist-stytle">{record.hand_card.p1_play_handcards === undefined ? "" : this.visual_handcards(p1, record.hand_card.p1_play_handcards)}{"\n"}
                                    {record.hand_card.p2_play_handcards === undefined ? "" : this.visual_handcards(p2, record.hand_card.p2_play_handcards)}</div>
        </div>
      </div>
    );
  }
}

export default hot(module)(Board);
