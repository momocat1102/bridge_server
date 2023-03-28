import React, { Component } from "react";
import { hot } from "react-hot-loader";

class CreateCompetitionBody extends Component {
  render() {
    const {
      defaultName,
      defaultType,
      defaultTimeLimit,
      defaultnum,
      onChangeName,
      onChangeType,
      onChangeTimeLimit,
      onChangenum,
    } = this.props;

    return (
      <div>
        <label>名稱：</label>
        <input
          value={defaultName}
          onChange={(e) => onChangeName(e.target.value)}
        />
        <br />
        <label>賽制：</label>
        <select
          value={defaultType}
          onChange={(e) => onChangeType(e.target.value)}
        >
          <option value="round-robin">循環賽</option>
          {/* <option value="knockout">淘汰賽</option> */}
        </select>
        <br />
        <label>時間限制：</label>
        <input
          type="range"
          min="0.1"
          max="20"
          step="0.1"
          value={defaultTimeLimit}
          onChange={(e) => onChangeTimeLimit(e.target.value)}
        ></input>
        <button
          onClick={(e) => {
            onChangeTimeLimit(
              parseFloat((parseFloat(defaultTimeLimit) + 0.1).toFixed(1))
            );
          }}
        >
          {">"}
        </button>
        <span>{defaultTimeLimit} min</span>
        <br />
        <label>遊玩局數：</label>
        {/* <select
          value={defaultBoardSize}
          onChange={(e) => onChangeBoardSize(e.target.value)} */}
        {/* > */}
          <input
            type="number"
            min="1"
            value={defaultnum}
            onChange={(e) => onChangenum(e.target.value)}
            onKeyDown={(e) => {
              if (
                !(
                  e.key === "Backspace" ||
                  e.key === "Delete" ||
                  e.key === "Tab" ||
                  e.key === "." ||
                  (e.key >= "0" && e.key <= "9")
                )
              ) {
                e.preventDefault();
              }
            }}
          /> {defaultnum} 局
        {/* </select> */}
      </div>
    );
  }
}

export default hot(module)(CreateCompetitionBody);
