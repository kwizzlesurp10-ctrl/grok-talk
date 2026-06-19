# Implementation Plan: Account & Multi-Profile Schema & Storage
- **Task ID**: task_018
- **Target Files**: app.js, src/core/GameState.ts, tests/mechanics.test.cjs

## 1. System Design & State Changes
- Create a multi-account state layer in `app.js` using a key `fusionPandaProfiles` in `localStorage`.
- `fusionPandaProfiles` will store an object of profiles, e.g. `{ activeProfile: string, profiles: { [name: string]: gameState } }`.
- Integrate profile creation, renaming, switching, and deletion logic.
- Update the dashboard HTML template dynamically to show a profile selection dropdown next to the level badge.
- Extend `src/core/GameState.ts`'s `PlayerStats` to include profiles metadata if needed, but primarily manage profile state synchronization in `app.js`.

## 2. Code Changes Spec
### app.js
- Maintain a list of profiles: `let profilesState = { active: 'Default', list: ['Default'] }`.
- On boot, read `fusionPandaProfiles` from `localStorage`. If not present, initialize it.
- Replace `saveGameState` and `loadGameState` to load/save from/to the active profile in the profiles list.
- Implement UI handler functions:
  - `renderProfilePanel()`: Render profile picker controls on dashboard (a dropdown, a "New Profile" button, and a "Delete Profile" button).
  - `createNewProfile(name)`: Create profile with initial `gameState` defaults.
  - `switchProfile(name)`: Switch the active profile, load its state, render dashboard, collection, codex, etc.
  - `deleteProfile(name)`: Delete selected profile and fallback to 'Default' profile.

### src/core/GameState.ts
- Document the profile data schema and ensure `GameStateManager` is flexible enough to load varying partial states.

## 3. DOM & UI Spec
- Selectors: `#profile-picker-container`, `#profile-select`, `#btn-new-profile`, `#btn-delete-profile`.
- Insert this profile selector layout at the top of the Dashboard.

## 4. Test Specifications
- Add tests to `tests/mechanics.test.cjs` that verify profile switching, saving, and switching back restores correct progress levels.
