import React, { Component } from "react";
import { hot } from "react-hot-loader";
import ModalButton from "./ModalButton";

class DeleteCompetitionBody extends Component {
  render() {
    const { doCancel, doDelete } = this.props;

    return (
      <div className="modal-delete-competition-body">
        <div></div>
        <div></div>
        <ModalButton
          text={"取消"}
          onClick={doCancel}
          processing={false}
          buttonColor={[240, 240, 240]}
          textColor={[0, 0, 0]}
        ></ModalButton>
        <ModalButton
          text={"刪除"}
          onClick={doDelete}
          processing={false}
          buttonColor={[220, 53, 69]}
          textColor={[255, 255, 255]}
        ></ModalButton>
        <div></div>
        <div></div>
      </div>
    );
  }
}

export default hot(module)(DeleteCompetitionBody);
