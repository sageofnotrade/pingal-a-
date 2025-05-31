import { ref, reactive } from 'vue';

export function usePathfinding(gridSize = 10) {
  // Initialize pathfinding state
  const state = reactive({
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
  const initializeGrid = (obstacles) => {
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
      const gridRow = [];
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
  const setStartAndEnd = (startRow, startCol, endRow, endCol) => {
    state.startCell = state.grid[startRow][startCol];
    state.endCell = state.grid[endRow][endCol];

    // Add start cell to open set
    state.openSet = [state.startCell];
  };

  // Calculate Manhattan distance heuristic
  const heuristic = (a, b) => {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  };

  // Get valid neighbors of a cell
  const getNeighbors = (cell) => {
    const neighbors = [];
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
    state.path = [];
    let current = state.endCell;

    while (current) {
      state.path.unshift(current);
      current = current.parent;
    }
  };

  // Perform one step of A* algorithm
  const step = () => {
    // Check if there are no more cells to evaluate or if end cell is not set
    if (state.openSet.length === 0 || !state.endCell) {
      // No solution or end not set
      state.isDone = true;
      return false;
    }

    // Find the cell with the lowest f score in the open set
    let lowestIndex = 0;
    for (let i = 0; i < state.openSet.length; i++) {
      if (state.openSet[i].f < state.openSet[lowestIndex].f) {
        lowestIndex = i;
      }
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
    state.closedSet.push(current);

    // Check all neighbors
    const neighbors = getNeighbors(current);

    // If no valid neighbors, continue to next cell
    if (neighbors.length === 0) {
      return false;
    }

    for (const neighbor of neighbors) {
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
      if (newPath) {
        neighbor.h = heuristic(neighbor, state.endCell);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = current;
      }
    }

    // Continue algorithm
    return false;
  };

  // Run the entire algorithm
  const findPath = (
    obstacles,
    startRow,
    startCol,
    endRow,
    endCol
  ) => {
    return new Promise((resolve, reject) => {
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

      // Run algorithm with animation frames
      const runStep = () => {
        const isDone = step();

        if (isDone) {
          state.isRunning = false;
          resolve(state.path);
        } else if (state.openSet.length === 0) {
          state.isRunning = false;
          reject(new Error('No path found'));
        } else {
          requestAnimationFrame(runStep);
        }
      };

      runStep();
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
