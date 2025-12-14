/**
 * Generic editor node entity - completely decoupled from simulation
 */
export interface EditorNode {
  id: string;
  x: number;
  y: number;
  label?: string;
  type?: string;
}

/**
 * Generic editor connection entity - completely decoupled from simulation
 */
export interface EditorConnection {
  id: string;
  fromId: string;
  toId: string;
}

