import React, { Component } from "react";
import { hot } from "react-hot-loader";

class SideWidget extends Component {
  render() {
    return (
      <div className="widget">
        <div className="widget-header">
          {this.props.header}
        </div>
        <div className="widget-content">
          {this.props.content}
        </div>
      </div>
    );
  }
}
export default hot(module)(SideWidget);
