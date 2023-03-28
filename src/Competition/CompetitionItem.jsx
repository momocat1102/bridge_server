import React, { Component } from "react";
import { Link } from "react-router-dom";
import { hot } from "react-hot-loader";
import Modal from "../ModalComponents/Modal";
import CreateCompetitionBody from "../ModalComponents/CreateCompetitionBody";
import { create_competition, delete_competition } from "../api";
import ModalButton from "../ModalComponents/ModalButton";
import DeleteCompetitionBody from "../ModalComponents/DeleteCompetitionBody";

class CompetitionItem extends Component {
  constructor() {
    super();
    this.state = {
      open_create_modal: false,
      open_delete_modal: false,
      competition_name: this.generateRandomHash(),
      competition_type: "round-robin",
      time_limit: 3,
      num: 10,
      create_checking: false,
      delete_checking: false,
    };
  }

  generateRandomHash = () => {
    let template =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let string = "";
    for (let i = 0; i < 10; i++) {
      string += template[parseInt(Math.random() * template.length)];
    }
    return string;
  };

  do_create = async () => {
    this.setState({ create_checking: true });
    try {
      await create_competition(
        this.state.competition_name,
        this.state.competition_type,
        this.state.time_limit,
        this.state.num
      );
      this.setState({
        open_create_modal: false,
        open_delete_modal: false,
        competition_name: this.generateRandomHash(),
        competition_type: "round-robin",
        time_limit: 15,
        num: 10,
        create_checking: false,
        delete_checking: false,
      });
      this.props.updateCompetitionList();
    } catch (e) {
      console.log(e);
      this.setState({ create_checking: false });
      alert("create fail");
    }
  };
  do_delete = async (name) => {
    this.setState({ delete_checking: true });
    try {
      await delete_competition(name);
      this.setState({
        open_delete_modal: false,
        delete_checking: false,
      });
      this.props.updateCompetitionList();
    } catch (e) {
      this.setState({ delete_checking: false });
      alert("delete fail");
    }
  };
  switch_create_modal = () => {
    this.setState({
      open_create_modal: !this.state.open_create_modal,
      competition_name: this.generateRandomHash(),
    });
  };
  switch_delete_modal = () => {
    this.setState({
      open_delete_modal: !this.state.open_delete_modal,
    });
  };
  render() {
    const { name, type, time_limit } = this.props;
    return this.props.create ? (
      <>
        <div
          className="competition-item-create"
          onClick={this.switch_create_modal}
        >
          <span style={{ alignSelf: "center" }}>+</span>
        </div>
        {this.state.open_create_modal && (
          <Modal
            title={"建立比賽"}
            model_content={
              <CreateCompetitionBody
                defaultName={this.state.competition_name}
                defaultType={this.state.competition_type}
                defaultTimeLimit={this.state.time_limit}
                defaultnum={this.state.num}
                onChangeName={(name) =>
                  this.setState({ competition_name: name })
                }
                onChangeType={(type) =>
                  this.setState({ competition_type: type })
                }
                onChangeTimeLimit={(time_limit) =>
                  this.setState({ time_limit: time_limit })
                }
                onChangenum={(num) =>
                  this.setState({ num: num })
                }
              ></CreateCompetitionBody>
            }
            model_footer={
              <ModalButton
                text={"建立"}
                onClick={this.do_create}
                processing={this.state.create_checking}
                buttonColor={[90, 106, 87]}
                textColor={[255, 255, 255]}
              ></ModalButton>
            }
            width={"35%"}
            margin_top={"10%"}
            close={this.switch_create_modal}
          ></Modal>
        )}
      </>
    ) : (
      <>
        <Link to={"/competition/" + name} className="competition-item">
          <i
            className="far fa-times-circle fa-lg"
            onClick={(e) => {
              e.preventDefault();
              this.switch_delete_modal();
            }}
          ></i>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{name}</div>
            <div>{type === "round-robin" ? "循環賽" : "淘汰賽"}</div>
            <div>時間限制{time_limit}分鐘</div>
          </div>
        </Link>
        {this.state.open_delete_modal && (
          <Modal
            title={"確定刪除？"}
            model_content={
              <DeleteCompetitionBody
                doCancel={this.switch_delete_modal}
                doDelete={()=>this.do_delete(name)}
              ></DeleteCompetitionBody>
            }
            model_footer={<div></div>}
            width={"35%"}
            margin_top={"10%"}
            close={this.switch_delete_modal}
          ></Modal>
        )}
      </>
    );
  }
}

export default hot(module)(CompetitionItem);
