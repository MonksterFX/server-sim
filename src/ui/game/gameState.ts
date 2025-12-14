import type { Network } from "../../game/flow";

class GameState {
    state: "menu" | "playing" | "paused" | "gameover" = "menu";
    currentTick: number = 0;
    network?: Network;
}

