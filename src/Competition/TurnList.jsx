import React, { Component} from "react";
import { hot } from "react-hot-loader";
import { Link } from 'react-router-dom';

class TurnList extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  };

  handleClick(type, p1, p2, index) {
    this.props.updateState(type, p1, p2, index);
  }

  render() {
    const {
      p1,
      p2,
      num,
      updateState
    } = this.props;
    console.log(this.props);
    return (
      <div className="board">
        <div className="board-row">
          {Array.from(Array(num).keys()).map((_, index) => (
            <div>
              {/* {console.log(num)} */}
              <button onClick={() => this.handleClick("round-robin", p1, p2, index + 1)}> {index + 1} </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default hot(module)(TurnList);
