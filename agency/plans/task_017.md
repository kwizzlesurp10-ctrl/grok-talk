# Implementation Plan: PWA Offline Asset Caching
- **Task ID**: task_017
- **Target Files**: sw.js

## 1. System Design & State Changes
- Upgrade the cache version in `sw.js` from `fusionpanda-v4.3.0` to `fusionpanda-v4.3.1` to trigger service worker activation and cache refresh.
- Expand the static asset caching array (`ASSETS`) to include all roster images, fusion hybrid art, and battle backgrounds/opponents.

## 2. Code Changes Spec
### sw.js
- Update `CACHE_NAME` to `'fusionpanda-v4.3.1'`.
- Add the following assets to `ASSETS`:
  - `assets/arena/arena-bg.jpg`
  - `assets/arena/fusion-panda.jpg`
  - `assets/arena/fusion-panda-victory-keyframe.jpg`
  - `assets/arena/opponent-void-howler.jpg`
  - `assets/arena/opponent-chroma-lynx.jpg`
  - `assets/arena/opponent-prompt-colossus.jpg`
  - `assets/arena/opponent-entropy-hare.jpg`
  - `assets/arena/opponent-fractal-fox.jpg`
  - `assets/arena/opponent-nexus-bear.jpg`
  - `assets/pandas/classic_panda.jpg`
  - `assets/pandas/crystal_panda.jpg`
  - `assets/pandas/frostbite_panda.jpg`
  - `assets/pandas/golden_fortune.jpg`
  - `assets/pandas/inferno_panda.jpg`
  - `assets/pandas/mystic_panda.jpg`
  - `assets/pandas/red_panda.jpg`
  - `assets/pandas/shadow_panda.jpg`
  - `assets/pandas/thunder_panda.jpg`
  - `assets/pandas/fusion_bamboo.jpg`
  - `assets/pandas/fusion_bamboo_evolved.jpg`
  - `assets/pandas/fusion_celestial.jpg`
  - `assets/pandas/fusion_celestial_evolved.jpg`
  - `assets/pandas/fusion_chaos.jpg`
  - `assets/pandas/fusion_chaos_evolved.jpg`
  - `assets/pandas/fusion_eclipse.jpg`
  - `assets/pandas/fusion_eclipse_evolved.jpg`
  - `assets/pandas/fusion_frost.jpg`
  - `assets/pandas/fusion_frost_evolved.jpg`
  - `assets/pandas/fusion_inferno.jpg`
  - `assets/pandas/fusion_inferno_evolved.jpg`
  - `assets/pandas/fusion_nebula.jpg`
  - `assets/pandas/fusion_nebula_evolved.jpg`
  - `assets/pandas/fusion_plasma.jpg`
  - ... and remaining fusion evolved images.

## 3. DOM & UI Spec
- No UI changes required. Service Worker handles requests in the background.

## 4. Test Specifications
- Verify that `sw.js` syntax is correct.
- Verify that building the project with `npm run build` succeeds and tests pass.
