<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

// Define props for store position
const props = defineProps<{
  row: number;
  col: number;
  gridSize?: number;
}>();

// Store element reference
const storeRef = ref<HTMLElement | null>(null);

// Position store initially
onMounted(() => {
  if (storeRef.value) {
    const cellSize = 100 / (props.gridSize || 10); // 100% divided by grid size
    storeRef.value.style.left = `${props.col * cellSize}%`;
    storeRef.value.style.top = `${props.row * cellSize}%`;
  }
});

// Watch for grid size changes
watch(() => props.gridSize, () => {
  if (storeRef.value) {
    const cellSize = 100 / (props.gridSize || 10);
    storeRef.value.style.left = `${props.col * cellSize}%`;
    storeRef.value.style.top = `${props.row * cellSize}%`;
  }
});
</script>

<template>
  <div ref="storeRef" class="store">
    <!-- Store building representation -->
    <div class="store-building">
      <!-- Roof -->
      <div class="roof"></div>
      <!-- Main building -->
      <div class="building">
        <!-- Door -->
        <div class="door"></div>
        <!-- Windows -->
        <div class="window window-left"></div>
        <div class="window window-right"></div>
      </div>
      <!-- Sign -->
      <div class="sign">STORE</div>
    </div>
  </div>
</template>

<style scoped>
.store {
  position: absolute;
  width: v-bind('`${100 / (props.gridSize || 10)}%`'); /* Dynamic width based on grid size */
  height: v-bind('`${100 / (props.gridSize || 10)}%`'); /* Dynamic height based on grid size */
  z-index: 5;
  box-sizing: border-box;
}

.store-building {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Roof */
.roof {
  width: 90%;
  height: 30%;
  background-color: #e74c3c;
  clip-path: polygon(0% 100%, 50% 0%, 100% 100%);
  z-index: 2;
}

/* Main building */
.building {
  width: 80%;
  height: 60%;
  background-color: #f1c40f;
  position: relative;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Door */
.door {
  position: absolute;
  width: 30%;
  height: 50%;
  background-color: #8b4513;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 2px 2px 0 0;
}

/* Windows */
.window {
  position: absolute;
  width: 20%;
  height: 25%;
  background-color: #3498db;
  top: 20%;
  border-radius: 2px;
}

.window-left {
  left: 15%;
}

.window-right {
  right: 15%;
}

/* Sign */
.sign {
  position: absolute;
  top: 10%;
  font-size: 6px;
  font-weight: bold;
  color: #333;
  background-color: #ecf0f1;
  padding: 1px 2px;
  border-radius: 2px;
  z-index: 3;
  transform: translateY(-50%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
