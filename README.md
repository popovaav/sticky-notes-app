# Sticky Notes App

## Tech Stack
React + TypeScript + Vite

## Architecture
The app is built as a single React component that manages notes in a centralized state. Each note stores its position and size, and updates are handled through mouse events for dragging and resizing. Notes are constrained within the board boundaries to ensure a consistent user experience.

To ensure smooth performance, updates are throttled using requestAnimationFrame, reducing unnecessary re-renders during continuous interactions. A global mouseup listener is used to properly stop interactions even when the cursor leaves the board.

## Setup

```bash
npm install
npm run dev
```