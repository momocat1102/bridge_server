import React, { Component } from "react";
import { hot } from "react-hot-loader";

class Article extends Component {
  render() {
    return (
      <>
        <h1>{this.props.article.title}</h1>
        <h5>
          by. {this.props.article.author}, {this.props.article.date}
        </h5>
        <div className="content">
          {this.props.article.content.map((data, index) => (
            <p key={index}>{data}</p>
          ))}
        </div>
        <div className="comment">
          <div>
            <i
              className="fas fa-caret-up fa-lg"
              style={{ color: "rgb(172,240,184)" }}
            ></i>
            <i
              className="fas fa-caret-down fa-lg"
              style={{ color: "rgb(255,175,169)" }}
            ></i>
          </div>
          <div>
            <i
              className="fas fa-comments fa-lg"
              style={{ color: "rgb(140,172,226)" }}
            ></i>
          </div>
        </div>
      </>
    );
  }
}
export default hot(module)(Article);
