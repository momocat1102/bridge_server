import React, { Component } from "react";
import { hot } from "react-hot-loader";

class ListCollapseController extends Component {
  render() {
    const { title, show } = this.props;
    return (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <span style={{fontWeight: "bold"}}>{title}</span>
          <div style={{cursor: "pointer"}} onClick={this.props.switch_content}>
            <span>{show ? "Hide " : "Show "}</span>
            <span>
              <i
                className={
                  show
                    ? "fa fa-angle-down fa-lg fa-rotate-180"
                    : "fa fa-angle-down fa-lg"
                }
              ></i>
            </span>
          </div>
        </div>
        <hr />
      </div>
    );
  }
}

export default hot(module)(ListCollapseController);
