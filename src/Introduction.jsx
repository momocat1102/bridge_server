import React, { Component } from "react";
import { hot } from "react-hot-loader";
import Article from "./IntroductionComponents/Article";
import SideWidget from "./IntroductionComponents/SideWidget";
import TableWidgetContent from "./IntroductionComponents/TableWidgetContent";
import PureWidgetContent from "./IntroductionComponents/PureWidgetContent";
import logoBar from "./logobar.png";

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
      <div className="introduction">
        <div className="bulletin width_75">
          {this.state.articles.map((article, index) => (
            <div key={index} className="article">
              <img src={logoBar} className="width_100 logo_bear"></img>
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
    );
  }
}

export default hot(module)(Introduction);
