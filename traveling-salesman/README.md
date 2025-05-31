# 🧭 The Traveling Salesman

An interactive visualization of the A* pathfinding algorithm using Vue 3 and GSAP animations.

## 🌟 Features

- Interactive 10x10 grid for pathfinding visualization
- A* algorithm implementation with Manhattan distance heuristic
- Character-based animation of the discovered path
- Interactive tools for placing start/end points and obstacles
- Step-by-step visualization of the algorithm's progress
- Responsive design that works on various devices

## 🚀 Tech Stack

- **Vue 3**: Frontend framework with Composition API
- **TypeScript**: For type safety and better developer experience
- **GSAP**: For smooth animations
- **Vite**: Fast development and build tool

## 🛠️ Project Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint the code
npm run lint
```

## 🎮 How to Use

1. Select the **Start Point** tool and click on a cell to set the starting position
2. Select the **End Point** tool and click on a cell to set the destination
3. Use the **Obstacles** tool to draw walls by clicking and dragging
4. Click **Start A* Algorithm** to find the shortest path
5. Use **Clear Path** to remove the path but keep obstacles
6. Use **Reset Grid** to clear everything

## 📝 Algorithm Details

The application implements the A* pathfinding algorithm with the following components:

- **Manhattan Distance Heuristic**: Calculates the sum of horizontal and vertical distances
- **Priority Queue**: Efficiently selects the next node to explore
- **Path Reconstruction**: Traces the optimal path from end to start
- **Visualization States**: Shows open set, visited nodes, and final path

## 🎨 Visualization Color Scheme

- **Open set nodes**: Light blue (#64B5F6)
- **Visited nodes**: Dark gray (#424242)
- **Final path**: Gold (#FFD700)
- **Obstacles**: Black (#212121)
- **Start point**: Green (#4CAF50)
- **End point**: Red (#F44336)

## 📱 Browser Compatibility

The application is designed to work on modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## 🔮 Future Enhancements

- Adjustable algorithm speed
- Multiple heuristic options
- Diagonal movement
- Weighted cells (terrain costs)
- Algorithm comparison mode
- Zoom/pan to follow character
- Exportable animation
