<script setup lang="ts">
import { ref, watch } from 'vue';
import SalesmanIcon from './tool-icons/SalesmanIcon.vue';
import ShopIcon from './tool-icons/ShopIcon.vue';
import TrafficConeIcon from './tool-icons/TrafficConeIcon.vue';
import TollBoothIcon from './tool-icons/TollBoothIcon.vue';
import BroomIcon from './tool-icons/BroomIcon.vue';
// ... existing code ...
// ... existing code ...
<template>
  <div class="control-panel">
    <div class="tools">
      <button
        @click="setTool('start')"
        :class="{ active: selectedTool === 'start' }"
        title="Set Salesman"
      >
        <SalesmanIcon class="tool-icon" />
        Set Salesman
      </button>

      <button
        @click="setTool('end')"
        :class="{ active: selectedTool === 'end' }"
        title="Set Shop"
      >
        <ShopIcon class="tool-icon" />
        Set Shop
      </button>

      <button
        @click="setTool('obstacle')"
        :class="{ active: selectedTool === 'obstacle' }"
        title="Add Roadblock"
      >
        <TrafficConeIcon class="tool-icon" />
        Add Roadblock
      </button>

      <button
        @click="setTool('weight')"
        :class="{ active: selectedTool === 'weight' }"
        title="Add Toll"
      >
        <TollBoothIcon class="tool-icon" />
        Add Toll
      </button>

      <button
        @click="setTool('eraser')"
        :class="{ active: selectedTool === 'eraser' }"
        title="Broom"
      >
        <BroomIcon class="tool-icon" />
        Broom
      </button>
    </div>
// ... existing code ...
    <div class="actions">
      <button
        @click="startAlgorithm"
        class="primary-button"
        title="Start Sales Journey"
      >
        Start Sales Journey
      </button>

      <button
        @click="clearPath"
        title="Clear Route"
      >
        Clear Route
      </button>

      <button
        @click="resetGrid"
        title="Reset Map"
      >
        Reset Map
      </button>
    </div>
  </div>
</template>
// ... existing code ...
</script> 