import type { EditorNode } from "./types";

/**
 * Creates a new EditorNode instance
 * @param id Unique identifier for the node
 * @param x X coordinate in pixels
 * @param y Y coordinate in pixels
 * @param label Optional display label
 * @param type Optional node type identifier
 * @returns New EditorNode instance
 */
export function createEditorNode(
  id: string,
  x: number,
  y: number,
  label?: string,
  type?: string
): EditorNode {
  return {
    id,
    x,
    y,
    label,
    type,
  };
}

