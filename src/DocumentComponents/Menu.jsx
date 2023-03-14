import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Link } from "react-router-dom";

class SideMenuMenu extends Component {
  render() {
    return (
      <>
        <div className="side-menu-menu">
          <div>{this.props.text}</div>
        </div>
        {this.props.list.map(([text, link], index) => (
          <Link key={index} to={link}>
            <div className="side-menu-menu-item-wrapper">
              <div className="indent"></div>
              <div className="item">{text}</div>
            </div>
          </Link>
        ))}
      </>
    );
  }
}
export default hot(module)(SideMenuMenu);
