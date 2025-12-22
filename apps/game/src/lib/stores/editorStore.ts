import { derived, get, readable, writable } from "svelte/store";
import { Editor } from "@server-sim/editor";
import type { Editor as EditorType, EditorMode } from "@server-sim/editor";

type Listener<T> = (value: T) => void;

type EditorState = {
  mode: EditorType["mode"];
  selectedNodeType: EditorType["selectedNodeType"];
};

const initial: EditorState = {
  mode: "none",
  selectedNodeType: null,
};

/**c
 * Custom editor store with methods for managing the editor instance
 */
function createEditorStore() {
  const state = writable<EditorType | null>(null);

  const stores = Object.fromEntries(
    Object.entries(initial).map(([key, value]) => [
      key,
      writable(value)
    ])
  ) as {
    [K in keyof EditorState]: ReturnType<typeof writable<EditorState[K]>>;
  };

  function get<K extends keyof EditorState>(key: K): EditorState[K] {
    let value!: EditorState[K];
    stores[key].subscribe(v => (value = v))();
    return value;
  }

  function set<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    stores[key].set(value);
  }

  function subscribe<K extends keyof EditorState>(
    key: K,
    listener: Listener<EditorState[K]>
  ) {
    return stores[key].subscribe(listener);
  }

  return {
    subscribe,
    set,
    get,
    /**
     * Initializes the editor with the given container and options
     * @param container HTML element to mount the editor
     * @param options Editor configuration options
     */
    initialize(container: HTMLElement, options?: { cellSize: number }): void {
      const _editor = new Editor(container, options || { cellSize: 40 });
      state.set(_editor);
    },
    /**
     * Cleans up the editor instance
     */
    cleanup(): void {
      state.set(null);
    },
  };
}

/**
 * Editor store instance
 */
export const editor = createEditorStore();

