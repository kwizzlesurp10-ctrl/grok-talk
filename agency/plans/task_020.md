# Implementation Plan: AI Synthesis Loader & Procedural Move Synthesis
- **Task ID**: task_020
- **Target Files**: app.js, styles.css, tests/mechanics.test.cjs

## 1. System Design & State Changes
- When the player clicks "Initiate Neural Synthesis", pay 150 EP and trigger a multi-stage cyber-neon loader sequence:
  - Phase 1: "Analyzing prompt semantics..."
  - Phase 2: "Aligning element vectors..."
  - Phase 3: "Synthesizing dynamic visual frames..."
  - Phase 4: "Compiling neural blueprint..."
- After synthesis finishes (approx 2-3 seconds):
  - Generate a procedural visual representation seed containing element type, visual attributes (e.g. particle size, speed, color palette, effect shape), and save the move.
  - Save the move to the selected panda:
    ```javascript
    panda.customMoves.push({
      name: moveName,
      prompt: movePrompt,
      isSpecial: isSpecial,
      element: panda.type,
      seed: visualSeed,
      visuals: visualData
    });
    ```

## 2. Code Changes Spec
### app.js
- Handle custom move storage in `gameState` collections.
- Implement `#btn-synthesize-move` click handler:
  - Perform checks: cost (150 EP), neural slots available.
  - Show a sci-fi progress bar with step-by-step loading messages.
  - Draw a dynamic loop animation on `#training-preview-canvas` representing the generated visual (based on prompt keyword elements: fire = flame particles, ice = floating shards, light = laser beams).
  - Add the custom move to the selected panda.
  - Play back the custom animation loop on the canvas dynamically.

### styles.css
- Style the synthesis loader container, holographic canvas frame, and console logs window.

## 3. DOM & UI Spec
- Selectors: `#training-preview-canvas`, `#synthesis-loader`, `#synthesis-logs`, `#synthesis-progress-bar`.

## 4. Test Specifications
- Add tests to verify that custom moves are successfully added to a panda, that EP is deducted, and that the custom move contains name, prompt, and seed properties.
