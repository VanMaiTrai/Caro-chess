import { memo } from "react";
import { OValue, XValue } from "./constants";

function Cell({ data, onClick, rowIndex, cellIndex, isLastMove, isWinning }) {
  const { value } = data;
  const hasValue = value === XValue || value === OValue;

  let cellClx = "cell";
  if (hasValue) {
    cellClx += " has-value";
    cellClx += value === XValue ? " x-value" : " o-value";
  }
  if (isLastMove) {
    cellClx += " last-move";
  }
  if (isWinning) {
    cellClx += " winning-cell";
  }

  const clickHandler = () => onClick && onClick(rowIndex, cellIndex);

  return (
    <div
      className={cellClx}
      onClick={!hasValue ? clickHandler : undefined}
      data-row={rowIndex}
      data-cell={cellIndex}
    />
  );
}

export default memo(Cell);
