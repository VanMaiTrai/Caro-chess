import { OValue, XValue } from "./constants";

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

const getOppositeValue = (value) => (value === XValue ? OValue : XValue);

const checkEdge = (maxRows, maxCells, rowIndex, cellIndex) => {
  return (
    rowIndex >= 0 &&
    rowIndex < maxRows &&
    cellIndex >= 0 &&
    cellIndex < maxCells
  );
};

const countValues = (
  data,
  rootRowIndex,
  rootCellIndex,
  maxRows,
  maxCells,
  vector
) => {
  let valueCount = 0;
  let oppositeValueCount = 0;
  let rowIndex = rootRowIndex;
  let cellIndex = rootCellIndex;
  const value = data[rootRowIndex][rootCellIndex].value;
  const oppositeValue = getOppositeValue(value);

  while (checkEdge(maxRows, maxCells, rowIndex, cellIndex)) {
    const itemValue = data[rowIndex][cellIndex].value;
    if (itemValue === value) {
      valueCount++;
    } else if (itemValue === oppositeValue) {
      oppositeValueCount++;
    }

    if (itemValue !== value) {
      break;
    }

    rowIndex += vector[0];
    cellIndex += vector[1];
  }

  return [valueCount, oppositeValueCount];
};

export const checkWin = (
  data,
  rootRowIndex,
  rootCellIndex,
  maxRows,
  maxCells
) => {
  const vectors = [
    [1, 0],
    [0, 1],
    [1, 1],
    [-1, 1],
  ];

  for (let i = 0; i < vectors.length; i++) {
    const vector = vectors[i];
    const revertVector = [-vector[0], -vector[1]];
    const countObj = countValues(
      data,
      rootRowIndex,
      rootCellIndex,
      maxRows,
      maxCells,
      vector
    );
    const revertCountObj = countValues(
      data,
      rootRowIndex,
      rootCellIndex,
      maxRows,
      maxCells,
      revertVector
    );

    console.log(countObj, revertCountObj);

    // win when row have 5 value, and does not block both two side
    if (
      countObj[0] + revertCountObj[0] - 1 === 5 &&
      countObj[1] + revertCountObj[1] !== 2
    ) {
      return true;
    }
  }

  return false;
};
