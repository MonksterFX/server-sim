import { createEditorExample } from "./example";

/**
 * Initializes the editor in the provided container element with a toolbar
 */
export function startEditor(containerId: string = "editor-container", toolbarId?: string): void {
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

  // Create toolbar
  const toolbar = createToolbar(editor, toolbarId);
  container.insertBefore(toolbar, container.firstChild);

  console.log("Editor started! Use window.editor and window.adapter to access instances.");
  console.log("Click on the grid to place nodes, drag to move them, select a node then click another to connect.");
}

/**
 * Creates a toolbar with editor control buttons
 */
function createToolbar(editor: any, toolbarId?: string): HTMLElement {
  const toolbar = document.createElement("div");
  toolbar.id = toolbarId || "editor-toolbar";
  toolbar.style.position = "absolute";
  toolbar.style.top = "10px";
  toolbar.style.left = "10px";
  toolbar.style.zIndex = "1000";
  toolbar.style.display = "flex";
  toolbar.style.gap = "8px";
  toolbar.style.padding = "8px";
  toolbar.style.background = "rgba(26, 26, 26, 0.9)";
  toolbar.style.borderRadius = "8px";
  toolbar.style.border = "1px solid #646cff";

  // Add Node button
  const addNodeBtn = createButton("Add Node", () => {
    editor.setConnectionMode(false);
    editor.setDeleteMode(false);
    // Place node at center of view (default viewBox is 0 0 1000 800)
    const centerX = 500;
    const centerY = 400;
    editor.createNodeAt(centerX, centerY);
  });
  toolbar.appendChild(addNodeBtn);

  // Delete Node button
  const deleteNodeBtn = createButton("Delete Node", () => {
    if (editor.isDeleteMode()) {
      editor.setDeleteMode(false);
      deleteNodeBtn.textContent = "Delete Node";
      deleteNodeBtn.style.background = "";
    } else {
      editor.setDeleteMode(true);
      editor.setConnectionMode(false);
      deleteNodeBtn.textContent = "Delete Mode (Click node/connection)";
      deleteNodeBtn.style.background = "#ff4444";
    }
  });
  toolbar.appendChild(deleteNodeBtn);

  // Connect Nodes button
  const connectBtn = createButton("Connect Nodes", () => {
    if (editor.isConnectionMode()) {
      editor.setConnectionMode(false);
      connectBtn.textContent = "Connect Nodes";
      connectBtn.style.background = "";
    } else {
      editor.setConnectionMode(true);
      editor.setDeleteMode(false);
      connectBtn.textContent = "Connect Mode (Select source, click target)";
      connectBtn.style.background = "#44ff44";
    }
  });
  toolbar.appendChild(connectBtn);

  // Delete Selected Node button
  const deleteSelectedBtn = createButton("Delete Selected", () => {
    const selectedId = editor.getSelectedNodeId();
    if (selectedId) {
      editor.deleteSelectedNode();
    } else {
      alert("No node selected. Click a node to select it first.");
    }
  });
  toolbar.appendChild(deleteSelectedBtn);

  return toolbar;
}

/**
 * Creates a styled button element
 */
function createButton(text: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = text;
  button.style.padding = "8px 16px";
  button.style.border = "1px solid #646cff";
  button.style.borderRadius = "4px";
  button.style.background = "#1a1a1a";
  button.style.color = "#ffffff";
  button.style.cursor = "pointer";
  button.style.fontSize = "14px";
  button.style.fontFamily = "system-ui, sans-serif";
  button.addEventListener("click", onClick);
  
  button.addEventListener("mouseenter", () => {
    button.style.background = "#2a2a2a";
  });
  
  button.addEventListener("mouseleave", () => {
    if (button.style.background !== "#ff4444" && button.style.background !== "#44ff44") {
      button.style.background = "#1a1a1a";
    }
  });

  return button;
}

