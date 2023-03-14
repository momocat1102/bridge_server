import React, { Component } from "react";
import { hot } from "react-hot-loader";

class ModalButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      color: props.buttonColor,
      color_string: `rgba(${props.buttonColor[0]}, ${props.buttonColor[1]}, ${props.buttonColor[2]}, 0.7)`,
      text_color_string: `rgb(${props.textColor[0]}, ${props.textColor[1]}, ${props.textColor[2]})`
    };
  }
  render() {
    const { text, onClick, processing } = this.props;

    return (
      <div
        className="modal-button"
        style={{backgroundColor: this.state.color_string}}
        onClick={onClick}
        onMouseEnter={() => {
          this.setState({
            color_string: `rgba(${this.state.color[0]}, ${this.state.color[1]}, ${this.state.color[2]}, 1.0)`,
          });
        }}
        onMouseLeave={() => {
          this.setState({
            color_string: `rgba(${this.state.color[0]}, ${this.state.color[1]}, ${this.state.color[2]}, 0.7)`,
          });
        }}
      >
        {processing ? (
          <i className="far fa-circle-notch fa-spin"></i>
        ) : (
          <span style={{color: this.state.text_color_string}}>{text}</span>
        )}
      </div>
    );
  }
}

export default hot(module)(ModalButton);
