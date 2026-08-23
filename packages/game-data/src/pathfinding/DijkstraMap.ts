/**
 * Represets a single cell in the grid for Dijkstra map (Flow Field).
 */
export interface GridNode {
  x: number;
  y: number;
  isWalkable: boolean;
  cost: number;
  distance: number;
}

/**
 * Calculates a Flow Field (Dijkstra Map) from the given target points out to all other walkable cells.
 * Enemies will use this map to navigate towards the nearest target by choosing the neighboring cell with the lowest distance.
 */
export class DijkstraMap {
  public width: number;
  public height: number;
  public grid: GridNode[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = this.createEmptyGrid();
  }

  private createEmptyGrid(): GridNode[][] {
    const grid: GridNode[][] = [];
    for (let y = 0; y < this.height; y++) {
      const row: GridNode[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          x,
          y,
          isWalkable: true,
          cost: 1, // Default cost to traverse this cell
          distance: Number.MAX_VALUE
        });
      }
      grid.push(row);
    }
    return grid;
  }

  /**
   * Sets a specific cell to be walkable or a wall (unwalkable).
   */
  public setWalkable(x: number, y: number, isWalkable: boolean): void {
    if (this.isValid(x, y)) {
      this.grid[y][x].isWalkable = isWalkable;
    }
  }

  private isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Calculates the Dijkstra map distances from one or more target coordinates.
   * Typically, the targets are the Joyas Sagradas.
   */
  public calculate(targets: {x: number, y: number}[]): void {
    // Reset distances
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x].distance = Number.MAX_VALUE;
      }
    }

    const queue: GridNode[] = [];

    // Initialize targets with distance 0 and push to queue
    for (const target of targets) {
      if (this.isValid(target.x, target.y) && this.grid[target.y][target.x].isWalkable) {
        this.grid[target.y][target.x].distance = 0;
        queue.push(this.grid[target.y][target.x]);
      }
    }

    // Process queue
    while (queue.length > 0) {
      // Very basic priority queue approach (for small grids, shift is fine; for large grids, use a real PriorityQueue)
      queue.sort((a, b) => a.distance - b.distance);
      const current = queue.shift()!;

      const neighbors = this.getNeighbors(current.x, current.y);
      for (const neighbor of neighbors) {
        if (!neighbor.isWalkable) continue;

        const newDistance = current.distance + neighbor.cost;
        if (newDistance < neighbor.distance) {
          neighbor.distance = newDistance;
          // Avoid pushing duplicates if we had a real PQ, but here we just push to evaluate
          // Since it's a simple BFS-like Dijkstra on grid with mostly uniform costs
          queue.push(neighbor);
        }
      }
    }
  }

  private getNeighbors(x: number, y: number): GridNode[] {
    const neighbors: GridNode[] = [];
    const dirs = [
      { dx: 0, dy: -1 }, // Up
      { dx: 1, dy: 0 },  // Right
      { dx: 0, dy: 1 },  // Down
      { dx: -1, dy: 0 }, // Left
      // Diagonals could be added here if we want 8-directional movement
    ];

    for (const dir of dirs) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      if (this.isValid(nx, ny)) {
        neighbors.push(this.grid[ny][nx]);
      }
    }
    return neighbors;
  }

  /**
   * Returns the neighboring cell that brings an entity closest to the target.
   * If the entity is stuck, returns null.
   */
  public getNextStep(x: number, y: number): GridNode | null {
    if (!this.isValid(x, y)) return null;

    let minDistance = this.grid[y][x].distance;
    let nextNode: GridNode | null = null;

    const neighbors = this.getNeighbors(x, y);
    for (const neighbor of neighbors) {
      if (neighbor.isWalkable && neighbor.distance < minDistance) {
        minDistance = neighbor.distance;
        nextNode = neighbor;
      }
    }

    return nextNode;
  }
}
