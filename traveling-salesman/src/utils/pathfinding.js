/**
 * Node class representing a cell in the grid
 */
export class Node {
  constructor(row, col, weight = 1) {
    this.row = row;
    this.col = col;
    this.f = 0; // Total cost (g + h)
    this.g = 0; // Cost from start to current node
    this.h = 0; // Heuristic (estimated cost from current to end)
    this.weight = weight; // Movement cost multiplier (1 = normal, >1 = more expensive)
    this.isObstacle = false;
    this.parent = null;
  }

  // Reset node's pathfinding properties
  reset() {
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.parent = null;
  }

  // Set node as an obstacle
  setObstacle(isObstacle) {
    this.isObstacle = isObstacle;
  }

  // Set node weight
  setWeight(weight) {
    this.weight = weight;
  }
}

/**
 * Grid class managing the grid structure
 */
export class Grid {
  constructor(size = 10) {
    this.size = size;
    this.nodes = [];
    this.initialize();
  }

  // Initialize the grid with nodes
  initialize() {
    this.nodes = [];
    for (let row = 0; row < this.size; row++) {
      const gridRow = [];
      for (let col = 0; col < this.size; col++) {
        gridRow.push(new Node(row, col));
      }
      this.nodes.push(gridRow);
    }
  }

  // Resize the grid
  resize(newSize) {
    // Store the old size
    const oldSize = this.size;

    // Update size
    this.size = newSize;

    // Create a new nodes array with the new size
    const newNodes = [];
    for (let row = 0; row < newSize; row++) {
      const gridRow = [];
      for (let col = 0; col < newSize; col++) {
        // If the cell existed in the old grid, copy its properties
        if (row < oldSize && col < oldSize && this.nodes[row] && this.nodes[row][col]) {
          const oldNode = this.nodes[row][col];
          const newNode = new Node(row, col, oldNode.weight);
          newNode.isObstacle = oldNode.isObstacle;
          gridRow.push(newNode);
        } else {
          // Otherwise create a new node
          gridRow.push(new Node(row, col));
        }
      }
      newNodes.push(gridRow);
    }

    // Replace the old nodes array
    this.nodes = newNodes;
  }

  // Get node at specific coordinates
  getNode(row, col) {
    if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
      return this.nodes[row][col];
    }
    return null;
  }

  // Set obstacle at specific coordinates
  setObstacle(row, col, isObstacle) {
    const node = this.getNode(row, col);
    if (node) {
      node.setObstacle(isObstacle);
    }
  }

  // Set weight at specific coordinates
  setWeight(row, col, weight) {
    const node = this.getNode(row, col);
    if (node) {
      node.setWeight(weight);
    }
  }

  // Get valid neighbors of a node
  getNeighbors(node) {
    const neighbors = [];
    const { row, col } = node;

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
      const neighbor = this.getNode(newRow, newCol);

      if (neighbor && !neighbor.isObstacle) {
        neighbors.push(neighbor);
      }
    }

    return neighbors;
  }

  // Export grid configuration for saving
  exportConfig() {
    const config = {
      size: this.size,
      nodes: []
    };

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const node = this.getNode(row, col);
        if (node.isObstacle || node.weight !== 1) {
          config.nodes.push({
            row,
            col,
            isObstacle: node.isObstacle,
            weight: node.weight
          });
        }
      }
    }

    return config;
  }

  // Import grid configuration
  importConfig(config) {
    if (!config || !config.size || !config.nodes) {
      return false;
    }

    this.resize(config.size);

    for (const nodeConfig of config.nodes) {
      const { row, col, isObstacle, weight } = nodeConfig;
      const node = this.getNode(row, col);
      if (node) {
        node.setObstacle(isObstacle);
        node.setWeight(weight);
      }
    }

    return true;
  }
}

/**
 * Algorithm class implementing A* pathfinding
 */
export class Algorithm {
  constructor(grid) {
    this.grid = grid;
    this.openSet = [];
    this.closedSet = [];
    this.path = [];
    this.startNode = null;
    this.endNode = null;
    this.isDone = false;
    this.speed = 'medium'; // 'slow', 'medium', 'fast'
    this.speedValues = {
      slow: 300,
      medium: 100,
      fast: 10
    };
  }

  // Set start and end nodes
  setStartAndEnd(startRow, startCol, endRow, endCol) {
    this.startNode = this.grid.getNode(startRow, startCol);
    this.endNode = this.grid.getNode(endRow, endCol);
    this.reset();
  }

  // Reset algorithm state
  reset() {
    this.openSet = [this.startNode];
    this.closedSet = [];
    this.path = [];
    this.isDone = false;

    // Reset all nodes
    for (let row = 0; row < this.grid.size; row++) {
      for (let col = 0; col < this.grid.size; col++) {
        this.grid.getNode(row, col).reset();
      }
    }
  }

  // Set visualization speed
  setSpeed(speed) {
    if (this.speedValues[speed] !== undefined) {
      this.speed = speed;
    }
  }

  // Calculate Manhattan distance heuristic
  heuristic(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }

  // Reconstruct path from end to start
  reconstructPath() {
    this.path = [];
    let current = this.endNode;

    while (current) {
      this.path.unshift(current);
      current = current.parent;
    }
  }

  // Perform one step of A* algorithm
  step() {
    // Check if there are no more nodes to evaluate
    if (this.openSet.length === 0) {
      this.isDone = true;
      return false;
    }

    // Find the node with the lowest f score in the open set
    let lowestIndex = 0;
    for (let i = 0; i < this.openSet.length; i++) {
      if (this.openSet[i].f < this.openSet[lowestIndex].f) {
        lowestIndex = i;
      }
    }

    const current = this.openSet[lowestIndex];

    // Check if we reached the end
    if (current === this.endNode) {
      this.reconstructPath();
      this.isDone = true;
      return true;
    }

    // Remove current from open set and add to closed set
    this.openSet.splice(lowestIndex, 1);
    this.closedSet.push(current);

    // Check all neighbors
    const neighbors = this.grid.getNeighbors(current);

    for (const neighbor of neighbors) {
      // Skip if already evaluated
      if (this.closedSet.includes(neighbor)) {
        continue;
      }

      // Calculate g score (distance from start)
      // Use the weight of the neighbor for weighted pathfinding
      const tentativeG = current.g + neighbor.weight;

      // Check if this path is better
      let newPath = false;
      if (this.openSet.includes(neighbor)) {
        if (tentativeG < neighbor.g) {
          neighbor.g = tentativeG;
          newPath = true;
        }
      } else {
        neighbor.g = tentativeG;
        newPath = true;
        this.openSet.push(neighbor);
      }

      // Update scores if we found a better path
      if (newPath) {
        neighbor.h = this.heuristic(neighbor, this.endNode);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = current;
      }
    }

    // Continue algorithm
    return false;
  }

  // Run the entire algorithm with animation
  async findPath() {
    return new Promise((resolve, reject) => {
      if (!this.startNode || !this.endNode) {
        reject(new Error('Start or end node not set'));
        return;
      }

      this.reset();

      const runStep = () => {
        const isDone = this.step();

        if (isDone) {
          resolve(this.path);
        } else if (this.openSet.length === 0) {
          reject(new Error('No path found'));
        } else {
          setTimeout(runStep, this.speedValues[this.speed]);
        }
      };

      runStep();
    });
  }
}
