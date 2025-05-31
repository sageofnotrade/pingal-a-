<script setup>
import { ref, watch, onMounted } from 'vue';
import gsap from 'gsap';

// Define props for character position
const props = defineProps({
  row: {
    type: Number,
    required: true
  },
  col: {
    type: Number,
    required: true
  },
  gridSize: {
    type: Number,
    default: 10
  }
});

// Character element reference
const characterRef = ref(null);

// Character direction (0: right, 1: down, 2: left, 3: up)
const direction = ref(0);

// Update character position when props change
watch(
  () => [props.row, props.col],
  ([newRow, newCol], [oldRow, oldCol]) => {
    if (oldRow !== undefined && oldCol !== undefined) {
      // Determine direction based on movement
      if (newRow > oldRow) {
        direction.value = 1; // down
      } else if (newRow < oldRow) {
        direction.value = 3; // up
      } else if (newCol > oldCol) {
        direction.value = 0; // right
      } else if (newCol < oldCol) {
        direction.value = 2; // left
      }

      // Animate character movement
      animateMovement();
    }
  }
);

// Animate character movement
const animateMovement = () => {
  if (!characterRef.value) return;

  // Calculate position based on grid cell size
  const cellSize = 100 / props.gridSize; // 100% divided by grid size
  const xPos = `${props.col * cellSize}%`;
  const yPos = `${props.row * cellSize}%`;

  // Animate with GSAP
  gsap.to(characterRef.value, {
    left: xPos,
    top: yPos,
    duration: 0.2,
    ease: 'power1.inOut',
    onComplete: () => {
      // Add a little bounce effect
      gsap.to(characterRef.value, {
        scale: 1.1,
        duration: 0.1,
        yoyo: true,
        repeat: 1
      });

      // Emit an event to notify that the character has moved
      // This could be used to trigger path cell updates if needed
      const event = new CustomEvent('character-moved', {
        detail: { row: props.row, col: props.col }
      });
      window.dispatchEvent(event);
    }
  });
};

// Position character initially
onMounted(() => {
  if (characterRef.value) {
    const cellSize = 100 / props.gridSize; // 100% divided by grid size
    characterRef.value.style.left = `${props.col * cellSize}%`;
    characterRef.value.style.top = `${props.row * cellSize}%`;
  }
});

// Watch for grid size changes
watch(() => props.gridSize, () => {
  if (characterRef.value) {
    const cellSize = 100 / props.gridSize;
    characterRef.value.style.left = `${props.col * cellSize}%`;
    characterRef.value.style.top = `${props.row * cellSize}%`;
  }
});
</script>

<template>
  <div ref="characterRef" class="character" :class="`direction-${direction}`">
    <!-- 3D human character representation -->
    <div class="salesman-model">
      <!-- Hat -->
      <div class="hat">
        <div class="hat-top"></div>
        <div class="hat-brim"></div>
      </div>
      <!-- Head with mustache and glasses -->
      <div class="head">
        <div class="glasses left"></div>
        <div class="glasses right"></div>
        <div class="mustache"></div>
      </div>
      <!-- Body (suit) -->
      <div class="body">
        <div class="tie"></div>
      </div>
      <!-- Arms -->
      <div class="arm left-arm"></div>
      <div class="arm right-arm"></div>
      <!-- Legs -->
      <div class="leg left-leg"></div>
      <div class="leg right-leg"></div>
      <!-- Briefcase -->
      <div class="briefcase"></div>
    </div>
  </div>
</template>

<style scoped>
.character {
  position: absolute;
  width: v-bind('`${100 / props.gridSize}%`'); /* Dynamic width based on grid size */
  height: v-bind('`${100 / props.gridSize}%`'); /* Dynamic height based on grid size */
  transform-origin: center;
  transition: transform 0.2s ease;
  z-index: 10;
  box-sizing: border-box;
}

.salesman-model {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  perspective: 800px;
}

/* Hat */
.hat {
  position: absolute;
  width: 38%;
  height: 18%;
  top: 0%;
  left: 31%;
  z-index: 3;
}
.hat-top {
  width: 70%;
  height: 60%;
  background: #222e50;
  border-radius: 50% 50% 40% 40%/60% 60% 100% 100%;
  position: absolute;
  left: 15%;
  top: 0;
}
.hat-brim {
  width: 100%;
  height: 35%;
  background: #1a2233;
  border-radius: 50%;
  position: absolute;
  top: 60%;
  left: 0;
}

/* Head with mustache and glasses */
.head {
  position: absolute;
  width: 32%;
  height: 27%;
  background-color: #f5d0c4;
  border-radius: 50%;
  top: 10%;
  left: 34%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}
.glasses {
  position: absolute;
  width: 28%;
  height: 28%;
  border: 2px solid #333;
  border-radius: 50%;
  top: 35%;
  background: #fff8;
}
.glasses.left {
  left: 5%;
}
.glasses.right {
  right: 5%;
}
.mustache {
  position: absolute;
  width: 60%;
  height: 18%;
  background: #a0522d;
  border-radius: 0 0 60% 60%/0 0 100% 100%;
  bottom: 10%;
  left: 20%;
}

/* Body (suit) */
.body {
  position: absolute;
  width: 40%;
  height: 36%;
  background-color: #2c3e50;
  top: 34%;
  left: 30%;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
}
.tie {
  position: absolute;
  width: 12%;
  height: 40%;
  background: #e74c3c;
  left: 44%;
  top: 20%;
  border-radius: 20% 20% 40% 40%/20% 20% 100% 100%;
}

/* Arms */
.arm {
  position: absolute;
  width: 15%;
  height: 38%;
  background-color: #2c3e50;
  top: 38%;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.left-arm {
  left: 10%;
}
.right-arm {
  right: 10%;
}

/* Legs */
.leg {
  position: absolute;
  width: 15%;
  height: 28%;
  background-color: #34495e;
  top: 70%;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.left-leg {
  left: 30%;
}
.right-leg {
  right: 30%;
}

/* Briefcase */
.briefcase {
  position: absolute;
  width: 18%;
  height: 18%;
  background: #8d5524;
  border-radius: 3px;
  bottom: 8%;
  left: 0%;
  border: 2px solid #5c3310;
  z-index: 2;
}

/* Direction styles */
.direction-0 {
  transform: rotate(0deg);
}

.direction-1 {
  transform: rotate(90deg);
}

.direction-2 {
  transform: rotate(180deg);
}

.direction-3 {
  transform: rotate(270deg);
}
</style>