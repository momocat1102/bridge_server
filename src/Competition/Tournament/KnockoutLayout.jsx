import React, { Component } from "react";
import { hot } from "react-hot-loader";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Modal from "../../ModalComponents/Modal";
import Board from "../Board";
import { restart_game, assign_winner, download_history } from "../../api";
import WinnerChooserBody from "../../ModalComponents/WinnerChooserBody";
import HistoryButtonFooter from "../../ModalComponents/HistoryButtonFooter";

class KnockoutLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open_modal: false,
      open_modal_winner_chooser: false,
    };
    this.modal_player_a = null;
    this.modal_player_b = null;
    this.open_modal = this.open_modal.bind(this);
    this.open_modal_winner_chooser = this.open_modal_winner_chooser.bind(this);
    this.contextMenuHandler = this.contextMenuHandler.bind(this);

    this.max_length = -1;
    Object.keys(this.props.player_list).forEach(
      (player) => (this.max_length = Math.max(player.length, this.max_length))
    );
    this.tree_unit_size = 25;
    this.tree_font_size = 16;
    this.tree_leaf_counter = 0;
    this.plots = [];
    this.svg_width = 0;
    this.svg_height = 0;
  }

  open_modal(player_a, player_b) {
    this.modal_player_a = player_a;
    this.modal_player_b = player_b;
    this.setState({ open_modal: !this.state.open_modal });
  }

  open_modal_winner_chooser(game_id, player_a, player_b) {
    this.game_id = game_id;
    this.modal_player_a = player_a;
    this.modal_player_b = player_b;
    this.setState({
      open_modal_winner_chooser: !this.state.open_modal_winner_chooser,
    });
  }

  async contextMenuHandler(e, data, target) {
    if (data.action === "restart") {
      try {
        await restart_game(
          this.props.competition_id,
          target.getAttribute("game_id")
        );
      } catch (e) {
        alert("重啟失敗");
      }
    } else if (data.action === "assign-winner") {
      this.open_modal_winner_chooser(
        target.getAttribute("game_id"),
        target.getAttribute("player_a"),
        target.getAttribute("player_b")
      );
    }
  }

  doAssignWinner = async (game_id, winner) => {
    try {
      await assign_winner(this.props.competition_id, game_id, winner);
      this.setState({ open_modal_winner_chooser: false });
    } catch (e) {
      alert("指派失敗");
    }
  };

  build_node(g_x, g_y, player_a, player_b, winner, final_winner) {
    let w = g_x + this.max_length * this.tree_font_size;
    this.svg_width = w > this.svg_width ? w : this.svg_width;
    let h = g_y + this.tree_unit_size * 2;
    this.svg_height = h > this.svg_height ? h : this.svg_height;
    return (
      <ContextMenuTrigger
        id={
          (player_a !== "" &&
            player_b !== "" &&
            this.props.is_login &&
            this.props.status !== "end") ||
          (player_a !== "" &&
            player_b !== "" &&
            this.props.competition_id.includes("test"))
            ? "contextmenu"
            : ""
        }
        renderTag={"g"}
        attributes={{
          className: "node",
          transform: `translate(${g_x}, ${g_y})`,
          onClick: (e) =>
            player_a === "" || player_b === ""
              ? null
              : this.open_modal(player_a, player_b),
          style:
            player_a === "" || player_b === "" ? null : { cursor: "pointer" },
          game_id: `${player_a}_${player_b}`,
          player_a: player_a,
          player_b: player_b,
        }}
      >
        <rect
          width={this.max_length * this.tree_font_size}
          height={this.tree_unit_size * 2}
          rx="5"
        />
        {winner === player_a ? (
          <rect
            x={this.max_length * this.tree_font_size * 0.0}
            y={this.tree_unit_size * 0.0}
            width={this.max_length * this.tree_font_size * 1.0}
            height={this.tree_unit_size * 1.0}
            style={{ fill: "gray", stroke: "none" }}
          />
        ) : null}
        {final_winner !== undefined && final_winner === player_a ? (
          <text x={5} y={(this.tree_unit_size * 2 * 2) / 6}>
            {"👑 "}
          </text>
        ) : null}
        <text
          x={(this.max_length * (this.tree_font_size / 2)) / 2}
          y={(this.tree_unit_size * 2 * 2) / 6}
        >
          {player_a}
        </text>
        {winner === player_b ? (
          <rect
            x={this.max_length * this.tree_font_size * 0.0}
            y={this.tree_unit_size}
            width={this.max_length * this.tree_font_size * 1.0}
            height={this.tree_unit_size * 1.0}
            style={{ fill: "gray", stroke: "none" }}
          />
        ) : null}
        <text
          x={(this.max_length * (this.tree_font_size / 2)) / 2}
          y={(this.tree_unit_size * 2 * 5) / 6}
        >
          {player_b}
        </text>
      </ContextMenuTrigger>
    );
  }

  build_line(froms) {
    let path = null;
    if (froms.length === 1) {
      path = (
        <path
          className="link"
          d={`M${froms[0].x} ${froms[0].y} L${
            froms[0].x + this.tree_unit_size * 2
          } ${froms[0].y}`}
        ></path>
      );
    } else if (froms.length === 2) {
      let center = (froms[0].y + froms[1].y) / 2;
      path = (
        <>
          <path
            className="link"
            d={`  
              M${froms[0].x} ${froms[0].y}
              L${froms[0].x + this.tree_unit_size} ${froms[0].y}
              L${froms[0].x + this.tree_unit_size} ${center}
            `}
          ></path>
          <path
            className="link"
            d={`
            M${froms[1].x} ${froms[1].y}
            L${froms[1].x + this.tree_unit_size} ${froms[1].y}
            L${froms[1].x + this.tree_unit_size} ${center}
            `}
          ></path>
          <path
            className="link"
            d={`
              M${froms[0].x + this.tree_unit_size} ${center}
              L${froms[0].x + this.tree_unit_size * 2} ${center}
            `}
          ></path>
        </>
      );
    }
    this.plots.push(path);
  }

  traversal(tree_meta, final_winner) {
    if (typeof tree_meta.g[0] !== "object") {
      let g_x = 0;
      let g_y =
        this.tree_unit_size + this.tree_leaf_counter * this.tree_unit_size * 3;
      let node = this.build_node(0, g_y, tree_meta.g[0], "");
      this.plots.push(node);
      this.tree_leaf_counter += 1;
      return { x: g_x, y: g_y };
    }
    let children = [];
    let is_children_complete = true;
    let win_players = [];
    for (let i = 0; i < tree_meta.g.length; i++) {
      children.push(this.traversal(tree_meta.g[i]));
      if (tree_meta.g[i].w === undefined) {
        is_children_complete = false;
      } else {
        win_players.push(tree_meta.g[i].w);
      }
    }
    if (is_children_complete) {
      let player_a = win_players[0];
      let player_b = win_players[1] === undefined ? "" : win_players[1];
      let g_x =
        children[0].x +
        this.max_length * this.tree_font_size +
        this.tree_unit_size * 2;
      let g_y = 0;
      children.forEach((child) => (g_y += child.y));
      g_y /= children.length;
      let winner = player_a !== "" && player_b !== "" ? tree_meta.w : undefined;
      let node = this.build_node(
        g_x,
        g_y,
        player_a,
        player_b,
        winner,
        final_winner
      );
      this.plots.push(node);

      let froms = [];
      children.forEach((child) =>
        froms.push({
          x: child.x + this.max_length * this.tree_font_size,
          y: child.y + this.tree_unit_size,
        })
      );
      this.build_line(froms);
      return { x: g_x, y: g_y };
    }
  }

  renderTree() {
    this.tree_leaf_counter = 0;
    this.plots = [];
    this.svg_height = 0;
    this.svg_width = 0;
    if (this.props.game_tree !== undefined) {
      this.traversal(this.props.game_tree, this.props.game_tree.winner);
    }
  }

  downloadHistory = async (competition_id, game_id, filename) => {
    try {
      await download_history(competition_id, game_id, filename);
    } catch (e) {
      alert("下載失敗");
    }
  };

  render() {
    this.renderTree();
    return (
      <div className="knockout-layout">
        <svg
          style={{
            height: this.svg_height + this.tree_unit_size,
            width: this.svg_width + this.tree_unit_size,
          }}
        >
          <g>
            {this.plots.map((plot, index) => (
              <KeyedComponent key={index}>{plot}</KeyedComponent>
            ))}
          </g>
        </svg>
        {this.state.open_modal && (
          <Modal
            title={""}
            model_content={
              (this.props.time_limit[
                `${this.modal_player_a}_${this.modal_player_b}`
              ] ===
                undefined) |
              (this.props.stone_count[
                `${this.modal_player_a}_${this.modal_player_b}`
              ] ===
                undefined) |
              (this.props.board[
                `${this.modal_player_a}_${this.modal_player_b}`
              ] ===
                undefined) ? (
                <div>玩家協調中</div>
              ) : (
                <Board
                  size={this.props.board_size}
                  black={
                    this.props.player_color[
                      `${this.modal_player_a}_${this.modal_player_b}`
                    ] !== undefined
                      ? this.props.player_color[
                          `${this.modal_player_a}_${this.modal_player_b}`
                        ].black
                      : this.modal_player_a
                  }
                  black_time_limit={
                    this.props.time_limit[
                      `${this.modal_player_a}_${this.modal_player_b}`
                    ].black
                  }
                  black_stone_count={
                    this.props.stone_count[
                      `${this.modal_player_a}_${this.modal_player_b}`
                    ].black
                  }
                  black_win_times={
                    this.props.win_times[
                      `${this.modal_player_a}_${this.modal_player_b}`
                    ].black
                  }
                  white={
                    this.props.player_color[
                      `${this.modal_player_a}_${this.modal_player_b}`
                    ] !== undefined
                      ? this.props.player_color[
                          `${this.modal_player_a}_${this.modal_player_b}`
                        ].white
                      : this.modal_player_b
                  }
                  white_time_limit={
                    this.props.time_limit[
                      `${this.modal_player_a}_${this.modal_player_b}`
                    ].white
                  }
                  white_stone_count={
                    this.props.stone_count[
                      `${this.modal_player_a}_${this.modal_player_b}`
                    ].white
                  }
                  white_win_times={
                    this.props.win_times[
                      `${this.modal_player_a}_${this.modal_player_b}`
                    ].white
                  }
                  board={
                    this.props.board[
                      this.modal_player_a + "_" + this.modal_player_b
                    ]
                  }
                  last_move={
                    this.props.last_move[
                      this.modal_player_a + "_" + this.modal_player_b
                    ]
                  }
                ></Board>
              )
            }
            model_footer={
              this.props.status === "end" ? (
                <HistoryButtonFooter
                  history_time={this.props.history_time}
                  game_id={this.modal_player_a + "_" + this.modal_player_b}
                  loadHistory={this.props.loadHistory}
                ></HistoryButtonFooter>
              ) : (
                <div></div>
              )
            }
            width={"52%"}
            margin_top={"1%"}
            close={this.open_modal}
            download={this.props.status === "end" ? true : false}
            download_cb={(e) =>
              this.downloadHistory(
                this.props.competition_id,
                this.modal_player_a + "_" + this.modal_player_b,
                this.modal_player_a + "_" + this.modal_player_b
              )
            }
          ></Modal>
        )}
        <ContextMenu id="contextmenu">
          <MenuItem
            onClick={this.contextMenuHandler}
            data={{ action: "restart" }}
          >
            重新開始
          </MenuItem>
          <MenuItem
            onClick={this.contextMenuHandler}
            data={{ action: "assign-winner" }}
          >
            指定贏家
          </MenuItem>
        </ContextMenu>
        {this.state.open_modal_winner_chooser && (
          <Modal
            title={"選擇贏家"}
            model_content={
              <WinnerChooserBody
                game_id={this.game_id}
                player_a={this.modal_player_a}
                player_b={this.modal_player_b}
                doAssignWinner={this.doAssignWinner}
              ></WinnerChooserBody>
            }
            model_footer={<div></div>}
            width={"35%"}
            margin_top={"10%"}
            close={this.open_modal_winner_chooser}
          ></Modal>
        )}
      </div>
    );
  }
}
class KeyedComponent extends Component {
  render() {
    return this.props.children;
  }
}

export default hot(module)(KnockoutLayout);
