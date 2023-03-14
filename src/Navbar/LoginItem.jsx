import React, { Component } from "react";
import { hot } from "react-hot-loader";
import Modal from "../ModalComponents/Modal";
import LoginBody from "../ModalComponents/LoginBody";
import LoginFooter from "../ModalComponents/LoginFooter";
import { login } from "../api";

class LoginItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open_modal: false,
      username: "",
      password: "",
      login_checking: false,
      login_fail_trigger: false,
    };
  }
  do_signin = async () => {
    this.setState({ login_checking: true });
    try {
      await login(this.state.username, this.state.password);
      this.props.login();
      this.setState({
        open_modal: false,
        username: "",
        password: "",
        login_checking: false,
        login_fail_trigger: false,
      });
      this.props.updateCompetitionList();
    } catch (e) {
      console.log(e)
      this.setState({ login_fail_trigger: true });
    }
    this.setState({ login_checking: false });
  };
  switch_modal = () => {
    this.setState({
      open_modal: !this.state.open_modal,
    });
  };
  render() {
    return (
      <button
        onClick={this.props.is_login ? this.props.logout : this.switch_modal}
      >
        {this.props.is_login ? "登出" : "管理登入"}
        {!this.props.is_login && this.state.open_modal && (
          <Modal
            title={"管理登入"}
            model_content={
              <LoginBody
                defaultUsername={this.state.username}
                defaultPassword={this.state.password}
                onChangeUsername={(username)=>this.setState({ username: username, login_fail_trigger: false })}
                onChangePassword={(password)=>this.setState({ password: password, login_fail_trigger: false })}
              ></LoginBody>
            }
            model_footer={
              <LoginFooter
                doSignin={this.do_signin}
                loginChecking={this.state.login_checking}
                loginFailTrigger={this.state.login_fail_trigger}
              ></LoginFooter>
            }
            width={"35%"}
            margin_top={"10%"}
            close={this.switch_modal}
          ></Modal>
        )}
      </button>
    );
  }
}

export default hot(module)(LoginItem);
