import React, { Component } from "react";
import { Link } from "react-router-dom";
import { hot } from "react-hot-loader";

class Item extends Component {
  render() {
    const { href, text } = this.props;
    return (
      <Link to={href}>{text}</Link>
    );
  }
}

export default hot(module)(Item);
