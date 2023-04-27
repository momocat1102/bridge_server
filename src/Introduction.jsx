import React, { Component } from "react";
import { hot } from "react-hot-loader";
import Article from "./IntroductionComponents/Article";
import SideWidget from "./IntroductionComponents/SideWidget";
import TableWidgetContent from "./IntroductionComponents/TableWidgetContent";
import PureWidgetContent from "./IntroductionComponents/PureWidgetContent";
import logoBar from "./logobar.png";
import aiiaImg from "./logoaiia.png";
import ncnuImg from "./logoncnu.png";

class Introduction extends Component {
  constructor() {
    super();
    this.state = {
      articles: [],
    };
  }

  importAll = (r) => {
    return r.keys().map(r);
  };
  componentDidMount() {
    this.setState({
      articles: this.importAll(
        require.context("./IntroductionComponents/articles", false, /\.(json)$/)
      ),
    });
  }

  render() {
    const tmp = [];
    const tmp2 = [];
    return (
      <div className="introduction_bear">
      <div className="introduction">
        <div className="bulletin width_75">
          <img src={logoBar} className="logo_bear" alt="intr"></img>
          {this.state.articles.map((article, index) => (
            <div key={index} className="article">
              <Article article={article}></Article>
            </div>
          ))}
        </div>
        <div className="side-widget width_25">
          <SideWidget
            header={"近期賽事"}
            content={<PureWidgetContent content={tmp2}></PureWidgetContent>}
          ></SideWidget>
          <SideWidget
            header={"TOP10 循環賽平均分數"}
            content={
              <TableWidgetContent
                header={["名次", "ID", "分數"]}
                body={tmp}
              ></TableWidgetContent>
            }
          ></SideWidget>
          <SideWidget
            header={"TOP10 淘汰賽冠軍次數"}
            content={
              <TableWidgetContent
                header={["名次", "ID", "次數"]}
                body={tmp}
              ></TableWidgetContent>
            }
          ></SideWidget>
        </div>
      </div>
      <div className="bottom_bear">
        <p>國立暨南國際大學資訊工程系人工智慧創新應用實驗室</p>
        <p>NCNU Artificial Intelligence Innovation & Application Labortory</p>
        <img src={ncnuImg} className="bottom_img" alt="ncnu"></img>
        <img src={aiiaImg} className="bottom_img" alt="aiia"></img>
      </div>
      </div>
    );
  }
}

export default hot(module)(Introduction);
