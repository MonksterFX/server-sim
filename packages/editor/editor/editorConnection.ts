import type { EditorConnection } from "./types";

/**
 * Creates a new EditorConnection instance
 * @param id Unique identifier for the connection
 * @param fromId Source node ID
 * @param toId Target node ID
 * @returns New EditorConnection instance
 */
export function createEditorConnection(
  id: string,
  fromId: string,
  toId: string
): EditorConnection {
  return {
    id,
    fromId,
    toId,
  };
}

