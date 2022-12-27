import { XValue } from "./constants";

export default function GameState({ turnValue, playing }) {
    return (
        <div className="game-state">
            State: {playing ? "Playing" : "Pause"}
            <span style={{ marginLeft: "24px" }} />
            {playing && "Turn: "}
            {playing && <span className={turnValue === XValue ? "x-value" : "o-value"}>{turnValue}</span>}
        </div >
    );
}
