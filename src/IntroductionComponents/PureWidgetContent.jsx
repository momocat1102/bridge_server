import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Link } from "react-router-dom";

class PureWidgetContent extends Component {
  render() {
    return (
      <>
        {this.props.content.map((d, index) => (
          <Link key={index} to={"/competition/" + d}>
            {d}
          </Link>
        ))}
      </>
    );
  }
}
export default hot(module)(PureWidgetContent);
