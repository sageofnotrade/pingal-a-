<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import GridContainer from '../components/GridContainer.vue';
import ControlPanel from '../components/ControlPanel.vue';
import { Algorithm } from '../utils/pathfinding';
import gsap from 'gsap';

// Grid container reference
const gridContainerRef = ref<InstanceType<typeof GridContainer> | null>(null);

// Algorithm instance
let algorithm: Algorithm | null = null;

// Saved configurations
const savedConfigurations = ref<string[]>([]);

// Initialize algorithm when grid container is mounted
onMounted(() => {
  // Use nextTick to ensure the grid container is fully mounted
  setTimeout(() => {
    if (gridContainerRef.value) {
      algorithm = new Algorithm(gridContainerRef.value.pathfindingGrid);

      // Load saved configurations
      const configs = gridContainerRef.value.getSavedConfigurations();
      savedConfigurations.value = configs;
    }
  }, 100);

  // Add a listener for character movement to ensure path cells remain marked
  window.addEventListener('character-moved', (event: CustomEvent) => {
    if (!gridContainerRef.value || !algorithm || !algorithm.path) return;

    const { gridState } = gridContainerRef.value;

    // Check if any path cells need to be re-marked
    let needsUpdate = false;
    for (const cell of algorithm.path) {
      if (cell && typeof cell.row === 'number' && typeof cell.col === 'number') {
        // Skip start and end cells
        const isStartOrEnd =
          (gridState.startPosition && cell.row === gridState.startPosition.row && cell.col === gridState.startPosition.col) ||
          (gridState.endPosition && cell.row === gridState.endPosition.row && cell.col === gridState.endPosition.col);

        if (!isStartOrEnd && !gridState.cells[cell.row][cell.col].isPath) {
          needsUpdate = true;
          break;
        }
      }
    }

    // If any path cells are not marked, re-mark all of them
    if (needsUpdate) {
      console.log('Re-marking path cells after character movement');

      // Create a copy of the grid state
      const updatedCells = JSON.parse(JSON.stringify(gridState.cells));

      // Mark all path cells
      for (const cell of algorithm.path) {
        if (cell && typeof cell.row === 'number' && typeof cell.col === 'number') {
          // Skip start and end cells
          const isStartOrEnd =
            (gridState.startPosition && cell.row === gridState.startPosition.row && cell.col === gridState.startPosition.col) ||
            (gridState.endPosition && cell.row === gridState.endPosition.row && cell.col === gridState.endPosition.col);

          if (!isStartOrEnd) {
            updatedCells[cell.row][cell.col].isPath = true;
            updatedCells[cell.row][cell.col].isVisited = false;
            updatedCells[cell.row][cell.col].isInOpenSet = false;
            updatedCells[cell.row][cell.col].type = 'path';
          }
        }
      }

      // Update the grid state
      gridState.cells = updatedCells;
    }
  });
});

// Handle tool selection
const handleSetTool = (tool: 'start' | 'end' | 'obstacle' | 'eraser' | 'weight') => {
  gridContainerRef.value?.setTool(tool);
};

// Handle weight setting
const handleSetWeight = (weight: number) => {
  gridContainerRef.value?.setWeight(weight);
};

// Handle visualization speed setting
const handleSetVisualizationSpeed = (speed: 'slow' | 'medium' | 'fast') => {
  gridContainerRef.value?.setVisualizationSpeed(speed);
  if (algorithm) {
    algorithm.setSpeed(speed);
  }
};

// Handle grid resizing
const handleResizeGrid = (size: number) => {
  console.log('Resizing grid to:', size);

  if (gridContainerRef.value) {
    // Ensure size is a number
    const numSize = Number(size);
    if (isNaN(numSize)) {
      console.error('Invalid grid size:', size);
      return;
    }

    // Resize the grid
    gridContainerRef.value.resizeGrid(numSize);

    // Recreate algorithm instance with new grid
    setTimeout(() => {
      if (gridContainerRef.value) {
        algorithm = new Algorithm(gridContainerRef.value.pathfindingGrid);
        console.log('Algorithm recreated with grid size:', gridContainerRef.value.gridSize.value);
      }
    }, 100);
  }
};

// Handle saving grid configuration
const handleSaveGridConfig = (name: string) => {
  if (gridContainerRef.value) {
    const configs = gridContainerRef.value.saveGridConfig(name);
    savedConfigurations.value = configs;
  }
};

// Handle loading grid configuration
const handleLoadGridConfig = (name: string) => {
  if (gridContainerRef.value && name) {
    gridContainerRef.value.loadGridConfig(name);

    // Recreate algorithm instance with updated grid
    algorithm = new Algorithm(gridContainerRef.value.pathfindingGrid);
  }
};

// Start the A* algorithm
const startAlgorithm = async () => {
  if (!gridContainerRef.value || !algorithm) return;

  const { gridState, gridSize } = gridContainerRef.value;

  // Check if start and end points are set
  if (!gridState.startPosition || !gridState.endPosition) {
    alert('Please set both start and end points before running the algorithm.');
    return;
  }

  try {
    // Set start and end nodes for the algorithm
    algorithm.setStartAndEnd(
      gridState.startPosition.row,
      gridState.startPosition.col,
      gridState.endPosition.row,
      gridState.endPosition.col
    );

    // Run pathfinding algorithm
    const path = await algorithm.findPath();

    // If path is empty or undefined, handle it
    if (!path || path.length === 0) {
      alert('No valid path could be found. Please check your obstacles.');
      return;
    }

    // Update grid with path and visited cells
    // First, make sure we have valid sets

    // Reset all cells to ensure clean state
    console.log('Resetting all cells...');
    for (let row = 0; row < gridSize.value; row++) {
      for (let col = 0; col < gridSize.value; col++) {
        // Skip start, end, and obstacle cells
        if (gridState.cells[row][col].isStart ||
            gridState.cells[row][col].isEnd ||
            gridState.cells[row][col].isObstacle ||
            gridState.cells[row][col].type === 'weighted') {
          continue;
        }

        gridState.cells[row][col].isPath = false;
        gridState.cells[row][col].isVisited = false;
        gridState.cells[row][col].isInOpenSet = false;
        gridState.cells[row][col].type = 'empty';
      }
    }

    // Force a UI update
    gridState.cells = [...gridState.cells];

    // Create a new grid state to ensure reactivity
    const newCells = JSON.parse(JSON.stringify(gridState.cells));

    // Mark visited cells (closed set)
    console.log('Marking visited cells...');
    if (algorithm.closedSet && algorithm.closedSet.length > 0) {
      for (const cell of algorithm.closedSet) {
        // Make sure the cell has valid row and column properties
        if (cell && typeof cell.row === 'number' && typeof cell.col === 'number' &&
            cell.row >= 0 && cell.row < gridSize.value && cell.col >= 0 && cell.col < gridSize.value) {
          // Skip cells that are part of the final path
          const isPartOfPath = path && path.some(pathCell =>
            pathCell.row === cell.row && pathCell.col === cell.col
          );

          // Skip start and end cells
          const isStartOrEnd =
            (gridState.startPosition && cell.row === gridState.startPosition.row && cell.col === gridState.startPosition.col) ||
            (gridState.endPosition && cell.row === gridState.endPosition.row && cell.col === gridState.endPosition.col);

          if (!isPartOfPath && !isStartOrEnd && !newCells[cell.row][cell.col].isObstacle) {
            console.log(`Marking visited cell at [${cell.row}, ${cell.col}]`);
            newCells[cell.row][cell.col].isVisited = true;
            newCells[cell.row][cell.col].isInOpenSet = false; // Ensure it's not marked as open
            newCells[cell.row][cell.col].isPath = false; // Ensure it's not marked as path
            newCells[cell.row][cell.col].type = 'visited';
          }
        }
      }
    }

    // Force a UI update to ensure visited cells are rendered
    gridState.cells = [...newCells];

    // Mark open set cells
    console.log('Marking open set cells...');
    if (algorithm.openSet && algorithm.openSet.length > 0) {
      // Create a new copy to ensure reactivity
      const openSetCells = JSON.parse(JSON.stringify(gridState.cells));

      for (const cell of algorithm.openSet) {
        // Make sure the cell has valid row and column properties
        if (cell && typeof cell.row === 'number' && typeof cell.col === 'number' &&
            cell.row >= 0 && cell.row < gridSize.value && cell.col >= 0 && cell.col < gridSize.value) {
          // Skip cells that are part of the final path
          const isPartOfPath = path && path.some(pathCell =>
            pathCell.row === cell.row && pathCell.col === cell.col
          );

          // Skip start and end cells
          const isStartOrEnd =
            (gridState.startPosition && cell.row === gridState.startPosition.row && cell.col === gridState.startPosition.col) ||
            (gridState.endPosition && cell.row === gridState.endPosition.row && cell.col === gridState.endPosition.col);

          if (!isPartOfPath && !isStartOrEnd && !openSetCells[cell.row][cell.col].isObstacle) {
            console.log(`Marking open set cell at [${cell.row}, ${cell.col}]`);
            openSetCells[cell.row][cell.col].isInOpenSet = true;
            openSetCells[cell.row][cell.col].isPath = false; // Ensure it's not marked as path
            openSetCells[cell.row][cell.col].type = 'open';

            // Visited cells can also be in the open set, but we prioritize open set visualization
            if (openSetCells[cell.row][cell.col].isVisited) {
              openSetCells[cell.row][cell.col].isVisited = false;
            }
          }
        }
      }

      // Update the grid state with open set cells
      gridState.cells = openSetCells;

      // Force a UI update
      gridState.cells = [...gridState.cells];
    }

    // Mark path cells (highest priority)
    console.log('Marking path cells...');
    if (path && path.length > 0) {
      // Create a separate deep copy for path cells to ensure they're properly marked
      const pathCells = JSON.parse(JSON.stringify(gridState.cells));

      // First, clear any existing path cells
      for (let row = 0; row < gridSize.value; row++) {
        for (let col = 0; col < gridSize.value; col++) {
          // Skip start, end, obstacle, and weighted cells
          if (pathCells[row][col].isStart ||
              pathCells[row][col].isEnd ||
              pathCells[row][col].isObstacle ||
              pathCells[row][col].type === 'weighted') {
            continue;
          }

          // Clear any existing path marking
          pathCells[row][col].isPath = false;
        }
      }

      // Now mark all path cells
      for (const cell of path) {
        // Make sure the cell has valid row and column properties
        if (cell && typeof cell.row === 'number' && typeof cell.col === 'number' &&
            cell.row >= 0 && cell.row < gridSize.value && cell.col >= 0 && cell.col < gridSize.value) {

          // Skip start and end cells
          const isStartOrEnd =
            (gridState.startPosition && cell.row === gridState.startPosition.row && cell.col === gridState.startPosition.col) ||
            (gridState.endPosition && cell.row === gridState.endPosition.row && cell.col === gridState.endPosition.col);

          if (!isStartOrEnd) {
            // Path cells take priority over visited and open set cells
            console.log(`Marking path cell at [${cell.row}, ${cell.col}]`);
            pathCells[cell.row][cell.col].isPath = true;
            pathCells[cell.row][cell.col].isVisited = false;
            pathCells[cell.row][cell.col].isInOpenSet = false;
            pathCells[cell.row][cell.col].type = 'path';
          }
        }
      }

      // Replace the entire cells array to ensure reactivity
      gridState.cells = pathCells;

      // Force a UI update by triggering reactivity
      gridState.cells = [...gridState.cells];

      // Log the number of path cells after setting
      let pathCount = 0;
      for (let row = 0; row < gridSize.value; row++) {
        for (let col = 0; col < gridSize.value; col++) {
          if (gridState.cells[row][col].isPath) {
            pathCount++;
            console.log(`Confirmed path cell at [${row}, ${col}]`);
          }
        }
      }
      console.log(`Total path cells after setting: ${pathCount}`);

      // Add a small delay to ensure the UI updates before animation starts
      setTimeout(() => {
        console.log('Checking path cells after delay...');
        let delayedPathCount = 0;
        for (let row = 0; row < gridSize.value; row++) {
          for (let col = 0; col < gridSize.value; col++) {
            if (gridState.cells[row][col].isPath) {
              delayedPathCount++;
            }
          }
        }
        console.log(`Path cells after delay: ${delayedPathCount}`);
      }, 100);
    }

    // Force a UI update by triggering reactivity
    gridState.cells = [...gridState.cells];

    // Debug: Log the state of the cells
    console.log('Path cells:', path.length);
    console.log('Visited cells:', algorithm.closedSet.length);
    console.log('Open set cells:', algorithm.openSet.length);

    // Count cells by type
    let pathCount = 0;
    let visitedCount = 0;
    let openCount = 0;

    for (let row = 0; row < gridSize.value; row++) {
      for (let col = 0; col < gridSize.value; col++) {
        if (gridState.cells[row][col].isPath) pathCount++;
        if (gridState.cells[row][col].isVisited) visitedCount++;
        if (gridState.cells[row][col].isInOpenSet) openCount++;
      }
    }

    console.log('Grid state - Path cells:', pathCount);
    console.log('Grid state - Visited cells:', visitedCount);
    console.log('Grid state - Open set cells:', openCount);

    // Show character at start position and animate along path
    const characterPosition = {
      row: gridState.startPosition.row,
      col: gridState.startPosition.col
    };

    // Access the internal properties of the GridContainer component
    // Note: This is a workaround as we can't directly modify the reactive refs
    // We're using any type to bypass TypeScript's type checking
    const gridContainerComponent = gridContainerRef.value as any;

    // Set initial character position and show it
    if (gridContainerComponent) {
      // Check if characterPosition is a ref or a plain object
      if (gridContainerComponent.characterPosition && typeof gridContainerComponent.characterPosition === 'object' && 'value' in gridContainerComponent.characterPosition) {
        // It's a ref, use .value
        gridContainerComponent.characterPosition.value = characterPosition;
      } else {
        // It's a plain object, assign directly
        gridContainerComponent.characterPosition = characterPosition;
      }

      // Check if showCharacter is a ref or a boolean
      if (gridContainerComponent.showCharacter && typeof gridContainerComponent.showCharacter === 'object' && 'value' in gridContainerComponent.showCharacter) {
        // It's a ref, use .value
        gridContainerComponent.showCharacter.value = true;
      } else {
        // It's a boolean, assign directly
        gridContainerComponent.showCharacter = true;
      }

      // Make sure we have a valid path with at least one cell
      if (path && path.length > 0) {
        // Animate character along the path
        const timeline = gsap.timeline({ delay: 0.5 });

        // Get animation duration based on visualization speed
        const speedDuration = {
          slow: 0.5,
          medium: 0.3,
          fast: 0.1
        };

        // Get visualization speed safely
        let visualizationSpeed = 'medium';
        if (gridContainerComponent.visualizationSpeed) {
          visualizationSpeed = typeof gridContainerComponent.visualizationSpeed === 'object' && 'value' in gridContainerComponent.visualizationSpeed
            ? gridContainerComponent.visualizationSpeed.value
            : gridContainerComponent.visualizationSpeed;
        }

        const duration = speedDuration[visualizationSpeed] || 0.3;

        // Ensure all path cells are properly marked before animation starts
        console.log('Final check of path cells before animation...');

        // Create a final copy of the grid state to ensure all path cells are marked
        const finalPathCells = JSON.parse(JSON.stringify(gridState.cells));

        // Mark all path cells one last time
        path.forEach((pathCell) => {
          if (pathCell && typeof pathCell.row === 'number' && typeof pathCell.col === 'number' &&
              pathCell.row >= 0 && pathCell.row < gridSize.value &&
              pathCell.col >= 0 && pathCell.col < gridSize.value) {

            // Skip start and end cells
            const isStartOrEnd =
              (gridState.startPosition && pathCell.row === gridState.startPosition.row && pathCell.col === gridState.startPosition.col) ||
              (gridState.endPosition && pathCell.row === gridState.endPosition.row && pathCell.col === gridState.endPosition.col);

            if (!isStartOrEnd) {
              console.log(`Final marking of path cell at [${pathCell.row}, ${pathCell.col}]`);
              finalPathCells[pathCell.row][pathCell.col].isPath = true;
              finalPathCells[pathCell.row][pathCell.col].isVisited = false;
              finalPathCells[pathCell.row][pathCell.col].isInOpenSet = false;
              finalPathCells[pathCell.row][pathCell.col].type = 'path';
            }
          }
        });

        // Update the grid state with all path cells marked
        gridState.cells = finalPathCells;

        // Force a UI update by triggering reactivity
        gridState.cells = [...gridState.cells];

      // Create a single animation for the character to follow the path
      // This approach avoids manipulating the grid state during animation

      // Extract all path points for the animation
      const pathPoints = path.map((cell, index) => {
        if (index === 0) return null; // Skip the first cell (starting position)

        if (cell && typeof cell.row === 'number' && typeof cell.col === 'number') {
          return {
            row: cell.row,
            col: cell.col
          };
        }
        return null;
      }).filter(point => point !== null);

      // Create a single animation for the character
      if (pathPoints.length > 0) {
        // Set up the animation with a delay
        setTimeout(() => {
          console.log('Starting character animation along path...');

          // Before starting animation, ensure all path cells are properly marked one more time
          const finalPathCheck = JSON.parse(JSON.stringify(gridState.cells));

          // Re-mark all path cells
          for (const cell of path) {
            if (cell && typeof cell.row === 'number' && typeof cell.col === 'number' &&
                cell.row >= 0 && cell.row < gridSize.value &&
                cell.col >= 0 && cell.col < gridSize.value) {

              // Skip start and end cells
              const isStartOrEnd =
                (gridState.startPosition && cell.row === gridState.startPosition.row && cell.col === gridState.startPosition.col) ||
                (gridState.endPosition && cell.row === gridState.endPosition.row && cell.col === gridState.endPosition.col);

              if (!isStartOrEnd) {
                finalPathCheck[cell.row][cell.col].isPath = true;
                finalPathCheck[cell.row][cell.col].isVisited = false;
                finalPathCheck[cell.row][cell.col].isInOpenSet = false;
                finalPathCheck[cell.row][cell.col].type = 'path';
              }
            }
          }

          // Update grid state
          gridState.cells = finalPathCheck;

          // Create a sequence of positions for the character to follow
          let currentIndex = 0;

          const moveCharacter = () => {
            if (currentIndex >= pathPoints.length) {
              console.log('Character animation complete');

              // After animation completes, do one final check of path cells
              setTimeout(() => {
                const finalCheck = JSON.parse(JSON.stringify(gridState.cells));

                // Re-mark all path cells one last time
                for (const cell of path) {
                  if (cell && typeof cell.row === 'number' && typeof cell.col === 'number' &&
                      cell.row >= 0 && cell.row < gridSize.value &&
                      cell.col >= 0 && cell.col < gridSize.value) {

                    // Skip start and end cells
                    const isStartOrEnd =
                      (gridState.startPosition && cell.row === gridState.startPosition.row && cell.col === gridState.startPosition.col) ||
                      (gridState.endPosition && cell.row === gridState.endPosition.row && cell.col === gridState.endPosition.col);

                    if (!isStartOrEnd) {
                      finalCheck[cell.row][cell.col].isPath = true;
                      finalCheck[cell.row][cell.col].isVisited = false;
                      finalCheck[cell.row][cell.col].isInOpenSet = false;
                      finalCheck[cell.row][cell.col].type = 'path';
                    }
                  }
                }

                // Update grid state one final time
                gridState.cells = finalCheck;
              }, 500);

              return;
            }

            const point = pathPoints[currentIndex];

            // Update character position
            if (gridContainerComponent.characterPosition &&
                typeof gridContainerComponent.characterPosition === 'object' &&
                'value' in gridContainerComponent.characterPosition) {
              // It's a ref
              gridContainerComponent.characterPosition.value = {
                row: point.row,
                col: point.col
              };
            } else {
              // It's a direct object
              gridContainerComponent.characterPosition = {
                row: point.row,
                col: point.col
              };
            }

            // After each step, ensure path cells remain marked
            const stepCheck = JSON.parse(JSON.stringify(gridState.cells));

            // Re-mark all path cells
            for (const cell of path) {
              if (cell && typeof cell.row === 'number' && typeof cell.col === 'number' &&
                  cell.row >= 0 && cell.row < gridSize.value &&
                  cell.col >= 0 && cell.col < gridSize.value) {

                // Skip start and end cells
                const isStartOrEnd =
                  (gridState.startPosition && cell.row === gridState.startPosition.row && cell.col === gridState.startPosition.col) ||
                  (gridState.endPosition && cell.row === gridState.endPosition.row && cell.col === gridState.endPosition.col);

                if (!isStartOrEnd) {
                  stepCheck[cell.row][cell.col].isPath = true;
                  stepCheck[cell.row][cell.col].isVisited = false;
                  stepCheck[cell.row][cell.col].isInOpenSet = false;
                  stepCheck[cell.row][cell.col].type = 'path';
                }
              }
            }

            // Update grid state
            gridState.cells = stepCheck;

            // Move to next point after delay
            currentIndex++;
            setTimeout(moveCharacter, duration * 1000);
          };

          // Start the animation
          moveCharacter();
        }, 500); // Initial delay before animation starts
      }

      // After a delay, ensure path cells are still marked
      setTimeout(() => {
        console.log('Final check - Ensuring path cells are still marked...');

        // Create a final copy of the grid state
        const finalPathCells = JSON.parse(JSON.stringify(gridState.cells));

        // Re-mark all path cells to ensure they're still visible
        path.forEach((pathCell) => {
          if (pathCell && typeof pathCell.row === 'number' && typeof pathCell.col === 'number' &&
              pathCell.row >= 0 && pathCell.row < gridSize.value &&
              pathCell.col >= 0 && pathCell.col < gridSize.value) {

            // Skip start and end cells
            const isStartOrEnd =
              (gridState.startPosition && pathCell.row === gridState.startPosition.row && pathCell.col === gridState.startPosition.col) ||
              (gridState.endPosition && pathCell.row === gridState.endPosition.row && pathCell.col === gridState.endPosition.col);

            if (!isStartOrEnd) {
              finalPathCells[pathCell.row][pathCell.col].isPath = true;
              finalPathCells[pathCell.row][pathCell.col].isVisited = false;
              finalPathCells[pathCell.row][pathCell.col].isInOpenSet = false;
              finalPathCells[pathCell.row][pathCell.col].type = 'path';
            }
          }
        });

        // Update the grid state one final time
        gridState.cells = finalPathCells;

        // Force a UI update by triggering reactivity
        gridState.cells = [...gridState.cells];
      }, 2000); // Check after 2 seconds
      } else {
        console.warn('No valid path to animate');
      }
    }

  } catch (error: any) {
    // Log the error for debugging
    console.error('Pathfinding error details:', error);

    // Show appropriate error message
    if (error.message && error.message.includes('No path found')) {
      alert('No path found! The destination is unreachable. Try removing some obstacles.');
    } else {
      // Generic error message
      alert('An error occurred while finding the path. Please try again.');
    }
  }
};

// Reset the grid
const resetGrid = () => {
  gridContainerRef.value?.resetGrid();
};

// Clear the path
const clearPath = () => {
  if (!gridContainerRef.value) return;

  const gridContainerComponent = gridContainerRef.value as any;
  const { gridState, gridSize } = gridContainerRef.value;

  // Clear path and visited cells
  for (let row = 0; row < gridSize.value; row++) {
    for (let col = 0; col < gridSize.value; col++) {
      // Skip start and end cells
      if (gridState.cells[row][col].isStart || gridState.cells[row][col].isEnd) {
        continue;
      }

      // Skip obstacle and weighted cells
      if (gridState.cells[row][col].isObstacle ||
          gridState.cells[row][col].type === 'weighted') {
        continue;
      }

      // Clear path indicators
      gridState.cells[row][col].isPath = false;
      gridState.cells[row][col].isVisited = false;
      gridState.cells[row][col].isInOpenSet = false;

      if (gridState.cells[row][col].type === 'path' ||
          gridState.cells[row][col].type === 'visited' ||
          gridState.cells[row][col].type === 'open') {
        gridState.cells[row][col].type = 'empty';
      }
    }
  }

  // Force a UI update by triggering reactivity
  gridState.cells = [...gridState.cells];

  // Hide the character when clearing the path
  if (gridContainerComponent && gridContainerComponent.showCharacter) {
    // Check if showCharacter is a ref or a boolean
    if (typeof gridContainerComponent.showCharacter === 'object' && 'value' in gridContainerComponent.showCharacter) {
      // It's a ref, use .value
      gridContainerComponent.showCharacter.value = false;
    } else {
      // It's a boolean, assign directly
      gridContainerComponent.showCharacter = false;
    }
  }
};
</script>

<template>
  <main>
    <div class="container">
      <h1>The Traveling Salesman</h1>
      <p class="subtitle">A* Pathfinding Algorithm Visualization</p>

      <ControlPanel
        @setTool="handleSetTool"
        @setWeight="handleSetWeight"
        @setVisualizationSpeed="handleSetVisualizationSpeed"
        @resizeGrid="handleResizeGrid"
        @saveGridConfig="handleSaveGridConfig"
        @loadGridConfig="handleLoadGridConfig"
        @startAlgorithm="startAlgorithm"
        @resetGrid="resetGrid"
        @clearPath="clearPath"
        :savedConfigurations="savedConfigurations"
      />

      <GridContainer ref="gridContainerRef" />

      <div class="instructions">
        <h2>Instructions</h2>
        <ol>
          <li>Select the <strong>Start Point</strong> tool and click on a cell to set the starting position (where the 3D human will appear).</li>
          <li>Select the <strong>End Point</strong> tool and click on a cell to set the destination (where the store will appear).</li>
          <li>Use the <strong>Obstacles</strong> tool to draw walls by clicking and dragging.</li>
          <li>Use the <strong>Weighted</strong> tool to add cells that are more difficult to traverse (costs more to move through).</li>
          <li>Adjust the <strong>Grid Size</strong> slider to resize the grid and click Apply.</li>
          <li>Set the <strong>Speed</strong> to control how fast the algorithm and character animation run.</li>
          <li>Save your grid configuration with a name to reuse it later.</li>
          <li>Click <strong>Start A* Algorithm</strong> to find the shortest path and watch the human character move toward the store.</li>
          <li>Use <strong>Clear Path</strong> to remove the path but keep obstacles and weights.</li>
          <li>Use <strong>Reset Grid</strong> to clear everything.</li>
        </ol>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 5px;
  color: #333;
}

.subtitle {
  text-align: center;
  margin-bottom: 20px;
  color: #666;
}

.instructions {
  margin-top: 30px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.instructions h2 {
  margin-top: 0;
  font-size: 1.2rem;
}

.instructions ol {
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
}
</style>
