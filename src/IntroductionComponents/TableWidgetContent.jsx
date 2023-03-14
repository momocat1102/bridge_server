import React, { Component } from "react";
import { hot } from "react-hot-loader";

class TableWidgetContent extends Component {
  render() {
    return (
      <table className="table-widget-content">
        <thead>
          <tr>
            {this.props.header.map((d, index) => (
              <th key={index}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {this.props.body.map((d, index) => (
            <tr key={index}>
              <td>{d[0]}</td>
              <td>{d[1]}</td>
              <td>{d[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
export default hot(module)(TableWidgetContent);
