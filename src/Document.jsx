import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Switch, Route } from "react-router-dom";
import Item from "./DocumentComponents/Item";
import Menu from "./DocumentComponents/Menu";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { materialDark as test } from "react-syntax-highlighter/dist/esm/styles/prism";

import game_rule from "./DocumentComponents/documents/game_rule.md";
import rule1 from "./DocumentComponents/documents/rule1.jpg";
import rule2 from "./DocumentComponents/documents/rule2.jpg";
import rule3 from "./DocumentComponents/documents/rule3.jpg";
import rule4 from "./DocumentComponents/documents/rule4.jpg";
import rule5 from "./DocumentComponents/documents/rule5.jpg";
import rule6 from "./DocumentComponents/documents/rule6.jpg";
import protocol from "./DocumentComponents/documents/protocol.md";
import clientCredential from "./client_secret.json";
import download_Python from "./DocumentComponents/documents/download_sample_bot.md";
import AIGamePlatform from "./AIGamePlatform.zip";
import socket from "./socket.zip";
import socket_for_exe from "./socket_for_exe.zip";
import sample_bot from "./sample_bot.zip";
import download_CPlusPlus from "./DocumentComponents/documents/download_CPlusPlus.md";
import download_Java from "./DocumentComponents/documents/download_Java.md";
import feedback from "./DocumentComponents/documents/feedback.md";

class Document extends Component {
  constructor() {
    super();
    this.state = {
      game_rule: "",
      protocol: "",
      download_Python: "",
      download_CPlusPlus: "",
      download_Java: "",
      feedback: "",
      img: {
        rule1: rule1,
        rule2: rule2,
        rule3: rule3,
        rule4: rule4,
        rule5: rule5,
        rule6: rule6,
      },
      a: {
        client_secret: {
          href: "data:application/json," + JSON.stringify(clientCredential),
          ext: ".json",
        },
        AIGamePlatform: { href: AIGamePlatform, ext: ".zip" },
        socket: { href: socket, ext: ".zip" },
        socket_for_exe: { href: socket_for_exe, ext: ".zip" },
        sample_bot: { href: sample_bot, ext: ".zip" },
      },
    };
  }
  async componentDidMount() {
    this.setState({
      game_rule: await (await fetch(game_rule)).text(),
      protocol: await (await fetch(protocol)).text(),
      download_Python: await (await fetch(download_Python)).text(),
      download_CPlusPlus: await (await fetch(download_CPlusPlus)).text(),
      download_Java: await (await fetch(download_Java)).text(),
      feedback: await (await fetch(feedback)).text(),
    });
  }

  render() {
    return (
      <div className="document">
        <div className="side-menu">
          <div style={{ padding: "0.5rem 2rem 0.5rem 1.5rem" }}> </div>
          <Item text={"蜜月橋牌規則"} link={"/document/蜜月橋牌規則"}></Item>
          <Item text={"通訊協定"} link={"/document/通訊協定"}></Item>
          <Menu
            text={"下載"}
            list={[
              ["Python", "下載Python"],
              ["C++", "下載CPlusPlus"],
              ["Java", "下載Java"],
            ]}
          ></Menu>
          <Item text={"問題回報"} link={"/document/問題回報"}></Item>
        </div>
        <div className="content">
          <Switch>
            <Route path="/document/蜜月橋牌規則">
              <ReactMarkdown
                components={{
                  img: (props) => <img src={this.state.img[props.src]} alt="" />,
                }}
              >
                {this.state.game_rule}
              </ReactMarkdown>
            </Route>
            <Route path="/document/通訊協定">
              <ReactMarkdown
                components={{
                  code: (props) => (
                    <SyntaxHighlighter language="json" style={a11yDark}>
                      {props.children[0]}
                    </SyntaxHighlighter>
                  ),
                  a: (props) => (
                    <a
                      href={this.state.a[props.href].href}
                      download={props.href + this.state.a[props.href].ext}
                    >
                      {props.children[0]}
                    </a>
                  ),
                }}
              >
                {this.state.protocol}
              </ReactMarkdown>
            </Route>
            <Route path="/document/下載Python">
              <ReactMarkdown
                components={{
                  code: (props) => (
                    <SyntaxHighlighter language="python" style={test}>
                      {props.children[0]}
                    </SyntaxHighlighter>
                  ),
                  a: (props) => (
                    <a
                      href={this.state.a[props.href].href}
                      download={props.href + this.state.a[props.href].ext}
                    >
                      {props.children[0]}
                    </a>
                  ),
                }}
              >
                {this.state.download_Python}
              </ReactMarkdown>
            </Route>
            <Route path="/document/下載CPlusPlus">
              <ReactMarkdown>{this.state.download_CPlusPlus}</ReactMarkdown>
            </Route>
            <Route path="/document/下載Java">
              <ReactMarkdown>{this.state.download_Java}</ReactMarkdown>
            </Route>
            <Route path="/document/問題回報">
              <ReactMarkdown>{this.state.feedback}</ReactMarkdown>
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
}

export default hot(module)(Document);
