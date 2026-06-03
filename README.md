# FusionPanda Master

**Collect. Fuse. Battle. Ascend.**  
A polished browser-based idle fusion RPG featuring deep progression systems, daily challenges, and a striking cyber-neon panda aesthetic. All progress saves automatically in your browser via localStorage.  

Play instantly: [grok-talk.vercel.app](https://grok-talk.vercel.app)

## Features

- **Fusion Lab** — Combine pandas using Basic, Advanced, or Ritual modes. Features elemental synergy bonuses, critical fusion chance, dynamic rarity, and visual feedback.
- **My Collection** — Manage your growing panda army with powerful search, filtering, power tracking, and card-based UI.
- **Codex** — Comprehensive bestiary, achievement tracking, unlockable catalysts, and an interactive fusion recipe tree.
- **Battle Arena** — Demo battles with animated effects, damage numbers, and XP rewards. Choose your champion wisely.
- **Daily Challenge** — Gated reward system requiring lifetime XP milestones + specific fire-type fusion counts for bonus XP and rare pandas.
- **Progression & Persistence** — Leveling system, XP tracking (including lifetime earned), schema-safe localStorage saves with migration support.
- **Konami Code Easter Egg** — Classic cheat code unlocks a powerful secret "Quantum Overlord Panda".
- **PWA Capable** — Installable web app with manifest, icon, and responsive mobile-first design (full offline support planned).
- **Keyboard Shortcuts** — `Esc` (close modals), `Cmd/Ctrl + /` (search collection), `?` (jump to Fusion Lab).
- **Rich Visuals** — Tailwind-powered cyberpunk/neon UI with confetti, animations, toasts, and smooth state updates.

## Tech Stack

- **Frontend**: Vanilla HTML5 + Tailwind CSS (via CDN) + Font Awesome icons
- **Game Logic**: Pure JavaScript (no frameworks) with modular state management
- **Build Tooling**: Custom Node.js script (`strip.cjs`) for HTML preprocessing
- **Testing**: Custom Node assertion tests (`build.test.cjs` + `reward-gate.test.cjs`)
- **Deployment**: Vercel (zero-config with `vercel.json`)
- **Persistence**: Browser localStorage with versioned schema and validation

## Getting Started (Local Development)

```bash
git clone https://github.com/kwizzlesurp10-ctrl/grok-talk.git
cd grok-talk

# Install (lightweight)
npm install

# Run development server
npm start
```

Open http://localhost:3000 in Firefox or Chrome.

## Build, Test & Deploy

```bash
# Full build + test (recommended before committing)
npm run build

# Run tests only
npm test
```

The build step processes `source.html` → production `index.html` (externalizes styles/scripts).  
All tests validate both the generated HTML structure/ARIA and core game reward logic.

Vercel automatically runs `npm run build` on every push to `main`.

## How to Play

1. Land on the **Dashboard** to see your current level, XP, and stats.
2. Go to **Fusion Lab** — pick two pandas and fuse them. Experiment with modes for better results.
3. Check **My Collection** to see everything you've created.
4. Explore the **Codex** to track discoveries, achievements, and fusion recipes.
5. Test your strongest panda in the **Battle Arena**.
6. Complete the **Daily Challenge** requirements for bonus rewards.

**Pro tip**: Hit the lifetime XP and fire fusion thresholds to unlock the daily reward panda ("Blaze Guardian").

## Contributing

We welcome focused, high-quality contributions!

1. Fork the repo and create a feature branch from `main`.
2. Make your changes.
3. Run `npm run build` and ensure all tests pass.
4. Submit a Pull Request with a clear description of the change and testing notes.

Please follow the existing code style and keep PRs small and reviewable.

## License

MIT License

## Support the Project

If FusionPanda Master brings you joy or helps you prototype your own browser games, consider supporting continued development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-donate-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/kwizzlesurp10ctrl)

Your support helps keep the project alive and growing. Thank you!

---

**Built with ❤️ and a lot of panda fusion energy by kwizzlesurp10-ctrl**