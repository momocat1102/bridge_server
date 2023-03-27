import React, { Component} from "react";
import { hot } from "react-hot-loader";


class Board extends Component {
  constructor(props) {
    super(props);
    this.size = this.props.size;
    this.state = { stage: 1, callIndex: 0, changeIndex: 0, playIndex: 0};
    this.images = this.importAll(require.context('./cards', false, /\.(png|jpe?g|svg)$/));
    this.user_img = this.call_user();
  };

  importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => {
      images[item.replace('./', '')] = r(item);
    });
    return images;
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
            <img src={this.images[record.play[this.state.playIndex].first_play + ".png"].default} alt="card" width="35px" height="60px"/>
            先手出牌
          </div>);
          x += 2;
        }
        else if(i === 9){
          divlist.push(<div className="card">
            <img src={this.images[record.play[this.state.playIndex].second_play + ".png"].default} alt="card" width="35px" height="60px"/>
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

  call_light(val, num, i) {
    let val_ary = [0, 0];
    let type = " btn_call_click";
    if (val == 0) {
      val_ary[0] = -1;
      val_ary[1] = 5;
    }
    else {
      val_ary[0] = val % 5 == 0 ? Math.floor(val / 5) - 1 : Math.floor(val / 5);
      val_ary[1] = val % 5 == 0 ? 4 : val % 5 - 1;
    }
    return val_ary[i] == num ? type : "";
  }

  call_note(rec, num, p) {
    let flower = ["♣", "♦", "♥", "♠", "N", "Pa"];
    let val = "";
    let note = "Bid: ";
    for (let i = 0; i < rec.call.length; i++) {
      if (i <= num && rec.call[i].player == p) {
        val = rec.call[i].call_val;
        if (val == 0) {
          note += flower[5];
        }
        else {
          note += val % 5 == 0 ? Math.floor(val / 5) : Math.floor(val / 5) + 1;
          note += val % 5 == 0 ? flower[4] : flower[val % 5 - 1] + "➝";
        }
      }
    }
    return note;
  }

  call_user() {
    let arr = [];
    let num = 0;
    for (let i = 0; i < 2; i++) {
      num = Math.floor(Math.random() * 9 + 1)
      num = num < 10 ? "x0" + num.toString() : "x" + num.toString();
      if (arr.indexOf(num) == -1) {
        arr.push(num);
      }
      else {
        i--;
      }
    }
    return arr;
  }

  change_card(rec) {
    let hand = [...rec.hand_cards.p1];
    let card = [rec.first_card, rec.first_get];
    hand.push(card[0]);
    hand.sort();
    let indx = hand.indexOf(card[0]);
    hand.splice(indx, 0, card[1]);
    return [hand, indx];
  }

  Nextplay = () => {
    const {
      record
    } = this.props;
    if (this.state.stage === 1) {
      this.setState(prevState => (
        prevState.callIndex + 1 >= record.call.length ? 
        {callIndex: (record.call.length - 1)}
        :
        {callIndex: (prevState.callIndex + 1)}
      ));
    }
    else if (this.state.stage === 2) {
      this.setState(prevState => (
        prevState.changeIndex + 1 >= record.change.length ? 
        {changeIndex: (record.change.length - 1)}
        :
        {changeIndex: (prevState.changeIndex + 1)}
      ));
    }
    else if (this.state.stage === 3) {
      this.setState(prevState => (
        prevState.playIndex + 1 >= record.play.length ? 
        {playIndex: (record.play.length - 1)}
        :
        {playIndex: (prevState.playIndex + 1)}
      ));
    }
  }

  Backplay = () => {
    if (this.state.stage === 1) {
      this.setState(prevState => (
        prevState.callIndex - 1 < 0 ? 
        {callIndex: 0}
        :
        {callIndex: (prevState.callIndex - 1)}
      ));
    }
    else if (this.state.stage === 2) {
      this.setState(prevState => (
        prevState.changeIndex - 1 < 0 ? 
        {changeIndex: 0}
        :
        {changeIndex: (prevState.changeIndex - 1)}
      ));
    }
    else if (this.state.stage === 3) {
      this.setState(prevState => (
        prevState.playIndex - 1 < 0 ? 
        {playIndex: 0}
        :
        {playIndex: (prevState.playIndex - 1)}
      ));
    }
  }

  randerStage() {
    const {
      p1,
      p2,
      record
    } = this.props;
    let play_card = this.play_card();
    let btn_style = "";
    let change = -1;
    let change_sty = [-1, -1];
    // 喊牌介面
    if (this.state.stage === 1) {
      return <div className="pos_fixed">
        {record.call.length === 0 || !record.call[this.state.callIndex] ?
          {}
        : 
          <>  
            {record.hand_card.p1_call_handcards.map((card, id) => (
              btn_style = "btn_card zindex_" + (22 - id).toString() + " top_25 left_c" + id.toString(),
              <button className={btn_style}>
                <img src={this.images[card + ".png"].default} className="img_card" alt="card"></img>
              </button>
            ))}
            {record.hand_card.p2_call_handcards.map((card1, id1) => (
              btn_style = "btn_card zindex_" + (10 + id1).toString() + " top_525 left_c" + id1.toString(),
              <button className={btn_style}>
                <img src={this.images[card1 + ".png"].default} className="img_card" alt="card"></img>
              </button>
            ))}
            <button className="btn_card zindex_22 top_275 left_c0">
              <img src={this.images["PB.png"].default} className="img_card"></img>
            </button>
            <div className="zindex_10 top_240 left_c3 div_call">
              {[1,2,3,4,5,6,7].map(nums => (
                btn_style = "btn_call zindex_11 top_50 left_c" + nums.toString() + this.call_light(record.call[this.state.callIndex].call_val, nums - 1, 0),
                <button className={btn_style}>
                  <img src={this.images["c" + nums.toString() + ".png"].default} className="img_call"></img>
                </button>
              ))}
              {["c","d","h","s","n","p"].map((num1, idx) => (
                btn_style = "btn_call zindex_11 top_140 left_c" + (idx + 1).toString() + this.call_light(record.call[this.state.callIndex].call_val, idx, 1),
                <button className={btn_style}>
                  <img src={this.images["c" + num1.toString() + ".png"].default} className="img_call"></img>
                </button>
              ))}
            </div>
            <div className="zindex_10 top_25 left_1270 div_user">
                <img src={this.images[this.user_img[0] + ".png"].default} className="img_user"></img>
                <p className="txt_st">{record.player.p1}</p>
                <hr className="hr_user" />
                <p className="txt_st">{this.call_note(record, this.state.callIndex, record.player.p1)}</p>
                <br/>
                <p className="txt_st">{"Time: " + record.call[this.state.callIndex].time_limit.p1}</p>
            </div>
            <div className="zindex_10 top_380 left_1270 div_user">
                <img src={this.images[this.user_img[1] + ".png"].default} className="img_user"></img>
                <p className="txt_st">{record.player.p2}</p>
                <hr className="hr_user" />
                <p className="txt_st">{this.call_note(record, this.state.callIndex, record.player.p2)}</p>
                <br/>
                <p className="txt_st">{"Time: " + record.call[this.state.callIndex].time_limit.p2}</p>
            </div>
          </>
        }
      </div>
    // 換牌介面
    } else if (this.state.stage === 2) {
      return <div className="pos_fixed">
        {record.change.length === 0 || !record.change[this.state.changeIndex] ?
          {}
        : 
          <>
            {//this.change_card(record.change[this.state.changeIndex])[0].map((card, id) => (
              record.change[this.state.changeIndex].hand_cards.p1.map((card, id) => (
              change = this.change_card(record.change[this.state.changeIndex])[1],
              change_sty[0] = (22 - (id > change ? id - 1 : id)),
              change_sty[1] = (id > change ? id - 1 : id),
              btn_style = "btn_card zindex_" + (22 - id).toString() + " top_25 left_c" + id.toString(),
              //btn_style = "btn_card zindex_" + change_sty[0].toString() + " top_" + (id == (change + 1) ? 50 : 25).toString() + " left_c" + change_sty[1].toString() + (change == id ? " move_co" : (change == (id + 1) ? " move_ci" : "")),
              <button className={btn_style}>
                <img src={this.images[card + ".png"].default} className="img_card" alt="card"></img>
              </button>
            ))}
            {record.change[this.state.changeIndex].hand_cards.p2.map((card1, id1) => (
              
              btn_style = "btn_card zindex_" + (10 + id1).toString() + " top_525 left_c" + id1.toString(),
              <button className={btn_style}>
                <img src={this.images[card1 + ".png"].default} className="img_card" alt="card"></img>
              </button>
            ))}
            <button className="btn_card zindex_22 top_275 left_c0">
              <img src={this.images["PB.png"].default} className="img_card"></img>
            </button>
            <button className="btn_card zindex_22 top_275 left_c2 move_nt">
              <img src={this.images[record.change[this.state.changeIndex].first_change_card + ".png"].default} className="img_card"></img>
            </button>
          </>
        }
        {console.log(record.change)}
        
      </div>
    // 打牌介面
    } else if (this.state.stage === 3) {
      return <div>
        <div style={{flexDirection: "column"}}>
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
              <img src={this.images[card + ".png"].default} alt="card" width="35px" height="60px"/>
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
              <img src={this.images[card + ".png"].default} alt="card" width="35px" height="60px"/>
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
    return (
      <div className="board_bear">
        <div className="board_menu">
            <button className={this.state.stage === 1 ? "btn_page btn_page_click" : "btn_page"} onClick={() => this.setState({ stage: 1 })}>Bidding</button>
            <button className={this.state.stage === 2 ? "btn_page btn_page_click" : "btn_page"} onClick={() => this.setState({ stage: 2 })}>Exchanging</button>
            <button className={this.state.stage === 3 ? "btn_page btn_page_click" : "btn_page"} onClick={() => this.setState({ stage: 3 })}>Playing</button>
            <button className="btn_pageR" onClick={this.Nextplay}>&gt;</button>
            <button className="btn_pageR" onClick={this.Backplay}>&lt;</button>
        </div>
        {this.randerStage()}

      </div>
    );
  }
}

export default hot(module)(Board);
