import { Component, PureComponent, useState } from "react";
import { gameCells, gameRows, OValue, XValue } from "./constants";

import GameBoard from "./GameBoard";
import GameState from "./GameState";

import { checkWin, getNewDataAfterClicking, initializeGameData, newDataAfterClicking } from "./helper";
import Modal from "./Modal";

import "./styles.css";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: initializeGameData(gameRows, gameCells),
      xTurn: true,
      playing: false,
      winValue: null
    }
  }

  clickHandler = (rowIndex, cellIndex) => {
    const { xTurn, data } = this.state;
    const turnValue = xTurn ? XValue : OValue;
    const newData = getNewDataAfterClicking(data, rowIndex, cellIndex, turnValue);

    if (checkWin(newData, rowIndex, cellIndex, gameRows, gameCells)) {
      this.setState({ playing: false, winValue: turnValue });
    }

    this.setState({ data: getNewDataAfterClicking(data, rowIndex, cellIndex, turnValue), xTurn: !xTurn });
  }

  handleNewGame = () => {
    this.setState({
      data: initializeGameData(gameRows, gameCells),
      xTurn: true,
      playing: true,
      winValue: null
    });
  }

  render() {
    const { playing, xTurn, data, winValue } = this.state;
    const turnValue = xTurn ? XValue : OValue;

    return (
      <div className="App">
        <GameState playing={playing} turnValue={turnValue} />
        <GameBoard data={data} playing={playing} turnValue={turnValue} onClick={this.clickHandler} />
        {!playing && winValue &&
          <Modal>
            <div>
              <p className="title">Game over</p>
              <p>The {winValue} won the game.</p>
              <div className="actions">
                <button onClick={this.handleNewGame} className="action">New game</button>
              </div>
            </div>
          </Modal>}
        {!playing && !winValue && <Modal>
          <div>
            <p className="title">Welcome to Caro chess</p>
            <div className="actions">
              <button onClick={this.handleNewGame} className="action">New game</button>
            </div>
          </div>
        </Modal>}
      </div>
    );
  }
}
