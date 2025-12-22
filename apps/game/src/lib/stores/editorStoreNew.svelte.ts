import { Editor } from "@server-sim/editor";
import { Editor as EditorType } from "@server-sim/editor";
import { writable } from "svelte/store";

type EditorState = {
  mode: EditorType["mode"];
  selectedNodeType: EditorType["selectedNodeType"];
  selectedNodeId: EditorType["selectedNodeId"];
};

const initial: EditorState = {
  mode: "none",
  selectedNodeType: null,
  selectedNodeId: null,
};

/**
 * Custom editor store with methods for managing the editor instance
 */
export function createEditorStore() {
  const editor = writable<EditorType | null>(null);

  const state = $state(initial);

  // synchronize state with editor
  $effect(() => {
    editor.subscribe((v) => {
      state.mode = v?.mode || "none";
      state.selectedNodeType = v?.selectedNodeType || null;
      state.selectedNodeId = v?.getSelectedNodeId() || null;
    });
  });

  return {
...state,
    set mode(mode: EditorType["mode"]) {
        editor.update((v) => {
          if (v) {
            // reset mode if it is the same as the current mode
            v.mode = mode;
          }
          return v;
        });
      },

    set selectedNodeType(nodeType: EditorType["selectedNodeType"]) {
      editor.update((v) => {
        if (v) {
          v.selectedNodeType = nodeType;
        }
        return v;
      });
    },

    /**
     * Initializes the editor with the given container and options
     * @param container HTML element to mount the editor
     * @param options Editor configuration options
     */
    initialize(container: HTMLElement, options?: { cellSize: number }): void {
      const _editor = new Editor(container, options || { cellSize: 40 });
      editor.set(_editor);
    },
    /**
     * Cleans up the editor instance
     */
    cleanup(): void {
      editor.set(null);
      state.mode = "none";
      state.selectedNodeType = null;
    },
  };
}
