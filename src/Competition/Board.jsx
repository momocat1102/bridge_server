import React, { Component } from "react";
import { hot } from "react-hot-loader";


class Board extends Component {
  constructor(props) {
    super(props);
    this.state = { stage: 1, callIndex: 0, changeIndex: 0, playIndex: 0};
    this.images = this.importAll(require.context('./cards', false, /\.(png|jpe?g|svg)$/));
    this.flower = ["♣", "♦", "♥", "♠", "N", "Pa"];
    this.number = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    this.notes = ['➝', '..'];
    this.color = ["b", "r", "y", "u", "g" ];
  };

  importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => {
      images[item.replace('./', '')] = r(item);
    });
    return images;
  }

  note_color(nos, flr, chn) {
    let noa = [];
    let tx = nos.split(this.notes[0]);
    for (let i = 0; i < tx.length; i++) {
      noa.push(<apan className={"color_" + this.color[(tx[i].indexOf(flr[0]) !== -1 || tx[i].indexOf(flr[3]) !== -1) ? 0 : (tx[i].indexOf(flr[1]) !== -1 || tx[i].indexOf(flr[2]) !== -1) ? 1 : (tx[i].indexOf(flr[4]) !== -1) ? 3 : (tx[i].indexOf(flr[5]) !== -1) ? 4 : 2]}>{tx[i]}</apan>);
      if (i !== tx.length - 1) {
        noa.push(<apan className={"color_" + this.color[2]}>{this.notes[(chn === 1 && i % 2 === 1) ? 1 : 0]}</apan>);
      }
    }
    return noa;
  }

  class_txt(type, change, first, card, id) {
    let ret = "";
    if (type === 1) {
      ret = "btn_card zindex_" + (22 - (id > change ? id - 1 : id)).toString() + " top_" + (id === (change + 1) ? 50 : 25).toString() + " left_c" + (id > change ? id - 1 : id).toString() + (id === change ? " move_co" : (id === (change + 1) ? (first === card ? " move_ci" : " move_pi") : ""));
    }
    else if (type === 2) {
      ret = "btn_card zindex_" + (10 + (id > change ? id - 1 : id)).toString() + " top_" + (id === (change + 1) ? 500 : 525).toString() + " left_c" + (id > change ? id - 1 : id).toString() + (id === change ? " move_po" : (id === (change + 1) ? (first === card ? " move_ci" : " move_pi") : ""));
    }
    else if (type === 3) {
      ret = (first !== 0 && id === change[0].length - 1) ? "btn_card zindex_10 top_240 left_c8 move_ns" : "btn_card zindex_" + (22 - id).toString() + " top_25 left_c" + id.toString() + (id === change[1] ? " move_co" : "");
    }
    else {
      ret = (first !== 0 && id === change[0].length - 1) ? "btn_card zindex_10 top_310 left_c11 move_ns" : "btn_card zindex_" + (10 + id).toString() + " top_525 left_c" + id.toString() + (id === change[1] ? " move_po" : "");
    }
    return ret;
  }
  
  call_light(val, num, i) {
    let val_ary = [0, 0];
    let type = " btn_call_click";
    if (val === 0) {
      val_ary[0] = -1;
      val_ary[1] = 5;
    }
    else {
      val_ary[0] = val % 5 === 0 ? Math.floor(val / 5) - 1 : Math.floor(val / 5);
      val_ary[1] = val % 5 === 0 ? 4 : val % 5 - 1;
    }
    return val_ary[i] === num ? type : "";
  }

  call_note(rec, num, p) {
    let flower = this.flower;
    let val = "";
    let note = "";
    for (let i = 0; i < rec.call.length; i++) {
      if (i <= num && rec.call[i].player === p) {
        val = rec.call[i].call_val;
        if (val === 0) {
          note += flower[5];
        }
        else {
          note += val % 5 === 0 ? Math.floor(val / 5) : Math.floor(val / 5) + 1;
          note += (val % 5 === 0 ? flower[4] : flower[val % 5 - 1]) + this.notes[0];
        }
      }
    }
    return this.note_color(note, flower, 0);
  }

  change_card(rec, p, p1, p2) {
    let hand = [[...rec.hand_cards.p1], [...rec.hand_cards.p2]];
    let card = [rec.first_card, rec.first_get, rec.second_card, rec.second_get];
    let role = (p === 0 && rec.go_first === p1) ? 0 : ((p === 1 && rec.go_first === p2) ? 0 : 2);
    hand[p].push(card[role]);
    hand[p].sort(function(a, b){return a-b});
    let indx = hand[p].indexOf(card[role]);
    hand[p].splice(indx + 1, 0, card[role + 1]);
    return [hand[p], indx];
  }

  change_note(rec, num, p) {
    let flower = this.flower.slice(0, 4).reverse();
    let number = this.number;
    let card = [-1, -1];
    let note = "";
    for (let i = 0; i < rec.change.length; i++) {
      if (i <= num) {
        if (rec.change[i].go_first === p) {
          card[0] = rec.change[i].first_card;
          card[1] = rec.change[i].first_get;
        }
        else {
          card[0] = rec.change[i].second_card;
          card[1] = rec.change[i].second_get;
        }
        note += flower[Math.floor(card[0] / 13)] + number[card[0] % 13] + this.notes[0];
        note += flower[Math.floor(card[1] / 13)] + number[card[1] % 13] + (i === rec.change.length - 1 ? "" : this.notes[0]);
      }
    }
    return this.note_color(note, flower, 1);
  }

  play_card(rec, i, p, p1, p2) {
    let hand = [[...rec.play[i].hand_cards.p1], [...rec.play[i].hand_cards.p2]];
    let card = [rec.play[i].first_play, rec.play[i].second_play];
    let role = (p === 0 && rec.play[i].go_first === p1) ? 0 : ((p === 1 && rec.play[i].go_first === p2) ? 0 : 1);
    hand[p].push(card[role]);
    hand[p].sort(function(a, b){return a-b});
    let indx = hand[p].indexOf(card[role]);
    if (i !== 0) {
      i--;
      let card1 = [rec.play[i].first_play, rec.play[i].second_play];
      hand[p].push(card1[(p === 0 && rec.play[i].go_first === p1) ? 0 : ((p === 1 && rec.play[i].go_first === p2) ? 0 : 1)]);
    }
    return [hand[p], indx];
  }

  play_note(rec, num, p) {
    let flower = this.flower.slice(0, 4).reverse();
    let number = this.number;
    let val = "";
    let note = "";
    for (let i = 0; i < rec.play.length; i++) {
      if (i <= num) {
        if (rec.play[i].go_first === p) {
          val = rec.play[i].first_play;
        }
        else {
          val = rec.play[i].second_play;
        }
        note += flower[Math.floor(val / 13)] + number[val % 13] + (i === rec.play.length - 1 ? "" : this.notes[0]);
      }
    }
    return this.note_color(note, flower, 0);
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
      record,
      width
    } = this.props;
    let btn_trump =[[1,2,3,4,5,6,7], ["c","d","h","s","n","p"], ["s","h","d","c","n"]];
    // 喊牌介面
    if (this.state.stage === 1) {
      return <div className="pos_fixed">
        {record.call.length === 0 || !record.call[this.state.callIndex] ?
          {}
        : 
          <>  
            {record.hand_card.p1_call_handcards.map((card, id) => (
              <button className={"btn_card zindex_" + (22 - id).toString() + " top_25 left_c" + id.toString()}>
                <img src={this.images[card + ".png"]} className="img_card" alt="card"></img>
              </button>
            ))}
            {record.hand_card.p2_call_handcards.map((card1, id1) => (
              <button className={"btn_card zindex_" + (10 + id1).toString() + " top_525 left_c" + id1.toString()}>
                <img src={this.images[card1 + ".png"]} className="img_card" alt="card"></img>
              </button>
            ))}
            <button className="btn_card zindex_22 top_275 left_c0">
              <img src={this.images["PB.png"]} className="img_card" alt="card"></img>
            </button>
            <div className="zindex_10 top_240 left_c3 div_call">
              {btn_trump[0].map(nums => (
                <button className={"btn_call zindex_11 top_50 left_c" + nums.toString() + this.call_light(record.call[this.state.callIndex].call_val, nums - 1, 0)}>
                  <img src={this.images["c" + nums.toString() + ".png"]} className="img_call" alt="card"></img>
                </button>
              ))}
              {btn_trump[1].map((num1, idx) => (
                <button className={"btn_call zindex_11 top_140 left_c" + (idx + 1).toString() + this.call_light(record.call[this.state.callIndex].call_val, idx, 1)}>
                  <img src={this.images["c" + num1.toString() + ".png"]} className="img_call" alt="card"></img>
                </button>
              ))}
            </div>
            <div className="zindex_10 top_25 left_1270 div_user">
              <img src={this.images["x" + width[record.player.p1].split('_')[0] + ".png"]} className="img_user" alt="card"></img>
              <p className="txt_st">{record.player.p1}</p>
              <hr className="hr_user" style={{border: "2px solid #" + width[record.player.p1].split('_')[1]}} />
              <p className="txt_st">{this.call_note(record, this.state.callIndex, record.player.p1)}</p>
              <br/>
              <p className="txt_st">{"Time: " + record.call[this.state.callIndex].time_limit.p1}</p>
            </div>
            <div className="zindex_10 top_380 left_1270 div_user">
              <img src={this.images["x" + width[record.player.p2].split('_')[0] + ".png"]} className="img_user" alt="card"></img>
              <p className="txt_st">{record.player.p2}</p>
              <hr className="hr_user" style={{border: "2px solid #" + width[record.player.p2].split('_')[1]}} />
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
            {this.change_card(record.change[this.state.changeIndex], 0, p1, p2)[0].map((card, id) => (
              <button className={this.class_txt(1, this.change_card(record.change[this.state.changeIndex], 0, p1, p2)[1], record.change[this.state.changeIndex].first_change_card, card, id)}>
                <img src={this.images[card + ".png"]} className="img_card" alt="card"></img>
              </button>
            ))}
            {this.change_card(record.change[this.state.changeIndex], 1, p1, p2)[0].map((card1, id1) => (
              <button className={this.class_txt(2, this.change_card(record.change[this.state.changeIndex], 1, p1, p2)[1], record.change[this.state.changeIndex].first_change_card, card1, id1)}>
                <img src={this.images[card1 + ".png"]} className="img_card" alt="card"></img>
              </button>
            ))}
            <button className="btn_card zindex_22 top_275 left_c0">
              <img src={this.images[(this.state.changeIndex === record.change.length - 1 ? "PZ" : "PB") + ".png"]} className="img_card" alt="card"></img>
            </button>
            <button className="btn_card zindex_22 top_275 left_c2 move_nt">
              <img src={this.images[(this.state.changeIndex === record.change.length - 1 ? "PZ" : record.change[this.state.changeIndex].first_change_card) + ".png"]} className="img_card" alt="card"></img>
            </button>
            <div className="zindex_10 top_25 left_1270 div_user">
                <img src={this.images["x" + width[record.player.p1].split('_')[0] + ".png"]} className="img_user" alt="card"></img>
                <p className="txt_st">{record.player.p1}</p>
                <hr className="hr_user" style={{border: "2px solid #" + width[record.player.p1].split('_')[1]}} />
                <p className="txt_st1">{this.change_note(record, this.state.changeIndex, record.player.p1)}</p>
                <p className="txt_st">{"Time: " + record.change[this.state.changeIndex].time_limit.p1}</p>
            </div>
            <div className="zindex_10 top_380 left_1270 div_user">
                <img src={this.images["x" + width[record.player.p2].split('_')[0] + ".png"]} className="img_user" alt="card"></img>
                <p className="txt_st">{record.player.p2}</p>
                <hr className="hr_user" style={{border: "2px solid #" + width[record.player.p2].split('_')[1]}} />
                <p className="txt_st1">{this.change_note(record, this.state.changeIndex, record.player.p2)}</p>
                <p className="txt_st">{"Time: " + record.change[this.state.changeIndex].time_limit.p2}</p>
            </div>
            <div className={"zindex_22 div_trump top_" + (record.dealer === p1 ? 10 : 365).toString() + " left_1260"}>
              <img src={this.images["t" + record.trump[0].toString() + ".png"]} className="img_trump1" alt="card"></img>
              <img src={this.images["t" + btn_trump[2][record.trump[1]].toString() + ".png"]} className="img_trump" alt="card"></img>
            </div>
            <div className={"zindex_22 top_135 left_1390"}>
              <img src={this.images["p" + (record.change[this.state.changeIndex].go_first === p1 ? "1" : "2") + ".png"]} alt="card"></img>
            </div>
            <div className={"zindex_22 top_490 left_1390"}>
              <img src={this.images["p" + (record.change[this.state.changeIndex].go_first === p2 ? "1" : "2") + ".png"]} alt="card"></img>
            </div>
          </>
        }
      </div>
    // 打牌介面
    } else if (this.state.stage === 3) {
      return <div className="pos_fixed">
        {record.play.length === 0 || !record.play[this.state.playIndex] ?
          <></>
        : 
          <>
            {this.play_card(record, this.state.playIndex, 0, p1, p2)[0].map((card, id) => (
              <button className={this.class_txt(3, this.play_card(record, this.state.playIndex, 0, p1, p2), this.state.playIndex, card, id)}>
                <img src={this.images[card + ".png"]} className="img_card" alt="card"></img>
              </button>
            ))}
            {this.play_card(record, this.state.playIndex, 1, p1, p2)[0].map((card1, id1) => (
              <button className={this.class_txt(4, this.play_card(record, this.state.playIndex, 1, p1, p2), this.state.playIndex, card1, id1)}>
                <img src={this.images[card1 + ".png"]} className="img_card" alt="card"></img>
              </button>
            ))}
            <button className="btn_card zindex_22 top_275 left_c0">
              <img src={this.images[(this.state.playIndex === 0 ? "PZ" : "PB") + ".png"]} className="img_card" alt="card"></img>
            </button>
            <div className="zindex_10 top_25 left_1270 div_user">
                <img src={this.images["x" + width[record.player.p1].split('_')[0] + ".png"]} className="img_user" alt="card"></img>
                <p className="txt_st">{record.player.p1}</p>
                <hr className="hr_user" style={{border: "2px solid #" + width[record.player.p1].split('_')[1]}} />
                <p className="txt_st1">{this.play_note(record, this.state.playIndex, record.player.p1)}</p>
                <p className="txt_st">{"Score: " + record.play[this.state.playIndex].score.p1}</p>
                <p className="txt_st">{"Time: " + record.play[this.state.playIndex].time_limit.p1}</p>
            </div>
            <div className="zindex_10 top_380 left_1270 div_user">
                <img src={this.images["x" + width[record.player.p2].split('_')[0] + ".png"]} className="img_user" alt="card"></img>
                <p className="txt_st">{record.player.p2}</p>
                <hr className="hr_user" style={{border: "2px solid #" + width[record.player.p2].split('_')[1]}} />
                <p className="txt_st1">{this.play_note(record, this.state.playIndex, record.player.p2)}</p>
                <p className="txt_st">{"Score: " + record.play[this.state.playIndex].score.p2}</p>
                <p className="txt_st">{"Time: " + record.play[this.state.playIndex].time_limit.p2}</p>
            </div>
            <div className={"zindex_22 div_trump top_" + (record.dealer === p1 ? 10 : 365).toString() + " left_1260"}>
              <img src={this.images["t" + record.trump[0].toString() + ".png"]} className="img_trump1" alt="card"></img>
              <img src={this.images["t" + btn_trump[2][record.trump[1]].toString() + ".png"]} className="img_trump" alt="card"></img>
            </div>
            <div className={"zindex_22 top_135 left_1390"}>
              <img src={this.images["p" + (record.play[this.state.playIndex].go_first === p1 ? "1" : "2") + ".png"]} alt="card"></img>
            </div>
            <div className={"zindex_22 top_490 left_1390"}>
              <img src={this.images["p" + (record.play[this.state.playIndex].go_first === p2 ? "1" : "2") + ".png"]} alt="card"></img>
            </div>
            <div className={"zindex_22 top_" + (record.winner === p1 ? 5 : 360).toString() + " left_1395"}>
              <img src={this.images["pw.png"]} alt="card"></img>
            </div>
          </>
        }
      </div>
    }
  }

  render() {
    return (
      <div className="board_bear">
        <div className="board_menu">
            <button className={this.state.stage === 1 ? "btn_page btn_page_click" : "btn_page"} onClick={() => this.setState({ stage: 1 })}>Bidding</button>
            <button className={this.state.stage === 2 ? "btn_page btn_page_click" : "btn_page"} onClick={() => this.setState({ stage: 2 })}>Exchanging</button>
            <button className={this.state.stage === 3 ? "btn_page btn_page_click" : "btn_page"} onClick={() => this.setState({ stage: 3 })}>Playing</button>
            <button className="btn_pageR" onClick={() => {this.props.close();}}>⨉</button>
            <button className="btn_pageR" onClick={this.Nextplay}>&gt;</button>
            <button className="btn_pageR" onClick={this.Backplay}>&lt;</button>
        </div>
        <div className="board_site">
          {this.randerStage()}
        </div>
      </div>
    );
  }
}

export default hot(module)(Board);