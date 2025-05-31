<script setup lang="ts">
import { ref, computed } from 'vue';

// Define props for the grid cell
const props = defineProps<{
  row: number;
  col: number;
  isStart: boolean;
  isEnd: boolean;
  isObstacle: boolean;
  isPath: boolean;
  isVisited: boolean;
  isInOpenSet: boolean;
  isWeighted?: boolean;
  weight?: number;
}>();

// Define emits for user interactions
const emit = defineEmits<{
  (e: 'cellClick', row: number, col: number): void;
  (e: 'cellDrag', row: number, col: number): void;
}>();

// Track if mouse is down for drag operations
const isMouseDown = ref(false);

// Get cell style based on its state
const getCellStyle = computed(() => {
  const baseStyle = {
    width: '100%',
    height: '100%',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    position: 'relative'
  };

  // Priority order: start/end > path > open/visited > obstacle > weighted > empty
  if (props.isStart) {
    return {
      ...baseStyle,
      backgroundColor: '#4CAF50', // Green
      border: '2px solid #2E7D32' // Darker green border
    };
  }

  if (props.isEnd) {
    return {
      ...baseStyle,
      backgroundColor: '#F44336', // Red
      border: '2px solid #C62828' // Darker red border
    };
  }

  if (props.isPath) {
    return {
      ...baseStyle,
      backgroundColor: '#FFD700', // Gold
      border: '3px solid #FFA000', // Thicker darker gold border
      boxShadow: '0 0 5px rgba(255, 215, 0, 0.7)' // Add glow effect
    };
  }

  if (props.isVisited) {
    return {
      ...baseStyle,
      backgroundColor: '#424242', // Dark gray
      border: '1px solid #616161' // Lighter gray border
    };
  }

  if (props.isInOpenSet) {
    return {
      ...baseStyle,
      backgroundColor: '#64B5F6', // Light blue
      border: '1px solid #1E88E5' // Darker blue border
    };
  }

  if (props.isObstacle) {
    return {
      ...baseStyle,
      backgroundColor: '#212121', // Black
      border: '1px solid #000000' // Black border
    };
  }

  if (props.isWeighted) {
    return {
      ...baseStyle,
      backgroundColor: '#9C27B0', // Purple
      border: '1px solid #6A1B9A' // Darker purple border
    };
  }

  // Default empty cell
  return baseStyle;
});

// Handle mouse events
const handleMouseDown = (event) => {
  // Prevent default to avoid text selection during drag
  event.preventDefault();
  isMouseDown.value = true;
  emit('cellClick', props.row, props.col);
};

const handleMouseUp = () => {
  isMouseDown.value = false;
};

const handleMouseEnter = (event) => {
  // Only emit drag event if mouse is down and it's a valid drag operation
  if (isMouseDown.value) {
    // Prevent any default browser behavior
    event.preventDefault();
    emit('cellDrag', props.row, props.col);
  }
};
</script>

<template>
  <div
    class="grid-cell"
    :class="{
      'cell-path': isPath,
      'cell-start': isStart,
      'cell-end': isEnd,
      'cell-obstacle': isObstacle,
      'cell-visited': isVisited,
      'cell-open': isInOpenSet,
      'cell-weighted': isWeighted
    }"
    :style="getCellStyle"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseenter="handleMouseEnter"
    @mouseleave="isMouseDown = false"
    :data-row="row"
    :data-col="col"
    :data-type="isPath ? 'path' : isStart ? 'start' : isEnd ? 'end' : isObstacle ? 'obstacle' : isVisited ? 'visited' : isInOpenSet ? 'open' : isWeighted ? 'weighted' : 'empty'"
  >
    <span v-if="isWeighted && weight" class="weight-label">{{ weight }}</span>
    <!-- Add dedicated indicator elements for different cell types -->
    <div v-if="isPath" class="path-indicator"></div>
    <div v-if="isVisited" class="visited-indicator"></div>
    <div v-if="isInOpenSet" class="open-indicator"></div>
  </div>
</template>

<style scoped>
.grid-cell {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  box-sizing: border-box;
  transition: all 0.2s ease;
  position: relative;
}

.weight-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
}

.grid-cell:hover {
  transform: scale(1.05);
  z-index: 10;
}

/* Specific styles for path cells */
.cell-path {
  background-color: #FFD700 !important; /* Gold */
  border: 3px solid #FFA000 !important; /* Darker gold border */
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.7) !important; /* Add glow effect */
  z-index: 5; /* Ensure path cells are above regular cells but below hovered cells */
}

/* Specific styles for visited cells */
.cell-visited {
  background-color: #424242 !important; /* Dark gray */
  border: 1px solid #616161 !important; /* Lighter gray border */
  z-index: 3;
}

/* Specific styles for open set cells */
.cell-open {
  background-color: #64B5F6 !important; /* Light blue */
  border: 1px solid #1E88E5 !important; /* Darker blue border */
  z-index: 3;
}

/* Path indicator element - this will always be visible when isPath is true */
.path-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #FFD700; /* Gold */
  border: 3px solid #FFA000; /* Darker gold border */
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.9); /* Stronger glow effect */
  z-index: 4; /* Below the cell content but above the base cell */
  pointer-events: none; /* Allow clicks to pass through */
  box-sizing: border-box;
}

/* Visited indicator element */
.visited-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #424242; /* Dark gray */
  border: 1px solid #616161; /* Lighter gray border */
  z-index: 2; /* Below path cells */
  pointer-events: none; /* Allow clicks to pass through */
  box-sizing: border-box;
}

/* Open set indicator element */
.open-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #64B5F6; /* Light blue */
  border: 1px solid #1E88E5; /* Darker blue border */
  z-index: 2; /* Below path cells */
  pointer-events: none; /* Allow clicks to pass through */
  box-sizing: border-box;
}
</style>