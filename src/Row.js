import { memo } from "react";
import Cell from "./Cell";

function Row({ rowIndex, data = [], onClick, lastMove, winningSet }) {
  return (
    <div className="row">
      {data.map((cell, cellIndex) => {
        const isLastMove =
          lastMove &&
          lastMove.row === rowIndex &&
          lastMove.cell === cellIndex;

        const isWinning = winningSet && winningSet.has(`${rowIndex},${cellIndex}`);

        return (
          <Cell
            data={cell}
            onClick={onClick}
            rowIndex={rowIndex}
            cellIndex={cellIndex}
            key={cellIndex}
            isLastMove={isLastMove}
            isWinning={isWinning}
          />
        );
      })}
    </div>
  );
}

export default memo(Row);
