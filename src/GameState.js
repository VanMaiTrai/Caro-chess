import { XValue, OValue } from "./constants";

export default function GameState({
  playing,
  turnValue,
  moveCount,
  winValue,
  isDraw,
  onNewGame,
  boardSize,
}) {
  let statusText;
  if (winValue) {
    statusText = (
      <span>
        <span className={winValue === XValue ? "x-value" : "o-value"}>
          {winValue}
        </span>{" "}
        won!
      </span>
    );
  } else if (isDraw) {
    statusText = <span>Draw</span>;
  } else if (playing) {
    statusText = (
      <span>
        Playing — Turn:{" "}
        <span className={turnValue === XValue ? "x-value" : "o-value"}>
          {turnValue}
        </span>
      </span>
    );
  } else {
    statusText = <span>Welcome</span>;
  }

  return (
    <div className="game-state">
      <span className="game-state__status">{statusText}</span>
      <span className="separator" />
      <span>Move: {moveCount}</span>
      <span className="separator" />
      <span>Board: {boardSize}</span>
      <div className="game-state__spacer" />
      <button onClick={onNewGame} className="action">
        {playing ? "Restart" : "New game"}
      </button>
    </div>
  );
}
