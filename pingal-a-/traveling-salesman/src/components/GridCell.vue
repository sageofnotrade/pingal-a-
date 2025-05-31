<script setup lang="ts">
import { ref, computed } from 'vue';
import SalesmanIcon from './tool-icons/SalesmanIcon.vue';
import ShopIcon from './tool-icons/ShopIcon.vue';
import TrafficConeIcon from './tool-icons/TrafficConeIcon.vue';
import TollBoothIcon from './tool-icons/TollBoothIcon.vue';
// ... existing code ...
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
    <!-- Themed icons for cell types -->
    <SalesmanIcon v-if="isStart" class="cell-icon" />
    <ShopIcon v-else-if="isEnd" class="cell-icon" />
    <TrafficConeIcon v-else-if="isObstacle" class="cell-icon" />
    <TollBoothIcon v-else-if="isWeighted" class="cell-icon" />
    <!-- Add dedicated indicator elements for different cell types -->
    <div v-if="isPath" class="path-indicator"></div>
    <div v-if="isVisited" class="visited-indicator"></div>
    <div v-if="isInOpenSet" class="open-indicator"></div>
    <!-- Subtle city block/road pattern for empty cells -->
    <svg v-if="!isStart && !isEnd && !isObstacle && !isWeighted && !isPath && !isVisited && !isInOpenSet" class="city-pattern" width="100%" height="100%" viewBox="0 0 20 20">
      <rect x="0" y="9" width="20" height="2" fill="#e0e0e0"/>
      <rect x="9" y="0" width="2" height="20" fill="#e0e0e0"/>
    </svg>
  </div>
</template>
// ... existing code ...
.cell-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  height: 70%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
.city-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

</script> 