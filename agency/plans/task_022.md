# Implementation Plan: Next Level Upgrades & Training Room Improvements
- **Task ID**: task_022
- **Target Files**: source.html, app.js, src/core/GameState.ts

## 1. System Design & Future Enhancements

### A. Quantum Synthesis Upgrade
- **New Upgrade Card**: Add "Quantum Synthesis" card to the Upgrades shop.
- **Upgrades Level**: Max level 5.
- **Cost**: `350 + level * 200` EP.
- **Effect**: Deducts custom move synthesis cost by 10 EP per level (reducing cost from 150 EP down to 100 EP at max level).

### B. Move Presets / Loadouts
- ** Roster Loadouts**: Allow players to assign custom moves to different preset slots (e.g., Loadout A vs. Loadout B).
- **Preset Selector**: Add a loadout toggle (Alpha / Beta presets) in the Battle Arena select screen.

### C. Advanced Prompt Vectorizing
- **Extended Keywords**: Parse prompts for complex styles like "rainbow", "vortex", "hologram", "glitch", "pulse".
- **Dynamic Color Gradients**: Draw multi-color gradients on canvas matching keywords (e.g., "fire and ice" blends red and cyan).

### D. Mini Rhythm Calibration
- **Calibration Minigame**: Add a "Calibrate Matrix" minigame to the Training Room.
- **Flow**: Players click pulsing neon nodes as they align with a target ring. Succesful calibration grants bonus XP to the trained panda and reduces synthesis cooldowns.

---

## 2. Execution Steps for Agency
1. **TypeScript Update**: Modify `src/core/GameState.ts` to include `quantumSynthesisLevel` in upgrades schema.
2. **HTML Layout**:
   - Add the "Quantum Synthesis" card to the upgrades grid in `source.html`.
   - Add loadout radio toggle buttons in the Arena champion card.
3. **Synthesis Logic**: Update `initiateNeuralSynthesis` in `app.js` to calculate EP cost dynamically: `cost = 150 - (gameState.upgrades.quantumSynthesis || 0) * 10`.
4. **Canvas Updates**: Implement multi-color interpolation and glow shaders in `drawCustomMovePreviewFrame` to handle mixed keywords.
5. **Testing**: Write Test 22 in `tests/mechanics.test.cjs` validating the synthesis cost reductions and loadouts data-integrity.
