import { Component } from "react";
import { OValue, XValue, MIN_INITIAL } from "./constants";

import GameBoard from "./GameBoard";
import GameState from "./GameState";

import {
  calculateInitialBoardSize,
  checkWin,
  expandBoardIfNeeded,
  getNewDataAfterClicking,
  initializeGameData,
} from "./helper";
import Modal from "./Modal";

import "./styles.css";

export default class App extends Component {
  constructor(props) {
    super(props);
    const { rows, cols } = calculateInitialBoardSize();
    this.state = {
      data: initializeGameData(rows, cols),
      xTurn: true,
      playing: false,
      winValue: null,
      isDraw: false,
      moveCount: 0,
      lastMove: null,
      winningCells: [],
    };
  }

  clickHandler = (rowIndex, cellIndex) => {
    const { xTurn, data, moveCount } = this.state;
    const turnValue = xTurn ? XValue : OValue;

    // 1. Expand board if the click is near any edge
    const { data: expandedData, rowOffset, colOffset } = expandBoardIfNeeded(
      data,
      rowIndex,
      cellIndex
    );
    const adjustedRow = rowIndex + rowOffset;
    const adjustedCell = cellIndex + colOffset;

    // 2. Place the piece at the adjusted coordinates
    const newData = getNewDataAfterClicking(
      expandedData,
      adjustedRow,
      adjustedCell,
      turnValue
    );

    const newMoveCount = moveCount + 1;
    const lastMove = { row: adjustedRow, cell: adjustedCell };

    // 3. Check win using actual board dimensions
    const winResult = checkWin(newData, adjustedRow, adjustedCell);

    if (winResult.length > 0) {
      this.setState({
        data: newData,
        playing: false,
        winValue: turnValue,
        moveCount: newMoveCount,
        lastMove,
        winningCells: winResult,
      });
    } else {
      this.setState({
        data: newData,
        xTurn: !xTurn,
        moveCount: newMoveCount,
        lastMove,
        winningCells: [],
      });
    }
  };

  handleNewGame = () => {
    const { rows, cols } = calculateInitialBoardSize();
    this.setState({
      data: initializeGameData(rows, cols),
      xTurn: true,
      playing: true,
      winValue: null,
      isDraw: false,
      moveCount: 0,
      lastMove: null,
      winningCells: [],
    });
  };

  render() {
    const {
      playing,
      xTurn,
      data,
      winValue,
      isDraw,
      moveCount,
      lastMove,
      winningCells,
    } = this.state;
    const turnValue = xTurn ? XValue : OValue;
    const boardSize = `${data.length}×${data[0].length}`;

    // Show welcome modal only when game hasn't started
    const showWelcome = !playing && !winValue && !isDraw && moveCount === 0;
    // Show game-over modal when there's a winner
    const showGameOver = !playing && winValue && moveCount > 0;

    return (
      <div className="App">
        <GameState
          playing={playing}
          turnValue={turnValue}
          moveCount={moveCount}
          winValue={winValue}
          isDraw={isDraw}
          onNewGame={this.handleNewGame}
          boardSize={boardSize}
        />

        <GameBoard
          data={data}
          playing={playing}
          turnValue={turnValue}
          onClick={this.clickHandler}
          lastMove={lastMove}
          winningCells={winningCells}
        />

        {/* Welcome modal */}
        <Modal
          open={showWelcome}
          title="Welcome to Caro chess"
          content={
            <span>
              The board starts at <strong>{boardSize}</strong> (minimum {MIN_INITIAL}×{MIN_INITIAL}) and{" "}
              <strong>auto-expands</strong> as you play!<br />
              Win: 5 in a row, or 4 in a row with at least one end open
              (early win / thắng sớm)!
            </span>
          }
          actions={
            <button onClick={this.handleNewGame} className="action">
              Start game
            </button>
          }
        />

        {/* Game over modal */}
        <Modal
          open={showGameOver}
          title="Game over"
          content={
            <span>
              The{" "}
              <span
                className={winValue === XValue ? "x-value" : "o-value"}
              >
                {winValue}
              </span>{" "}
              won the game!
            </span>
          }
          actions={
            <button onClick={this.handleNewGame} className="action">
              New game
            </button>
          }
        />
      </div>
    );
  }
}
