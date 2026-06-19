# Implementation Plan: Battle Arena Custom Moves & Upgrades Integration
- **Task ID**: task_021
- **Target Files**: app.js, styles.css, tests/mechanics.test.cjs

## 1. System Design & State Changes
- Integrate custom moves into the Battle Arena.
- When selecting a champion in the Arena, display their custom moves in the Attack / Special menus.
- When a custom move is selected, execute the dynamic canvas animation directly over the opponent card during battle!
- Add a new card in the Upgrades shop: "Neural Training Slots".
  - Each level costs EP (Level 1 -> 2: 500 EP, Level 2 -> 3: 800 EP).
  - Unlocks additional custom move slots (up to 5 max).

## 2. Code Changes Spec
### app.js
- In `getChampionMoves()`, append custom moves from `panda.customMoves` to the moves list.
- In `triggerSpecialActionClips()`, check if the move is a custom move.
  - If so, overlay a floating canvas over the battle scene.
  - Run the procedural animation loop representing the custom move.
  - Render comic speech panels with custom text derived from the prompt description.
- In the Upgrades shop, render the "Neural Training Slots" upgrade card.
  - Unlocks extra slots for custom moves: `gameState.maxCustomMoveSlots` (starts at 1, increments by 1 per level up to 5).

### styles.css
- Add styles for the overlay battle canvas and the upgrades neural slots details.

## 3. DOM & UI Spec
- Selectors: `#upgrade-slots-level`, `#upgrade-slots-btn`, `.battle-custom-canvas-overlay`.

## 4. Test Specifications
- Add a test that verifies custom moves show up in combat lists and can be executed during battle attacks.
