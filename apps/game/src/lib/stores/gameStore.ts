import { writable } from "svelte/store";
import Game from "$lib/game/game";
import type { Szenario } from "$lib/game/szenario";

/**
 * Store for managing the game instance
 */
export const gameStore = writable<Game | null>(null);

/**
 * Creates a new game instance
 * @returns New Game instance
 */
export function createGame(): Game {
  const game = new Game();
  gameStore.set(game);
  return game;
}

/**
 * Gets the current game instance, creating one if it doesn't exist
 * @returns Current Game instance
 */
export function getGame(): Game {
  let game: Game | null = null;
  gameStore.subscribe((value) => {
    game = value;
  })();

  if (!game) {
    game = createGame();
  }

  return game;
}

/**
 * Loads a szenario into the game
 * @param szenario The szenario to load
 */
export function loadSzenario(szenario: Szenario): void {
  const game = getGame();
  game.loadSzenario(szenario);
}
