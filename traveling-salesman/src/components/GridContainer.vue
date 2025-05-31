<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import GridCell from './GridCell.vue';
import Character from './Character.vue';
import Store from './Store.vue';
import { Grid, Node, Algorithm } from '../utils/pathfinding';

// Define grid dimensions (default 10x10)
const gridSize = ref(10);

// Define cell types
type CellType = 'empty' | 'start' | 'end' | 'obstacle' | 'path' | 'visited' | 'open' | 'weighted';

// Define grid state
interface GridState {
  cells: {
    type: CellType;
    isStart: boolean;
    isEnd: boolean;
    isObstacle: boolean;
    isPath: boolean;
    isVisited: boolean;
    isInOpenSet: boolean;
    weight: number;
  }[][];
  startPosition: { row: number; col: number } | null;
  endPosition: { row: number; col: number } | null;
  currentTool: 'start' | 'end' | 'obstacle' | 'eraser' | 'weight';
  currentWeight: number;
  isMouseDown: boolean; // Track global mouse state
}

// Initialize grid state
const initializeGridState = (size: number) => {
  return {
    cells: Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => ({
        type: 'empty',
        isStart: false,
        isEnd: false,
        isObstacle: false,
        isPath: false,
        isVisited: false,
        isInOpenSet: false,
        weight: 1
      }))
    ),
    startPosition: null,
    endPosition: null,
    currentTool: 'obstacle',
    currentWeight: 3, // Default weight for weighted cells
    isMouseDown: false // Track global mouse state
  };
};

// Create reactive grid state
const gridState = reactive<GridState>(initializeGridState(gridSize.value));

// Create pathfinding grid instance
const pathfindingGrid = new Grid(gridSize.value);

// Add global mouse event listeners to handle edge cases
onMounted(() => {
  // When mouse is released anywhere on the window, update our tracking state
  window.addEventListener('mouseup', () => {
    gridState.isMouseDown = false;
  });

  // When mouse leaves the window, update our tracking state
  window.addEventListener('mouseleave', () => {
    gridState.isMouseDown = false;
  });
});

// Character position (will be updated when path is found)
const characterPosition = ref({ row: 0, col: 0 });
const showCharacter = ref(false);

// Store position (will be the end position)
const storePosition = ref({ row: 0, col: 0 });
const showStore = ref(false);

// Visualization speed
const visualizationSpeed = ref('medium'); // 'slow', 'medium', 'fast'

// Computed property for cell size based on grid size
const cellSize = computed(() => 100 / gridSize.value);

// Handle cell click
const handleCellClick = (row: number, col: number) => {
  // Validate row and column indices
  if (row < 0 || row >= gridSize.value || col < 0 || col >= gridSize.value) {
    console.error(`Invalid cell click coordinates: row=${row}, col=${col}`);
    return;
  }
  updateCell(row, col);
};

// Handle cell drag
const handleCellDrag = (row: number, col: number) => {
  // Validate row and column indices
  if (row < 0 || row >= gridSize.value || col < 0 || col >= gridSize.value) {
    console.error(`Invalid cell drag coordinates: row=${row}, col=${col}`);
    return;
  }
  updateCell(row, col);
};

// Update cell based on current tool
const updateCell = (row: number, col: number) => {
  // Validate row and column indices
  if (row < 0 || row >= gridSize.value || col < 0 || col >= gridSize.value) {
    console.error(`Invalid cell coordinates: row=${row}, col=${col}`);
    return;
  }

  const cell = gridState.cells[row][col];

  // Skip update if trying to modify start/end with obstacle/weight/eraser
  if ((cell.isStart && gridState.currentTool !== 'start') ||
      (cell.isEnd && gridState.currentTool !== 'end')) {
    return;
  }

  // Reset the cell first if it's a start or end point
  if (cell.isStart && gridState.startPosition?.row === row && gridState.startPosition?.col === col) {
    gridState.startPosition = null;
  }

  if (cell.isEnd && gridState.endPosition?.row === row && gridState.endPosition?.col === col) {
    gridState.endPosition = null;
  }

  // Reset cell properties based on the current tool
  if (gridState.currentTool === 'start' || gridState.currentTool === 'end') {
    // For start/end tools, reset all properties
    cell.isStart = false;
    cell.isEnd = false;
    cell.isObstacle = false;
    cell.isPath = false;
    cell.isVisited = false;
    cell.isInOpenSet = false;
    cell.type = 'empty';
    cell.weight = 1;
  } else if (gridState.currentTool === 'obstacle' || gridState.currentTool === 'weight' || gridState.currentTool === 'eraser') {
    // For other tools, preserve start/end status
    if (!cell.isStart && !cell.isEnd) {
      cell.isObstacle = false;
      cell.isPath = false;
      cell.isVisited = false;
      cell.isInOpenSet = false;
      cell.type = 'empty';
      // Keep the weight for weighted cells when using obstacle tool
      if (gridState.currentTool !== 'obstacle' || cell.type !== 'weighted') {
        cell.weight = 1;
      }
    } else {
      // If it's a start/end cell, don't modify it
      return;
    }
  }

  // Force a UI update by triggering reactivity
  gridState.cells = [...gridState.cells];

  // Apply new tool
  if (gridState.currentTool === 'start') {
    // Remove previous start position if exists
    if (gridState.startPosition) {
      const { row: prevRow, col: prevCol } = gridState.startPosition;
      if (prevRow >= 0 && prevRow < gridSize.value && prevCol >= 0 && prevCol < gridSize.value) {
        gridState.cells[prevRow][prevCol].isStart = false;
        gridState.cells[prevRow][prevCol].type = 'empty';
      }
    }

    cell.isStart = true;
    cell.type = 'start';
    cell.weight = 1; // Reset weight for start cell
    gridState.startPosition = { row, col };

    // Set character position to start position
    characterPosition.value = { row, col };

    // Update pathfinding grid
    pathfindingGrid.getNode(row, col).setObstacle(false);
    pathfindingGrid.getNode(row, col).setWeight(1);

  } else if (gridState.currentTool === 'end') {
    // Remove previous end position if exists
    if (gridState.endPosition) {
      const { row: prevRow, col: prevCol } = gridState.endPosition;
      if (prevRow >= 0 && prevRow < gridSize.value && prevCol >= 0 && prevCol < gridSize.value) {
        gridState.cells[prevRow][prevCol].isEnd = false;
        gridState.cells[prevRow][prevCol].type = 'empty';
      }
    }

    cell.isEnd = true;
    cell.type = 'end';
    cell.weight = 1; // Reset weight for end cell
    gridState.endPosition = { row, col };

    // Set store position to end position
    storePosition.value = { row, col };
    showStore.value = true;

    // Update pathfinding grid
    pathfindingGrid.getNode(row, col).setObstacle(false);
    pathfindingGrid.getNode(row, col).setWeight(1);

  } else if (gridState.currentTool === 'obstacle') {
    // Only apply if not start/end
    if (!cell.isStart && !cell.isEnd) {
      cell.isObstacle = true;
      cell.type = 'obstacle';
      cell.weight = 1; // Reset weight for obstacle cell

      // Update pathfinding grid
      pathfindingGrid.getNode(row, col).setObstacle(true);
      pathfindingGrid.getNode(row, col).setWeight(1);
    }

  } else if (gridState.currentTool === 'weight') {
    // Only apply if not start/end/obstacle
    if (!cell.isStart && !cell.isEnd && !cell.isObstacle) {
      cell.type = 'weighted';
      cell.weight = gridState.currentWeight;
      cell.isObstacle = false;

      // Update pathfinding grid
      pathfindingGrid.getNode(row, col).setObstacle(false);
      pathfindingGrid.getNode(row, col).setWeight(gridState.currentWeight);
    }

  } else if (gridState.currentTool === 'eraser') {
    // Only apply if not start/end
    if (!cell.isStart && !cell.isEnd) {
      cell.isObstacle = false;
      cell.type = 'empty';
      cell.weight = 1; // Reset weight when erasing

      // Update pathfinding grid
      pathfindingGrid.getNode(row, col).setObstacle(false);
      pathfindingGrid.getNode(row, col).setWeight(1);
    }
  }
};

// Set the current tool
const setTool = (tool: 'start' | 'end' | 'obstacle' | 'eraser' | 'weight') => {
  gridState.currentTool = tool;
};

// Set the current weight for weighted cells
const setWeight = (weight: number) => {
  gridState.currentWeight = weight;
};

// Set visualization speed
const setVisualizationSpeed = (speed: 'slow' | 'medium' | 'fast') => {
  visualizationSpeed.value = speed;
};

// Resize the grid
const resizeGrid = (newSize: number) => {
  if (newSize < 5) newSize = 5; // Minimum size
  if (newSize > 30) newSize = 30; // Maximum size

  // Update grid size
  gridSize.value = newSize;

  // Create a new grid state with the new size
  const newGridState = initializeGridState(newSize);

  // Update the cells array directly to maintain reactivity
  gridState.cells = newGridState.cells;
  gridState.startPosition = null;
  gridState.endPosition = null;

  // Reinitialize pathfinding grid
  pathfindingGrid.resize(newSize);

  // Reset character and store
  showCharacter.value = false;
  showStore.value = false;
};

// Reset the grid
const resetGrid = () => {
  // Reset all cells completely
  for (let row = 0; row < gridSize.value; row++) {
    for (let col = 0; col < gridSize.value; col++) {
      const cell = gridState.cells[row][col];

      // Reset all properties
      cell.isStart = false;
      cell.isEnd = false;
      cell.isObstacle = false;
      cell.isPath = false;
      cell.isVisited = false;
      cell.isInOpenSet = false;
      cell.weight = 1;
      cell.type = 'empty';

      // Reset pathfinding grid
      pathfindingGrid.getNode(row, col).setObstacle(false);
      pathfindingGrid.getNode(row, col).setWeight(1);
    }
  }

  // Reset start and end positions
  gridState.startPosition = null;
  gridState.endPosition = null;

  // Hide character and store
  showCharacter.value = false;
  showStore.value = false;
};

// Save grid configuration to local storage
const saveGridConfig = (name: string) => {
  // Get current grid configuration
  const config = pathfindingGrid.exportConfig();

  // Add start and end positions
  config.startPosition = gridState.startPosition;
  config.endPosition = gridState.endPosition;

  // Get existing saved configurations
  const savedConfigs = JSON.parse(localStorage.getItem('gridConfigurations') || '{}');

  // Add new configuration
  savedConfigs[name] = config;

  // Save to local storage
  localStorage.setItem('gridConfigurations', JSON.stringify(savedConfigs));

  return Object.keys(savedConfigs);
};

// Load grid configuration from local storage
const loadGridConfig = (name: string) => {
  // Get saved configurations
  const savedConfigs = JSON.parse(localStorage.getItem('gridConfigurations') || '{}');

  // Check if configuration exists
  if (!savedConfigs[name]) {
    return false;
  }

  const config = savedConfigs[name];

  // Resize grid if needed
  if (config.size !== gridSize.value) {
    resizeGrid(config.size);
  } else {
    // Reset grid first
    resetGrid();
  }

  // Import configuration to pathfinding grid
  pathfindingGrid.importConfig(config);

  // Update UI grid state
  for (const nodeConfig of config.nodes) {
    const { row, col, isObstacle, weight } = nodeConfig;

    if (row < gridSize.value && col < gridSize.value) {
      const cell = gridState.cells[row][col];

      if (isObstacle) {
        cell.isObstacle = true;
        cell.type = 'obstacle';
      } else if (weight > 1) {
        cell.weight = weight;
        cell.type = 'weighted';
      }
    }
  }

  // Set start position if available
  if (config.startPosition) {
    const { row, col } = config.startPosition;
    if (row < gridSize.value && col < gridSize.value) {
      gridState.cells[row][col].isStart = true;
      gridState.cells[row][col].type = 'start';
      gridState.startPosition = { row, col };
    }
  }

  // Set end position if available
  if (config.endPosition) {
    const { row, col } = config.endPosition;
    if (row < gridSize.value && col < gridSize.value) {
      gridState.cells[row][col].isEnd = true;
      gridState.cells[row][col].type = 'end';
      gridState.endPosition = { row, col };

      // Set store position
      storePosition.value = { row, col };
      showStore.value = true;
    }
  }

  return true;
};

// Get list of saved grid configurations
const getSavedConfigurations = () => {
  const savedConfigs = JSON.parse(localStorage.getItem('gridConfigurations') || '{}');
  return Object.keys(savedConfigs);
};

// Expose methods and properties to parent component
defineExpose({
  resetGrid,
  setTool,
  setWeight,
  setVisualizationSpeed,
  resizeGrid,
  saveGridConfig,
  loadGridConfig,
  getSavedConfigurations,
  gridState,
  gridSize,
  characterPosition,
  showCharacter,
  storePosition,
  showStore,
  visualizationSpeed,
  pathfindingGrid
});
</script>

<template>
  <div class="grid-container">
    <div class="grid">
      <div v-for="(row, rowIndex) in gridState.cells" :key="rowIndex" class="grid-row">
        <GridCell
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :row="rowIndex"
          :col="colIndex"
          :isStart="cell.isStart"
          :isEnd="cell.isEnd"
          :isObstacle="cell.isObstacle"
          :isPath="cell.isPath"
          :isVisited="cell.isVisited"
          :isInOpenSet="cell.isInOpenSet"
          :isWeighted="cell.type === 'weighted'"
          :weight="cell.weight"
          @cellClick="handleCellClick"
          @cellDrag="handleCellDrag"
        />
      </div>
    </div>

    <Character
      v-if="showCharacter"
      :row="characterPosition.row"
      :col="characterPosition.col"
      :gridSize="gridSize"
    />

    <Store
      v-if="showStore"
      :row="storePosition.row"
      :col="storePosition.col"
      :gridSize="gridSize"
    />
  </div>
</template>

<style scoped>
.grid-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  aspect-ratio: 1 / 1;
}

.grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 2px solid #333;
  box-sizing: border-box;
}

.grid-row {
  display: flex;
  flex: 1;
}

.grid-row > * {
  flex: 1;
}
</style>