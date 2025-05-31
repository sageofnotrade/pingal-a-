import { ref, reactive } from 'vue';

// Define grid cell type
interface GridCell {
  row: number;
  col: number;
  f: number; // Total cost (g + h)
  g: number; // Cost from start to current
  h: number; // Heuristic (estimated cost from current to end)
  isObstacle: boolean;
  parent: GridCell | null;
}

// Define pathfinding state
interface PathfindingState {
  grid: GridCell[][];
  openSet: GridCell[];
  closedSet: GridCell[];
  path: GridCell[];
  isRunning: boolean;
  isDone: boolean;
  startCell: GridCell | null;
  endCell: GridCell | null;
}

export function usePathfinding(gridSize: number = 10) {
  // Initialize pathfinding state
  const state = reactive<PathfindingState>({
    grid: [],
    openSet: [],
    closedSet: [],
    path: [],
    isRunning: false,
    isDone: false,
    startCell: null,
    endCell: null
  });

  // Initialize grid
  const initializeGrid = (obstacles: boolean[][]) => {
    state.grid = [];
    state.openSet = [];
    state.closedSet = [];
    state.path = [];
    state.isRunning = false;
    state.isDone = false;
    state.startCell = null;
    state.endCell = null;

    // Create grid cells
    for (let row = 0; row < gridSize; row++) {
      const gridRow: GridCell[] = [];
      for (let col = 0; col < gridSize; col++) {
        gridRow.push({
          row,
          col,
          f: 0,
          g: 0,
          h: 0,
          isObstacle: obstacles[row][col],
          parent: null
        });
      }
      state.grid.push(gridRow);
    }
  };

  // Set start and end positions
  const setStartAndEnd = (startRow: number, startCol: number, endRow: number, endCol: number) => {
    state.startCell = state.grid[startRow][startCol];
    state.endCell = state.grid[endRow][endCol];

    // Add start cell to open set
    state.openSet = [state.startCell];
  };

  // Calculate Manhattan distance heuristic
  const heuristic = (a: GridCell, b: GridCell): number => {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  };

  // Get valid neighbors of a cell
  const getNeighbors = (cell: GridCell): GridCell[] => {
    const neighbors: GridCell[] = [];
    const { row, col } = cell;

    // Check all four directions (up, right, down, left)
    const directions = [
      { row: -1, col: 0 }, // up
      { row: 0, col: 1 },  // right
      { row: 1, col: 0 },  // down
      { row: 0, col: -1 }  // left
    ];

    for (const dir of directions) {
      const newRow = row + dir.row;
      const newCol = col + dir.col;

      // Check if within grid bounds
      if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
        // Make sure the grid cell exists
        if (state.grid[newRow] && state.grid[newRow][newCol]) {
          const neighbor = state.grid[newRow][newCol];

          // Skip obstacles
          if (!neighbor.isObstacle) {
            neighbors.push(neighbor);
          }
        }
      }
    }

    return neighbors;
  };

  // Reconstruct path from end to start
  const reconstructPath = () => {
    try {
      state.path = [];

      // Safety check
      if (!state.endCell) {
        console.warn('Cannot reconstruct path: end cell is not defined');
        return;
      }

      let current = state.endCell;
      let maxIterations = gridSize * gridSize; // Prevent infinite loops
      let iterations = 0;

      // Add end cell to path
      state.path.unshift(current);

      // Follow parent links back to start
      while (current && current.parent && iterations < maxIterations) {
        current = current.parent;
        state.path.unshift(current);
        iterations++;
      }

      // If we hit the iteration limit, log a warning
      if (iterations >= maxIterations) {
        console.warn('Maximum iterations reached while reconstructing path');
      }

      // If path only contains the end cell, add the start cell
      if (state.path.length === 1 && state.startCell) {
        state.path.unshift(state.startCell);
      }
    } catch (error) {
      console.error('Error in reconstructPath:', error);
      // Initialize an empty path to prevent further errors
      state.path = [];
    }
  };

  // Perform one step of A* algorithm
  const step = (): boolean => {
    try {
      // Check if there are no more cells to evaluate or if end cell is not set
      if (!state.openSet || state.openSet.length === 0 || !state.endCell) {
        // No solution or end not set
        state.isDone = true;
        return false;
      }

      // Find the cell with the lowest f score in the open set
      let lowestIndex = 0;
      for (let i = 0; i < state.openSet.length; i++) {
        if (state.openSet[i] && state.openSet[lowestIndex] &&
            state.openSet[i].f < state.openSet[lowestIndex].f) {
          lowestIndex = i;
        }
      }

      // Safety check for valid index
      if (lowestIndex >= state.openSet.length) {
        console.warn('Invalid lowest index, resetting to 0');
        lowestIndex = 0;
      }

      // Make sure we have a valid cell
      if (!state.openSet[lowestIndex]) {
        console.warn('No valid cell found in open set');
        return false;
      }

      const current = state.openSet[lowestIndex];

      // Check if we reached the end
      if (current === state.endCell) {
        reconstructPath();
        state.isDone = true;
        return true;
      }

      // Remove current from open set and add to closed set
      state.openSet.splice(lowestIndex, 1);

      // Make sure we don't add duplicates to closed set
      if (!state.closedSet.includes(current)) {
        state.closedSet.push(current);
      }

      // Check all neighbors
      const neighbors = getNeighbors(current);

      // If no valid neighbors, continue to next cell
      if (!neighbors || neighbors.length === 0) {
        return false;
      }

      for (const neighbor of neighbors) {
        // Skip if neighbor is null or undefined
        if (!neighbor) continue;

        // Skip if already evaluated
        if (state.closedSet.includes(neighbor)) {
          continue;
        }

        // Calculate g score (distance from start)
        const tentativeG = current.g + 1; // Cost is 1 for each step

        // Check if this path is better
        let newPath = false;
        if (state.openSet.includes(neighbor)) {
          if (tentativeG < neighbor.g) {
            neighbor.g = tentativeG;
            newPath = true;
          }
        } else {
          neighbor.g = tentativeG;
          newPath = true;
          state.openSet.push(neighbor);
        }

        // Update scores if we found a better path
        if (newPath && state.endCell) {
          neighbor.h = heuristic(neighbor, state.endCell);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
        }
      }

      // Continue algorithm
      return false;
    } catch (error) {
      console.error('Error in step function:', error);
      // If we encounter an error, mark as done to prevent infinite loops
      state.isDone = true;
      return false;
    }
  };

  // Run the entire algorithm
  const findPath = (
    obstacles: boolean[][],
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): Promise<GridCell[]> => {
    return new Promise((resolve, reject) => {
      try {
        // Initialize grid and set start/end
        initializeGrid(obstacles);

        // Check if start or end is an obstacle
        if (obstacles[startRow][startCol] || obstacles[endRow][endCol]) {
          state.isRunning = false;
          reject(new Error('Start or end point is an obstacle'));
          return;
        }

        // Check if start and end are the same
        if (startRow === endRow && startCol === endCol) {
          // If start and end are the same, return a path with just that cell
          const singleCellPath = [{
            row: startRow,
            col: startCol,
            f: 0,
            g: 0,
            h: 0,
            isObstacle: false,
            parent: null
          }];
          resolve(singleCellPath);
          return;
        }

        setStartAndEnd(startRow, startCol, endRow, endCol);

        state.isRunning = true;

        // Maximum number of steps to prevent infinite loops
        let maxSteps = gridSize * gridSize * 2;
        let currentStep = 0;

        // Run algorithm with animation frames
        const runStep = () => {
          try {
            currentStep++;
            const isDone = step();

            if (isDone) {
              state.isRunning = false;
              resolve(state.path);
            } else if (state.openSet.length === 0) {
              state.isRunning = false;
              reject(new Error('No path found'));
            } else if (currentStep > maxSteps) {
              // If we've exceeded the maximum number of steps, assume we've found a path
              // This prevents infinite loops
              console.warn('Maximum steps exceeded, stopping algorithm');
              reconstructPath();
              state.isRunning = false;
              resolve(state.path);
            } else {
              requestAnimationFrame(runStep);
            }
          } catch (error) {
            console.error('Error in runStep:', error);
            // If there's an error but we have a path, return it
            if (state.endCell && state.endCell.parent) {
              reconstructPath();
              state.isRunning = false;
              resolve(state.path);
            } else {
              state.isRunning = false;
              reject(error);
            }
          }
        };

        runStep();
      } catch (error) {
        console.error('Error in findPath:', error);
        state.isRunning = false;
        reject(error);
      }
    });
  };

  // Return the composable API
  return {
    state,
    initializeGrid,
    setStartAndEnd,
    step,
    findPath
  };
}