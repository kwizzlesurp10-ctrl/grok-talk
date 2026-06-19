# Implementation Plan: Training Room Layout & Navigation
- **Task ID**: task_019
- **Target Files**: source.html, app.js, styles.css

## 1. System Design & State Changes
- Introduce a "Training Room" tab in the main navigation.
- Desktop Nav: Add a list item with ID `nav-training` under existing navigation.
- Mobile Nav: Add a mobile button item with ID `nav-mobile-training`.
- Section Panels: Add a section element `<section id="section-training" class="hidden">` in `source.html`.

## 2. Code Changes Spec
### source.html
- Add navigation list item:
  ```html
  <li><a href="#" id="nav-training" class="nav-link ..."><i class="fas fa-microchip mr-2"></i>Training Room</a></li>
  ```
- Add mobile navigation button:
  ```html
  <button id="nav-mobile-training" class="nav-link-mobile ..."><i class="fas fa-microchip"></i><span class="text-xs">Training</span></button>
  ```
- Build out the training room panel layout:
  - Header: "Holographic Neural Training Matrix"
  - Left panel: Panda selection list/grid (selected panda shows full card details with active stats).
  - Right panel: Prompt concept editor:
    - Input: Move Name
    - Textarea: Move Prompt Concept (e.g., "Summon a frozen glacier that breaks into crystal spikes")
    - Type Selection: Attack or Special move
    - Info: Cost to Synthesize (150 EP), Neural Slots available (e.g. "Slots: 0/1 Used")
    - Button: "Initiate Neural Synthesis" (`#btn-synthesize-move`)
  - Bottom panel: "Holographic Preview Screen" (`#training-preview-screen`) containing a canvas and a loading block.

### app.js
- Add navigation handler for `training`: `navigateTo('training')`.
- Hook up navigation click events for `#nav-training` and `#nav-mobile-training`.

## 3. DOM & UI Spec
- Selectors: `#section-training`, `#nav-training`, `#nav-mobile-training`, `#training-panda-select`, `#btn-synthesize-move`.

## 4. Test Specifications
- Verify that `source.html` and the compiled `index.html` contain the new navigation elements and the hidden section.
