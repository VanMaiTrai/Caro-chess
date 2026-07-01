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
 * has 5+ consecutive pieces in any direction, OR has 4 consecutive pieces with
 * at least one open end (early win / "thắng sớm"). Returns empty array if no win.
 *
 * Win conditions:
 * 1. 5+ consecutive same-value pieces in any direction.
 * 2. 4 consecutive pieces where BOTH sides have 2+ empty cells
 *    beyond them ("kiểm tra 2 ô về hai bên" – đảm bảo đối thủ
 *    không có quân gần để chặn đường lên 5 → thắng sớm).
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

    // Condition 1: 5+ consecutive → standard win
    if (allCells.length >= 5) {
      return allCells;
    }

    // Condition 2: 4 consecutive with both ends safe → early win
    // "Safe" means 2 cells beyond each end must be empty/in-bounds:
    //   - cell sát cạnh 4 quân phải trống
    //   - cell tiếp theo nữa cũng phải trống
    //   (đảm bảo đối thủ không kịp chặn đường lên 5)
    if (allCells.length === 4) {
      const lastCell = allCells[allCells.length - 1];
      const firstCell = allCells[0];

      // --- Forward (theo hướng vector) ---
      const f1Row = lastCell.row + vector[0];
      const f1Cell = lastCell.cell + vector[1];
      const f2Row = f1Row + vector[0];
      const f2Cell = f1Cell + vector[1];

      const forwardSafe =
        isInBounds(maxRows, maxCells, f1Row, f1Cell) &&
        data[f1Row][f1Cell].value === undefined &&
        isInBounds(maxRows, maxCells, f2Row, f2Cell) &&
        data[f2Row][f2Cell].value === undefined;

      // --- Backward (theo hướng ngược lại) ---
      const b1Row = firstCell.row + reverseVector[0];
      const b1Cell = firstCell.cell + reverseVector[1];
      const b2Row = b1Row + reverseVector[0];
      const b2Cell = b1Cell + reverseVector[1];

      const backwardSafe =
        isInBounds(maxRows, maxCells, b1Row, b1Cell) &&
        data[b1Row][b1Cell].value === undefined &&
        isInBounds(maxRows, maxCells, b2Row, b2Cell) &&
        data[b2Row][b2Cell].value === undefined;

      // Both ends must have 2 ô an toàn → early win
      if (forwardSafe && backwardSafe) {
        return allCells;
      }
    }
  }

  return [];
};
