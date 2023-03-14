import React, { Component } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { hot } from "react-hot-loader";
import "./App.css";
import Header from "./Header";
import Content from "./Content";

class App extends Component {
  constructor() {
    super();
    this.state = {
      is_login:
        window.localStorage.getItem("token") !== null &&
        window.localStorage.getItem("token") !== ""
          ? true
          : false,
      competition_list_key: Math.random(),
    };
    this.updateCompetitionList = this.updateCompetitionList.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }
  login() {
    this.setState({ is_login: true });
  }
  logout() {
    window.localStorage.setItem("token", "");
    this.setState({ is_login: false, competition_list_key: Math.random() });
  }
  updateCompetitionList() {
    this.setState({ competition_list_key: Math.random() });
  }

  render() {
    return (
      <Router>
        <div className="app">
          <Header
            updateCompetitionList={this.updateCompetitionList}
            is_login={this.state.is_login}
            login={this.login}
            logout={this.logout}
          ></Header>
          <Content
            updateCompetitionList={this.updateCompetitionList}
            competition_list_key={this.state.competition_list_key}
            is_login={this.state.is_login}
            login={this.login}
            logout={this.logout}
          ></Content>
        </div>
      </Router>
    );
  }
}

export default hot(module)(App);
