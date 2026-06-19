import { EXPAND_THRESHOLD, EXPAND_AMOUNT, MIN_INITIAL, CELL_SIZE } from "./constants";

/**
 * Calculate the initial board size so it fills the viewport
 * (slightly overflowing at edges) with a minimum of 30×30.
 */
export const calculateInitialBoardSize = () => {
  const HEADER_ESTIMATE = 50; // px taken by the game-state bar

  const availWidth = window.innerWidth;
  const availHeight = window.innerHeight - HEADER_ESTIMATE;

  // +2 so the board overflows a couple of cells at each edge
  const cols = Math.max(MIN_INITIAL, Math.floor(availWidth / CELL_SIZE) + 2);
  const rows = Math.max(MIN_INITIAL, Math.floor(availHeight / CELL_SIZE) + 2);

  return { rows, cols };
};

export const initializeGameData = (rows, cells) => {
  const data = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cells; j++) {
      row.push({ value: undefined });
    }
    data.push(row);
  }

  return data;
};

export const getNewDataAfterClicking = (data, rowIndex, cellIndex, value) => {
  const newData = [...data];
  const newRow = [...newData[rowIndex]];
  const newCell = { ...newRow[cellIndex], value };

  newRow[cellIndex] = newCell;
  newData[rowIndex] = newRow;

  return newData;
};

/**
 * Automatically expand the board when the player clicks near an edge.
 *
 * Returns the expanded data and the coordinate offset to apply to the
 * click position (since adding rows/cols at the top/left shifts indices).
 */
export const expandBoardIfNeeded = (data, rowIndex, cellIndex) => {
  const rows = data.length;
  const cols = data[0].length;

  let newData = data;
  let rowOffset = 0;
  let colOffset = 0;

  // --- Near top edge → prepend rows ---
  if (rowIndex < EXPAND_THRESHOLD) {
    const newRows = Array.from({ length: EXPAND_AMOUNT }, () =>
      Array.from({ length: newData[0].length }, () => ({ value: undefined }))
    );
    newData = [...newRows, ...newData];
    rowOffset = EXPAND_AMOUNT;
  }

  // --- Near bottom edge → append rows ---
  if (rows - rowIndex - 1 < EXPAND_THRESHOLD) {
    const newRows = Array.from({ length: EXPAND_AMOUNT }, () =>
      Array.from({ length: newData[0].length }, () => ({ value: undefined }))
    );
    newData = [...newData, ...newRows];
  }

  // --- Near left edge → prepend columns ---
  if (cellIndex < EXPAND_THRESHOLD) {
    newData = newData.map((row) => [
      ...Array.from({ length: EXPAND_AMOUNT }, () => ({ value: undefined })),
      ...row,
    ]);
    colOffset = EXPAND_AMOUNT;
  }

  // --- Near right edge → append columns ---
  if (cols - cellIndex - 1 < EXPAND_THRESHOLD) {
    newData = newData.map((row) => [
      ...row,
      ...Array.from({ length: EXPAND_AMOUNT }, () => ({ value: undefined })),
    ]);
  }

  return { data: newData, rowOffset, colOffset };
};

const isInBounds = (maxRows, maxCells, rowIndex, cellIndex) => {
  return (
    rowIndex >= 0 &&
    rowIndex < maxRows &&
    cellIndex >= 0 &&
    cellIndex < maxCells
  );
};

/**
 * Walk in `vector` direction from (rootRowIndex, rootCellIndex) and collect
 * all consecutive cells whose value matches the root cell's value.
 */
const getLineCells = (
  data,
  rootRowIndex,
  rootCellIndex,
  maxRows,
  maxCells,
  vector
) => {
  const cells = [];
  let rowIndex = rootRowIndex;
  let cellIndex = rootCellIndex;
  const value = data[rootRowIndex][rootCellIndex].value;

  while (isInBounds(maxRows, maxCells, rowIndex, cellIndex)) {
    const itemValue = data[rowIndex][cellIndex].value;
    if (itemValue !== value) break;
    cells.push({ row: rowIndex, cell: cellIndex });
    rowIndex += vector[0];
    cellIndex += vector[1];
  }

  return cells;
};

/**
 * Check if the player who just moved at (rootRowIndex, rootCellIndex) has won.
 *
 * Returns an array of winning cell coordinates [{row, cell}, ...] if the player
 * has 5+ consecutive pieces in any direction. Returns an empty array if no win.
 *
 * Win condition: 5 or more consecutive same-value pieces in any direction
 * (horizontal, vertical, or diagonal). Being blocked on both ends does NOT
 * invalidate a win — standard Caro / Gomoku rules.
 */
export const checkWin = (data, rootRowIndex, rootCellIndex) => {
  const maxRows = data.length;
  const maxCells = data[0].length;

  const directions = [
    [1, 0],   // vertical
    [0, 1],   // horizontal
    [1, 1],   // diagonal ↘
    [-1, 1],  // diagonal ↗
  ];

  for (let i = 0; i < directions.length; i++) {
    const vector = directions[i];
    const reverseVector = [-vector[0], -vector[1]];

    const forwardCells = getLineCells(
      data,
      rootRowIndex,
      rootCellIndex,
      maxRows,
      maxCells,
      vector
    );
    const backwardCells = getLineCells(
      data,
      rootRowIndex,
      rootCellIndex,
      maxRows,
      maxCells,
      reverseVector
    );

    // Combine: backward (excluding duplicated root) + forward
    const allCells = [...backwardCells.reverse().slice(0, -1), ...forwardCells];

    if (allCells.length >= 5) {
      return allCells;
    }
  }

  return [];
};
