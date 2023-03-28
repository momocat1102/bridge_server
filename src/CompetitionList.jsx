import React, { Component } from "react";
import { hot } from "react-hot-loader";
import CompetitionItem from "./Competition/CompetitionItem";
import ListCollapseController from "./ListCollapseController";
import { competition_list } from "./api";

class CompetitionList extends Component {
  constructor() {
    super();
    this.state = {
      competition_list: [],
      competition_list_show: true,
      competition_list_ended: [],
      competition_list_ended_show: false,
    };
  }
  async componentDidMount() {
    try {
      let tmp_list = [];
      let tmp_list_ended = [];
      let data = await competition_list();
      data = JSON.parse(data);
      Object.values(data).forEach((row) =>
        row.status === "ended" ? tmp_list_ended.push(row) : tmp_list.push(row)
      );
      this.setState({
        competition_list: tmp_list,
        competition_list_ended: tmp_list_ended,
      });
    } catch (e) {
      console.log(e);
      alert('server is not reachable')
    }
  }

  render() {
    return (
      <div className="competition-list">
        <ListCollapseController
          title="進行中"
          show={this.state.competition_list_show}
          switch_content={() => {
            this.setState({
              competition_list_show: !this.state.competition_list_show,
            });
          }}
        ></ListCollapseController>

        <div
          className="competition-list-wrapper"
          style={{
            display: this.state.competition_list_show ? "grid" : "none",
          }}
        >
          {this.props.is_login ? (
            <CompetitionItem
              create={true}
              updateCompetitionList={this.props.updateCompetitionList}
              logout={this.props.logout}
            />
          ) : null}
          {this.state.competition_list.map((competition_info, index) => (
            <CompetitionItem
              key={index}
              name={competition_info.id}
              type={competition_info.type}
              time_limit={competition_info.time_limit}
              updateCompetitionList={this.props.updateCompetitionList}
            ></CompetitionItem>
          ))}
        </div>
        <br />
        <ListCollapseController
          title="已結束"
          show={this.state.competition_list_ended_show}
          switch_content={() => {
            this.setState({
              competition_list_ended_show:
                !this.state.competition_list_ended_show,
            });
          }}
        ></ListCollapseController>
        <div
          className="competition-list-wrapper"
          style={{
            display: this.state.competition_list_ended_show ? "grid" : "none",
          }}
        >
          {this.state.competition_list_ended.map((competition_info, index) => (
            <CompetitionItem
              key={index}
              name={competition_info.id}
              type={competition_info.type}
              time_limit={competition_info.time_limit}
              updateCompetitionList={this.props.updateCompetitionList}
            ></CompetitionItem>
          ))}
        </div>
      </div>
    );
  }
}

export default hot(module)(CompetitionList);
