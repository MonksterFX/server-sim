/**
 * Grid configuration
 */
export interface GridConfig {
  cellSize: number;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  cellSize: 40,
};

/**
 * Converts pixel coordinates to grid coordinates
 * @param x X coordinate in pixels
 * @param y Y coordinate in pixels
 * @param config Grid configuration (optional, defaults to 40px cells)
 * @returns Grid coordinates as [col, row]
 */
export function pixelToGrid(
  x: number,
  y: number,
  config: GridConfig = DEFAULT_GRID_CONFIG
): [number, number] {
  const col = Math.floor(x / config.cellSize);
  const row = Math.floor(y / config.cellSize);
  return [col, row];
}

/**
 * Converts grid coordinates to pixel coordinates (center of grid cell)
 * @param col Grid column
 * @param row Grid row
 * @param config Grid configuration (optional, defaults to 40px cells)
 * @returns Pixel coordinates as [x, y] (center of cell)
 */
export function gridToPixel(
  col: number,
  row: number,
  config: GridConfig = DEFAULT_GRID_CONFIG
): [number, number] {
  const x = col * config.cellSize + config.cellSize / 2;
  const y = row * config.cellSize + config.cellSize / 2;
  return [x, y];
}

/**
 * Snaps pixel coordinates to the nearest grid point (center of grid cell)
 * @param x X coordinate in pixels
 * @param y Y coordinate in pixels
 * @param config Grid configuration (optional, defaults to 40px cells)
 * @returns Snapped pixel coordinates as [x, y]
 */
export function snapToGrid(
  x: number,
  y: number,
  config: GridConfig = DEFAULT_GRID_CONFIG
): [number, number] {
  const [col, row] = pixelToGrid(x, y, config);
  return gridToPixel(col, row, config);
}

/**
 * Creates an SVG pattern definition for grid rendering
 * @param config Grid configuration (optional, defaults to 40px cells)
 * @returns SVG pattern element string
 */
export function createGridPattern(
  config: GridConfig = DEFAULT_GRID_CONFIG
): string {
  const { cellSize } = config;
  return `
    <pattern id="grid" width="${cellSize}" height="${cellSize}" patternUnits="userSpaceOnUse">
      <path d="M ${cellSize} 0 L 0 0 0 ${cellSize}" fill="none" stroke="#e0e0e0" stroke-width="1"/>
    </pattern>
  `;
}

