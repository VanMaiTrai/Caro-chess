import { useEffect, useRef } from "react";
import { XValue, EXPAND_THRESHOLD } from "./constants";
import Row from "./Row";

export default function GameBoard({
  data = [[]],
  turnValue,
  playing,
  onClick,
  lastMove,
  winningCells,
}) {
  const boardRef = useRef(null);

  // Build a Set for O(1) winning-cell lookups
  const winningSet =
    winningCells &&
    new Set(winningCells.map((wc) => `${wc.row},${wc.cell}`));

  // Auto-scroll to the last move ONLY if it's near an edge (within EXPAND_THRESHOLD).
  // This avoids annoying scroll-jump when clicking in the middle of the board.
  useEffect(() => {
    if (!lastMove || !data.length) return;

    const rows = data.length;
    const cols = data[0].length;

    const nearEdge =
      lastMove.row < EXPAND_THRESHOLD ||
      rows - lastMove.row - 1 < EXPAND_THRESHOLD ||
      lastMove.cell < EXPAND_THRESHOLD ||
      cols - lastMove.cell - 1 < EXPAND_THRESHOLD;

    if (!nearEdge) return;

    // Small delay allows the DOM to render the new cell first
    const timer = setTimeout(() => {
      const cell = document.querySelector(
        `[data-row="${lastMove.row}"][data-cell="${lastMove.cell}"]`
      );
      if (cell) {
        cell.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [lastMove, data]);

  const containerClx =
    "game-board " + (playing && (turnValue === XValue ? "x-turn" : "o-turn"));

  return (
    <div className={containerClx} ref={boardRef}>
      {data.map((row, rowIndex) => (
        <Row
          data={row}
          key={rowIndex}
          rowIndex={rowIndex}
          onClick={playing && onClick}
          lastMove={lastMove}
          winningSet={winningSet}
        />
      ))}
    </div>
  );
}
