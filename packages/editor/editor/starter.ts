import { createEditorExample } from "./example";

/**
 * Initializes the editor in the provided container element
 * @param containerId The ID of the container element to mount the editor
 */
export function startEditor(containerId: string = "editor-container"): void {
  const container = document.getElementById(containerId);
  
  if (!container) {
    throw new Error(`Container element with id "${containerId}" not found`);
  }

  // Set up container styling if needed
  container.style.width = "100%";
  container.style.height = "800px";
  container.style.border = "1px solid #646cff";
  container.style.borderRadius = "8px";
  container.style.overflow = "hidden";
  container.style.position = "relative";

  // Create editor with network adapter
  const { editor, adapter } = createEditorExample(container);

  // Store references on window for debugging
  (window as any).editor = editor;
  (window as any).adapter = adapter;

  console.log("Editor started! Use window.editor and window.adapter to access instances.");
  console.log("Click on the grid to place nodes, drag to move them, select a node then click another to connect.");
}

