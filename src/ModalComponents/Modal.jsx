import React, { Component } from "react";
import { hot } from "react-hot-loader";

class Modal extends Component {
  render() {
    const { title, model_content, model_footer, close, width, margin_top, id } =
      this.props;
    return (
      <div
        id="login-modal"
        className="modal-wrapper"
        onClick={(e) => {
          e.stopPropagation();
          close(id);
        }}
      >
        <div
          className="modal-body"
          onClick={(e) => e.stopPropagation()}
          style={{
            // width: width,
            width: "1480px",
            height: "800px",
            margin: margin_top + " auto",
            // maxWidth: "40rem",
          }}
        >
          <header>
            <span>{title}</span>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {this.props.download && (
                <span onClick={this.props.download_cb}>
                  <i className="fas fa-download fa-xs"></i>
                </span>
              )}
              <span
                onClick={(e) => close(id)}
              >
                &times;
              </span>
            </div>
          </header>
          <div className="modal-content">{model_content}</div>
          {/* <div className="modal-footer">{model_footer}</div> */}
        </div>
      </div>
    );
  }
}

export default hot(module)(Modal);
