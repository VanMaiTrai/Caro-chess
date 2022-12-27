import { useCallback } from "react";
import { OValue, XValue } from "./constants";
import Row from "./Row";

export default function GameBoard({ data = [[]], turnValue, playing, onClick }) {
    const containerClx = "game-board " + (playing && (turnValue === XValue ? "x-turn" : "o-turn"));

    return (
        <div className={containerClx}>
            {data.map((row, rowIndex) =>
                <Row data={row} key={rowIndex} rowIndex={rowIndex} onClick={playing && onClick} />
            )}
        </div>
    );
}
