import React, { Component } from "react";
import { hot } from "react-hot-loader";

class LoginBody extends Component {
  render() {
    const { defaultUsername, defaultPassword, onChangeUsername, onChangePassword } = this.props;
    
    return (
      <div>
        <form>
          <div className="form-group">
            <label>Username</label>
            <input
              autoComplete="on"
              value={defaultUsername}
              onChange={(e) => onChangeUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              autoComplete="on"
              value={defaultPassword}
              onChange={(e) => onChangePassword(e.target.value)}
            />
          </div>
        </form>
      </div>
    );
  }
}

export default hot(module)(LoginBody);
