# Implementation Plan: Arena Gameplay & Fractal Menu Optimization
- **Task ID**: task_016
- **Target Files**: app.js, styles.css, tests/mechanics.test.cjs

## 1. System Design & State Changes
- Remove manual Tailwind vertical overrides from fractal branch menu rendering in `app.js` to restore CSS-based layouts.
- Enhance the battle loop to trigger stop-motion comic strip panel sequences for both regular Attacks and Specials.
- Dynamically determine panel counts, speed, and content based on whether the action is a regular Attack (1-3 panels, snappy 700ms timeout) or a Special move (3-5 panels, dramatic 900ms timeout).
- Map specific move name keywords to element-appropriate onomatopoeias for deeper gameplay immersion.

## 2. Code Changes Spec
### app.js
- **Target Functions**:
  - `triggerSpecialActionClips`: Accept `isSpecial` argument. Retrieve specific words matching the move name in `getComicActionText`. Set `numPanels` and timeouts based on `isSpecial`. Customize panel titles.
  - `simulateBattleAttack`: Unconditionally execute `triggerSpecialActionClips(b, attackName, isSpecial)` for all player moves.
  - `startDemoBattle`: Remove `bottom-0` classes from `attack-branches` and `special-branches` elements.

### styles.css
- **Target Classes**:
  - `.fractal-node`: Set cubic-bezier transition.
  - `.fractal-node--left`, `.fractal-node--center`, `.fractal-node--right`: Adjust translation offsets to push them further up and out (`translateX(-40px)/translateY(-35px)` for left/right, `translateY(-55px)` for center).
  - `.fractal-node--left:hover`, `.fractal-node--center:hover`, `.fractal-node--right:hover`: Explicitly scale translations to prevent jumping to origin on hover.
  - `.fractal-line--left`, `.fractal-line--center`, `.fractal-line--right`: Scale line heights to `55px`/`65px` and adjust rotate angles to `35deg` to connect nodes.
  - `@keyframes sproutLineLeft`, `@keyframes sproutLineRight`: Adjust rotate animations to `35deg`.

## 3. DOM & UI Spec
- Selectors: `#attack-branches`, `#special-branches`, `.fractal-node`, `.fractal-line`.
- Pushing nodes 50px-70px above the parent button and spreading them 40px left and right resolves overlap readability and clickability issues.

## 4. Test Specifications
- Verify that calling `simulateBattleAttack` with `isSpecial = true` still yields 3-5 panels with `IMPACT` segments, satisfying `tests/mechanics.test.cjs` assertions.
- Verify that TS compilation and DOM stubs execute cleanly without ReferenceError exceptions.
