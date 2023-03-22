import React, { Component} from "react";
import { hot } from "react-hot-loader";


class Board extends Component {
  constructor(props) {
    super(props);
    this.size = this.props.size;
    this.state = { stage: 1, changeIndex: 0, playIndex: 0};
    this.images = this.importAll(require.context('./cards', false, /\.(png|jpe?g|svg)$/));
  };

  importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => {
      images[item.replace('./', '')] = r(item);
    });
    return images;
  }
  // ch_flower(name){
  //   var flower_color = ["heart", "diamond", "spades", "plumbossom"];
  //   if(name === flower_color[0]){
  //     return(
  //       <div className="card">
  //         <div class="heart"></div>
  //       </div>)
  //   }
  //   else if(name === flower_color[1]){
  //     return(
  //       <div className="card">
  //         <div class="diamond"></div>
  //       </div>)
  //   }
  //   else if(name === flower_color[2]){
  //     return(
  //       <div className="card">
  //         <span class="spades">
  //           <span class="spades_2"></span>
  //         </span>
  //       </div>)
  //   }
  //   else if(name === flower_color[3]){
  //     return(
  //       <div className="card">
  //         <div class="plumbossom_c"></div>
  //         <div class="plumbossom_t"></div>
  //         <div class="plumbossom_b"></div>
  //       </div>)
  //   }
  //   else{
  //     return(<div className="card"></div>)
  //   }
  // }
  // "heart", "diamond", "spades", "plumbossom"
  change_card(){
    const {
      record
    } = this.props;
    let divlist = [];
    let x = 0
    if (record.change[this.state.changeIndex] === undefined){
      for(let i = 0; i < 13; i++){
        divlist.push(<div className="none_card"></div>);
      }
    }else{
      for(let i = 0; i < 13; i++){
        if(i === 6){         
          divlist.push(<div className="card">
            <img src={this.images[record.change[this.state.changeIndex].first_card + ".jpg"].default} alt="card" width="35px" height="60px"/>
            先手出牌
          </div>);
          x += 2;
        }
        else if(i === 9){
          divlist.push(<div className="card">
            <img src={this.images[record.change[this.state.changeIndex].second_card + ".jpg"].default} alt="card" width="35px" height="60px"/>
            後手出牌
          </div>);
          x += 2;
        }
        else if(i === 4){
          divlist.push(<div className="card">
            <img src={this.images[record.change[this.state.changeIndex].second_get + ".jpg"].default} alt="card" width="35px" height="60px"/>
            後手拿牌
          </div>);
          x += 2;
        }
        else if(i === 3){
          divlist.push(<div className="card">
            <img src={this.images[record.change[this.state.changeIndex].first_get + ".jpg"].default} alt="card" width="35px" height="60px"/>
            先手拿牌
          </div>);
          x += 2;
        }
        else if(i === 2){
          divlist.push(<div className="card">
            <img src={this.images[record.change[this.state.changeIndex].first_change_card + ".jpg"].default} alt="card" width="35px" height="60px"/>
            先手拿牌
          </div>);
          x += 2;
        }
        else{
          divlist.push(<div className="card" style={{right:39*(i - 1) + x}}></div>);
        }
      }
    }
    
    return divlist
  }

  play_card(){
    const {
      record
    } = this.props;
    let divlist = [];
    let x = 0
    if (record.play[this.state.playIndex] === undefined){
      for(let i = 0; i < 13; i++){
        divlist.push(<div className="none_card"></div>);
      }
    }else{
      for(let i = 0; i < 13; i++){
        if(i === 6){         
          divlist.push(<div className="card">
            <img src={this.images[record.play[this.state.playIndex].first_play + ".jpg"].default} alt="card" width="35px" height="60px"/>
            先手出牌
          </div>);
          x += 2;
        }
        else if(i === 9){
          divlist.push(<div className="card">
            <img src={this.images[record.play[this.state.playIndex].second_play + ".jpg"].default} alt="card" width="35px" height="60px"/>
            後手出牌
          </div>);
          x += 2;
        }
        else{
          divlist.push(<div className="card" style={{right:39*(i - 1) + x}}></div>);
        }
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

  handleNextchange = () => {
    this.setState(prevState => (
      prevState.changeIndex + 1 >= 13 ? 
      {changeIndex: 12}
      :
      {changeIndex: (prevState.changeIndex + 1)}
    ));
  };

  handleBackchange = () => {
    this.setState(prevState => (
      prevState.changeIndex - 1 < 0 ? 
      {changeIndex: 0}
      :
      {changeIndex: (prevState.changeIndex - 1)}
    ));
  };

  handleNextplay = () => {
    this.setState(prevState => (
      prevState.playIndex + 1 >= 13 ? 
      {playIndex: 12}
      :
      {playIndex: (prevState.playIndex + 1)}
    ));
  };

  handleBackplay = () => {
    this.setState(prevState => (
      prevState.playIndex - 1 < 0 ? 
      {playIndex: 0}
      :
      {playIndex: (prevState.playIndex - 1)}
    ));
  };

  randerStage() {
    const {
      p1,
      p2,
      record
    } = this.props;
    let change_card = this.change_card();
    let play_card = this.play_card();
    // const images = this.importAll(require.context('./cards', false, /\.(png|jpe?g|svg)$/));
    // 喊牌介面
    if (this.state.stage === 1) {
      return <p>這是第一階段的介面</p>;
    // 換牌介面
    } else if (this.state.stage === 2) {
      return <div>
        <button onClick={this.handleBackchange}>{"<"}</button>
        <button onClick={this.handleNextchange}>{">"}</button>
        {record.change[this.state.changeIndex] === undefined ?
          <div></div>
        :
          <div>回合數: {this.state.changeIndex + 1}&emsp;&emsp;先手：{record.change[this.state.changeIndex].go_first}&emsp;&emsp;後手：{record.change[this.state.changeIndex].go_first === p1 ? p2 : p1}</div>
        }
        <div className="background">
          {/* {console.log(record.change)} */}
          <div className="hist-stytle"> 
          </div>
          <div className="board-row">
            {record.change.length === 0 || !record.change[this.state.changeIndex] ?
              {}
            : 
              record.change[this.state.changeIndex].hand_cards.p1.map((card, _) => (
                <div className="card">
                <img src={this.images[card + ".jpg"].default} alt="card" width="35px" height="60px"/>
                </div>
              ))
            }
          </div>
          <div className="board-row">
            {change_card}
          </div>
          <div className="board-row">
            {record.change.length === 0 || !record.change[this.state.changeIndex] ?
              {}
            : 
              record.change[this.state.changeIndex].hand_cards.p2.map((card, _) => (
                <div className="card">
                <img src={this.images[card + ".jpg"].default} alt="card" width="35px" height="60px"/>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    // 打牌介面
    } else if (this.state.stage === 3) {
      return <div>
        <div style={{flexDirection: "column"}}>
          <button onClick={this.handleBackplay}>{"<"}</button>
          <button onClick={this.handleNextplay}>{">"}</button>
          {record.play[this.state.playIndex] === undefined ?
            <div></div>
          :
            <div>回合數: {this.state.playIndex + 1}&emsp;&emsp;先手：{record.play[this.state.playIndex].go_first}&emsp;&emsp;後手：{record.play[this.state.playIndex].go_first === p1 ? p2 : p1}</div>
          }
        </div>
        <div className="background">
        {console.log(record.play.length)}
          <div className="hist-stytle"> 
          </div>
          <div className="board-row">
            {record.play.length === 0 || !record.play[this.state.playIndex] ?
            <div></div>
            : 
            record.play[this.state.playIndex].hand_cards.p1.map((card, _) => (
              <div className="card">
              <img src={this.images[card + ".jpg"].default} alt="card" width="35px" height="60px"/>
              </div>
            ))}
          </div>
          <div className="board-row">
            {play_card}
          </div>
          <div className="board-row">
            {record.play.length === 0 || !record.play[this.state.playIndex] ?
            <div></div>
            : 
            record.play[this.state.playIndex].hand_cards.p2.map((card, _) => (
              <div className="card">
              <img src={this.images[card + ".jpg"].default} alt="card" width="35px" height="60px"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    }
  }

  render() {
    const {
      p1,
      p2,
      record
    } = this.props;
    let shape = ['黑桃', '紅心', '方塊', '梅花', '無王'];
    const images = this.importAll(require.context('./cards', false, /\.(png|jpe?g|svg)$/));
    // console.log(images);
    return (
      <div className="board">
        {this.randerStage()}
        <button onClick={() => this.setState({ stage: 1 })}>第一階段</button>
        <button onClick={() => this.setState({ stage: 2 })}>第二階段</button>
        <button onClick={() => this.setState({ stage: 3 })}>第三階段</button>
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
