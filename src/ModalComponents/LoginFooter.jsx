import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Shake } from "reshake";
import ModalButton from "./ModalButton";

class LoginFooter extends Component {
  render() {
    const { doSignin, loginChecking, loginFailTrigger } = this.props;
    return (
      <>
        <ModalButton
          text={"登入"}
          processing={loginChecking}
          onClick={doSignin}
          buttonColor={[90, 106, 87]}
          textColor={[255,255,255]}
        ></ModalButton>
        {loginFailTrigger && (
          <Shake h={10} v={0} r={3} q={1} fixed={true}>
            <div style={{ color: "rgb(179,58,58)" }}>
              <i className="fas fa-exclamation-circle"></i>
              <span> Login fail</span>
            </div>
          </Shake>
        )}
      </>
    );
  }
}

export default hot(module)(LoginFooter);
