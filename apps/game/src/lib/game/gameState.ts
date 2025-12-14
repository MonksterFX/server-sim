import type { Network } from "@server-sim/simulation";

export class GameState {
    state: "menu" | "playing" | "paused" | "gameover" = "menu";
    currentTick: number = 0;
    network?: Network;
}

