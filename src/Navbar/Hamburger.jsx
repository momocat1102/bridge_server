import React, { Component } from "react";
import { hot } from "react-hot-loader";

class Hamgurger extends Component {
  render() {
    const { switch_navbar } = this.props;
    return <div className="hamgurger" onClick={switch_navbar}><i className="fa fa-bars fa-lg"></i></div>;
  }
}

export default hot(module)(Hamgurger);
