import React, { Component } from "react";
import { hot } from "react-hot-loader";
import Hamburger from "./Hamburger";

class Navbar extends Component {
  constructor(){
    super()
    this.state = {
      navbar_maxheight: 0,
    };
  }
  render() {
    const { children } = this.props;
    return (
      <>
        <Hamburger
          switch_navbar={() =>
            this.setState({
              navbar_maxheight: 1000 - this.state.navbar_maxheight,
            })
          }
        ></Hamburger>
        <nav className="navbar" style={{ maxHeight: this.state.navbar_maxheight }}>
          <ul>
            {children.map((child, index) => (
              <li key={index}>{child}</li>
            ))}
          </ul>
        </nav>
      </>
    );
  }
}

export default hot(module)(Navbar);
