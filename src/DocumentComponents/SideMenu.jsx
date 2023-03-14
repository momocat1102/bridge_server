import React, { Component } from "react";

class SideMenu extends Component {
  render() {
    return (
      <div className="side-menu">
        <div style={{ padding: "0.5rem 2rem 0.5rem 1.5rem" }}> </div>
        {this.props.children}
      </div>
    );
  }
}

export default hot(module)(SideMenu);
