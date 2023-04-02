import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { Link } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Item from "./Navbar/Item";
import LoginItem from "./Navbar/LoginItem";
import logoImage from "./logo.png"
import background from "./logoback.gif";

class Header extends Component {
  render() {
    const { updateCompetitionList, is_login, login, logout } = this.props;
    return (
      <div className="header" style={{ backgroundImage: `url(${background})` }}>
        <div className="logo-part">
          <Link to="/">
            <img
              alt={"蜜月橋牌AI競賽平台"}
              src={logoImage}
            />
          </Link>
        </div>
        <Navbar>
          <Item href={"/"} text={"首頁"}></Item>
          <Item href={"/document/蜜月橋牌規則"} text={"文件"}></Item>
          <Item href={"/competition_list"} text={"競賽列表"}></Item>
          <LoginItem
            updateCompetitionList={updateCompetitionList}
            is_login={is_login}
            login={login}
            logout={logout}
          ></LoginItem>
        </Navbar>
      </div>
    );
  }
}

export default hot(module)(Header);
