import { memo } from "react";
import { OValue, XValue } from "./constants";

function Cell({ data, onClick, rowIndex, cellIndex }) {
  const { value } = data;
  const hasValue = value === XValue ? XValue : value === OValue ? OValue : null;
  const cellClx =
    "cell " +
    (hasValue
      ? "has-value " + (value === XValue ? "x-value" : "o-value")
      : null);

  const clickHandler = () => onClick && onClick(rowIndex, cellIndex);

  return (
    <div className={cellClx} onClick={!hasValue ? clickHandler : undefined} />
  );
}

export default memo(Cell);
