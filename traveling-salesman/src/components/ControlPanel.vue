<script setup lang="ts">
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
  savedConfigurations?: string[];
}>();

// Define emits for control actions
const emit = defineEmits<{
  (e: 'setTool', tool: 'start' | 'end' | 'obstacle' | 'eraser' | 'weight'): void;
  (e: 'setWeight', weight: number): void;
  (e: 'setVisualizationSpeed', speed: 'slow' | 'medium' | 'fast'): void;
  (e: 'resizeGrid', size: number): void;
  (e: 'saveGridConfig', name: string): void;
  (e: 'loadGridConfig', name: string): void;
  (e: 'startAlgorithm'): void;
  (e: 'resetGrid'): void;
  (e: 'clearPath'): void;
}>();

// Currently selected tool
const selectedTool = ref<'start' | 'end' | 'obstacle' | 'eraser' | 'weight'>('obstacle');

// Current weight for weighted nodes
const currentWeight = ref(3);

// Current visualization speed
const visualizationSpeed = ref<'slow' | 'medium' | 'fast'>('medium');

// Current grid size
const gridSize = ref(10);

// Grid configuration name for saving/loading
const configName = ref('');

// List of saved configurations
const savedConfigurations = ref<string[]>([]);

// Set the current tool
const setTool = (tool: 'start' | 'end' | 'obstacle' | 'eraser' | 'weight') => {
  selectedTool.value = tool;
  emit('setTool', tool);
};

// Set the current weight
const setWeight = (weight: number) => {
  currentWeight.value = weight;
  emit('setWeight', weight);
};

// Set the visualization speed
const setVisualizationSpeed = (speed: 'slow' | 'medium' | 'fast') => {
  visualizationSpeed.value = speed;
  emit('setVisualizationSpeed', speed);
};

// Resize the grid
const resizeGrid = () => {
  emit('resizeGrid', gridSize.value);
};

// Save grid configuration
const saveGridConfig = () => {
  if (configName.value.trim()) {
    emit('saveGridConfig', configName.value.trim());
    configName.value = '';
  }
};

// Load grid configuration
const loadGridConfig = (name: string) => {
  emit('loadGridConfig', name);
};

// Watch for changes in savedConfigurations prop
watch(() => props.savedConfigurations, (newConfigs) => {
  if (newConfigs) {
    savedConfigurations.value = newConfigs;
  }
}, { immediate: true });

// Start the algorithm
const startAlgorithm = () => {
  emit('startAlgorithm');
};

// Reset the grid
const resetGrid = () => {
  emit('resetGrid');
};

// Clear the path
const clearPath = () => {
  emit('clearPath');
};
</script>

<template>
  <div class="control-panel">
    <div class="tools">
      <button
        @click="setTool('start')"
        :class="{ active: selectedTool === 'start' }"
        title="Set Start Point"
      >
        <span class="tool-icon start-icon"></span>
        Start Point
      </button>

      <button
        @click="setTool('end')"
        :class="{ active: selectedTool === 'end' }"
        title="Set End Point"
      >
        <span class="tool-icon end-icon"></span>
        End Point
      </button>

      <button
        @click="setTool('obstacle')"
        :class="{ active: selectedTool === 'obstacle' }"
        title="Draw Obstacles"
      >
        <span class="tool-icon obstacle-icon"></span>
        Obstacles
      </button>

      <button
        @click="setTool('weight')"
        :class="{ active: selectedTool === 'weight' }"
        title="Add Weighted Cells"
      >
        <span class="tool-icon weight-icon"></span>
        Weighted
      </button>

      <button
        @click="setTool('eraser')"
        :class="{ active: selectedTool === 'eraser' }"
        title="Erase Cells"
      >
        <span class="tool-icon eraser-icon"></span>
        Eraser
      </button>
    </div>

    <!-- Weight control (only visible when weight tool is selected) -->
    <div v-if="selectedTool === 'weight'" class="weight-control">
      <label for="weight-slider">Weight: {{ currentWeight }}</label>
      <input
        type="range"
        id="weight-slider"
        min="2"
        max="10"
        v-model="currentWeight"
        @input="setWeight(Number(currentWeight))"
      />
    </div>

    <!-- Grid size control -->
    <div class="grid-control">
      <label for="grid-size">Grid Size: {{ gridSize }}x{{ gridSize }}</label>
      <div class="grid-size-controls">
        <input
          type="range"
          id="grid-size"
          min="5"
          max="30"
          v-model.number="gridSize"
        />
        <button @click="resizeGrid" title="Apply Grid Size">Apply</button>
      </div>
    </div>

    <!-- Visualization speed control -->
    <div class="speed-control">
      <span>Speed:</span>
      <div class="speed-buttons">
        <button
          @click="setVisualizationSpeed('slow')"
          :class="{ active: visualizationSpeed === 'slow' }"
          title="Slow Speed"
        >
          Slow
        </button>
        <button
          @click="setVisualizationSpeed('medium')"
          :class="{ active: visualizationSpeed === 'medium' }"
          title="Medium Speed"
        >
          Medium
        </button>
        <button
          @click="setVisualizationSpeed('fast')"
          :class="{ active: visualizationSpeed === 'fast' }"
          title="Fast Speed"
        >
          Fast
        </button>
      </div>
    </div>

    <!-- Save/Load grid configurations -->
    <div class="grid-config">
      <div class="save-config">
        <input
          type="text"
          v-model="configName"
          placeholder="Configuration name"
        />
        <button @click="saveGridConfig" title="Save Configuration">Save</button>
      </div>

      <div class="load-config">
        <label>Load Configuration:</label>
        <select @change="loadGridConfig($event.target.value)">
          <option value="">Select a configuration</option>
          <option v-for="config in savedConfigurations" :key="config" :value="config">
            {{ config }}
          </option>
        </select>
      </div>
    </div>

    <div class="actions">
      <button
        @click="startAlgorithm"
        class="primary-button"
        title="Start A* Algorithm"
      >
        Start A* Algorithm
      </button>

      <button
        @click="clearPath"
        title="Clear Path"
      >
        Clear Path
      </button>

      <button
        @click="resetGrid"
        title="Reset Grid"
      >
        Reset Grid
      </button>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 600px;
  margin: 20px auto;
}

.tools, .actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

button:hover {
  background-color: #e0e0e0;
}

button.active {
  background-color: #e0e0e0;
  border-color: #999;
}

.primary-button {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.primary-button:hover {
  background-color: #3e8e41;
}

.tool-icon {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.start-icon {
  background-color: #4CAF50;
}

.end-icon {
  background-color: #F44336;
}

.obstacle-icon {
  background-color: #212121;
}

.weight-icon {
  background-color: #9C27B0;
}

.eraser-icon {
  background-color: #fff;
  border: 1px solid #ccc;
}

/* Weight control styles */
.weight-control {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* Grid size control styles */
.grid-control {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.grid-size-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.grid-size-controls input {
  flex: 1;
}

/* Speed control styles */
.speed-control {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.speed-buttons {
  display: flex;
  gap: 5px;
}

.speed-buttons button {
  flex: 1;
  padding: 5px;
}

/* Grid configuration styles */
.grid-config {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.save-config {
  display: flex;
  gap: 5px;
}

.save-config input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.load-config {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.load-config select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

@media (max-width: 600px) {
  .tools, .actions {
    justify-content: center;
  }
}
</style>