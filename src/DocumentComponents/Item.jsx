import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Link } from "react-router-dom";

class SideMenuItem extends Component {
  render() {
    return (
      <Link to={this.props.link}>
        <div className="side-menu-item">
          <div>{this.props.text}</div>
        </div>
      </Link>
    );
  }
}
export default hot(module)(SideMenuItem);
