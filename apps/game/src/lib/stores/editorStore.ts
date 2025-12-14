import { writable } from "svelte/store";
import { Editor } from "@server-sim/editor";
import type { Editor as EditorType } from "@server-sim/editor";

/**
 * Store for managing the editor instance
 */
export const editorStore = writable<EditorType | null>(null);

/**
 * Initializes the editor with the given container and options
 * @param container HTML element to mount the editor
 * @param options Editor configuration options
 */
export function initializeEditor(
  container: HTMLElement,
  options?: { cellSize: number }
): void {
  const editor = new Editor(container, options || { cellSize: 40 });
  editorStore.set(editor);
}

/**
 * Cleans up the editor instance
 */
export function cleanupEditor(): void {
  editorStore.set(null);
}
