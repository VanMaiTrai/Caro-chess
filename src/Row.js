import { memo } from "react";
import Cell from "./Cell";

function Row({ rowIndex, data = [], onClick }) {

    return (
        <div className="row">
            {data.map((cell, cellIndex) =>
                <Cell data={cell} onClick={onClick} rowIndex={rowIndex} cellIndex={cellIndex} key={cellIndex} />
            )}
        </div>
    );
}

export default memo(Row)
