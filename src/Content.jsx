import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import { hot } from "react-hot-loader";
import Introduction from "./Introduction";
import Document from "./Document";
import CompetitionList from "./CompetitionList";
import Competition from "./Competition";

class Content extends Component {
  render() {
    const { updateCompetitionList, competition_list_key, is_login, logout } = this.props;
    return (
      <Switch>
        <Route exact path="/">
          <Introduction></Introduction>
        </Route>
        <Route path="/document">
          <Document></Document>
        </Route>
        <Route path="/competition_list">
          <CompetitionList
            key={competition_list_key}
            is_login={is_login}
            updateCompetitionList={updateCompetitionList}
            logout={logout}
          ></CompetitionList>
        </Route>
        <Route
          path="/competition/:id"
          render={(props) => (
            <Competition {...props} is_login={is_login} />
          )}
        ></Route>
        <Route
          path="*"
          render={() => {
            return <div>404 page not found...</div>;
          }}
        ></Route>
      </Switch>
    );
  }
}

export default hot(module)(Content);
