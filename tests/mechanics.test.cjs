const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert");

const root = path.join(__dirname, "..");
const rawApp = fs.readFileSync(path.join(root, "app.js"), "utf8");
const appSrc = rawApp.replace(/\n\s*scheduleInit\(\);\s*$/, "\n");

function makeDomStub() {
    const el = (tag) => ({
        tag,
        className: "",
        classList: { 
            add() {}, 
            remove() {}, 
            contains() { return false; } 
        },
        style: {},
        innerHTML: "",
        innerText: "",
        textContent: "",
        disabled: false,
        children: [],
        appendChild(c) {
            this.children.push(c);
            return c;
        },
        remove() {},
        setAttribute() {},
        removeAttribute() {},
        getAttribute() {
            return null;
        },
        closest() {
            return null;
        },
        onclick: null,
        value: "",
    });

    const byId = new Map();
    const stubIds = [
        "section-dashboard",
        "nav-dashboard",
        "collection-grid",
        "base-pandas-grid",
        "recent-fusions-list",
        "fuse-btn",
        "nav-level",
        "nav-level-compact",
        "dash-level",
        "dash-fusions",
        "dash-collection",
        "dash-power",
        "dash-xp-bar",
        "dash-xp",
        "collection-count",
        "daily-challenge-claim-btn",
        "daily-challenge-claim-label",
        "daily-challenge-reward-hint",
        "daily-challenge-fire-count",
        "daily-challenge-fire-bar",
        "toast-container",
        "mode-basic",
        "mode-advanced",
        "mode-ritual",
        "energy-cost",
        "slot-alpha",
        "slot-beta",
        "fusion-result-modal",
        "fusion-result-emoji",
        "fusion-result-name",
        "fusion-result-type",
        "fusion-result-power",
        "fusion-result-rarity",
        "fusion-result-rarity-text",
        "fusion-result-bonus",
        "evolve-btn",
        "codex-progress-text",
        "codex-progress-bar",
        "recent-codex",
        "codex-count",
        "codex-grid",
        "search-input",
        "filter-rarity",
        "codex-search",
        "codex-filter",
        "panda-selector-modal",
        "selector-grid",
        "upgrades-ep-balance",
        "upgrade-efficiency-level",
        "upgrade-stability-level",
        "upgrade-efficiency-value",
        "upgrade-stability-value",
        "upgrade-efficiency-bar",
        "upgrade-stability-bar",
        "upgrade-efficiency-btn",
        "upgrade-stability-btn",
        "upgrade-efficiency-sub",
        "upgrade-stability-sub",
        "upgrade-training-level",
        "upgrade-training-value",
        "upgrade-training-bar",
        "upgrade-training-btn",
        "upgrade-training-sub",
        "booster-blazing-btn",
        "booster-cryo-btn",
        "booster-lightning-btn",
        "dash-ep"
    ];
    for (const id of stubIds) {
        byId.set(id, el("div"));
    }

    return {
        documentElement: { style: { setProperty() {} } },
        body: {
            insertAdjacentHTML() {},
            appendChild() {},
            classList: { add() {}, remove() {} },
        },
        hidden: false,
        readyState: "complete",
        getElementById(id) {
            return byId.get(id) || null;
        },
        querySelectorAll() {
            return [];
        },
        addEventListener() {},
        createElement(t) {
            return el(t);
        },
    };
}

function runAppWithGameState(initial = {}) {
    const documentStub = makeDomStub();
    const sandbox = {
        console,
        localStorage: {
            _m: new Map(),
            getItem(k) {
                return this._m.has(k) ? this._m.get(k) : null;
            },
            setItem(k, v) {
                this._m.set(k, String(v));
            },
            removeItem(k) {
                this._m.delete(k);
            },
        },
        document: documentStub,
        window: {},
        tailwind: { config: {} },
        setTimeout,
        clearTimeout,
        Math,
        Date,
        JSON,
        navigator: { userAgent: "test" },
        performance: { now: () => 0 },
        requestAnimationFrame: (cb) => queueMicrotask(cb),
        showToast() {}
    };

    let timeoutSerial = 0;
    sandbox.setTimeout = (fn) => {
        queueMicrotask(() => {
            try {
                fn();
            } catch (_) {
                /* ignore UI updates on stubs */
            }
        });
        return ++timeoutSerial;
    };
    sandbox.clearTimeout = () => {};
    sandbox.window = sandbox;

    const ctx = vm.createContext(sandbox);
    vm.runInContext(appSrc + "\n;0", ctx, { filename: "app.js" });

    const read = (name) => vm.runInContext(name, ctx);
    const write = (name, val) => {
        vm.runInContext(`${name} = ${JSON.stringify(val)};`, ctx);
    };

    const gameState = read("gameState");
    Object.assign(gameState, initial);

    return {
        read,
        write,
        sandbox,
        ctx,
        get gameState() {
            return read("gameState");
        },
        get userPandas() {
            return read("userPandas");
        },
        documentStub
    };
}

async function runTests() {
    // -------------------- TEST 1: Fusion Synergy & Modes --------------------
    {
        const { read } = runAppWithGameState();
        const createFusionResult = read("createFusionResult");

        const firePanda = { name: "Inferno Panda", emoji: "🔥🐼", type: "Fire", power: 18, rarity: "rare" };
        const icePanda = { name: "Frostbite Panda", emoji: "❄️🐼", type: "Ice", power: 15, rarity: "rare" };
        
        // Steam synergy
        const resultSteam = createFusionResult(firePanda, icePanda, "basic");
        assert.equal(resultSteam.type, "Steam");
        assert.ok(resultSteam.power > 15);

        // Eclipse synergy
        const darkPanda = { name: "Shadow Panda", emoji: "🌑🐼", type: "Dark", power: 22, rarity: "epic" };
        const lightPanda = { name: "Golden Fortune", emoji: "✨🐼", type: "Light", power: 27, rarity: "legendary" };
        const resultEclipse = createFusionResult(darkPanda, lightPanda, "basic");
        assert.equal(resultEclipse.type, "Eclipse");

        // Plasma synergy
        const electricPanda = { name: "Thunder Panda", emoji: "⚡🐼", type: "Electric", power: 19, rarity: "rare" };
        const crystalPanda = { name: "Crystal Panda", emoji: "💎🐼", type: "Crystal", power: 16, rarity: "rare" };
        const resultPlasma = createFusionResult(electricPanda, crystalPanda, "basic");
        assert.equal(resultPlasma.type, "Plasma");

        // Ritual power scaling comparison
        const resultBasic = createFusionResult(firePanda, icePanda, "basic");
        const resultRitual = createFusionResult(firePanda, icePanda, "ritual");
        assert.ok(resultRitual.power > resultBasic.power, "Ritual mode fusions should yield higher average power");
    }

    // -------------------- TEST 2: Evolution Mechanics --------------------
    {
        const { read, sandbox } = runAppWithGameState();
        const evolveFusionResult = read("evolveFusionResult");
        
        const initialPanda = {
            name: "Steam Panda",
            emoji: "🌫️🔥",
            type: "Steam",
            power: 50,
            rarity: "epic",
            desc: "Original description"
        };
        sandbox.window.currentFusionResult = initialPanda;
        
        evolveFusionResult();
        
        const evolved = sandbox.window.currentFusionResult;
        // power avg math: Math.floor(50 * 1.28) + 12 = 64 + 12 = 76
        assert.equal(evolved.power, 76);
        assert.equal(evolved.rarity, "legendary");
        assert.ok(evolved.name.startsWith("Evolved "));
        assert.ok(evolved.emoji.endsWith("✨"));
    }

    // -------------------- TEST 3: Level Up & XP math --------------------
    {
        const { read, gameState, write } = runAppWithGameState({ xp: 9950, level: 5 });
        const performFusion = read("performFusion");
        const selectPandaForSlot = read("selectPandaForSlot");

        const pandaA = { id: 'u1', name: "Classic Panda", emoji: "🐼", type: "Balanced", power: 12, rarity: "common", color: "#64748b" };
        const pandaB = { id: 'u2', name: "Classic Panda 2", emoji: "🐼", type: "Balanced", power: 12, rarity: "common", color: "#64748b" };
        
        selectPandaForSlot("alpha", pandaA);
        selectPandaForSlot("beta", pandaB);

        performFusion();
        
        // Wait for performFusion's microtask to resolve
        await new Promise(resolve => queueMicrotask(resolve));

        // Since performFusion adds random XP between 85 and 205 (or more under modes),
        // starting at 9900 XP guarantees crossing the 10000 XP mark.
        // Therefore, level should increment to 6, and XP should roll over.
        assert.equal(gameState.level, 6);
        assert.ok(gameState.xp < 10000);
    }

    // -------------------- TEST 4: Energy Cost Scaling --------------------
    {
        const { read, documentStub, write } = runAppWithGameState();
        const updateEnergyCost = read("updateEnergyCost");
        const selectPandaForSlot = read("selectPandaForSlot");

        const pandaA = { id: 'u1', name: "Classic Panda", emoji: "🐼", type: "Balanced", power: 10, rarity: "common", color: "#64748b" };
        const pandaB = { id: 'u2', name: "Classic Panda 2", emoji: "🐼", type: "Balanced", power: 20, rarity: "common", color: "#64748b" };

        selectPandaForSlot("alpha", pandaA);
        selectPandaForSlot("beta", pandaB);

        // Power avg: (10 + 20) / 2 = 15.
        // Basic: base = 250. Final = Math.floor(250 + 15 * 1.8) = 250 + 27 = 277.
        write("currentFusionMode", "basic");
        updateEnergyCost();
        const costBasic = documentStub.getElementById("energy-cost").innerText;
        assert.equal(costBasic, "277 EP");

        // Advanced: base = 250 * 1.6 = 400. Final = Math.floor(400 + 15 * 1.8) = 400 + 27 = 427.
        write("currentFusionMode", "advanced");
        updateEnergyCost();
        const costAdvanced = documentStub.getElementById("energy-cost").innerText;
        assert.equal(costAdvanced, "427 EP");

        // Ritual: base = 250 * 2.8 = 700. Final = Math.floor(700 + 15 * 1.8) = 700 + 27 = 727.
        write("currentFusionMode", "ritual");
        updateEnergyCost();
        const costRitual = documentStub.getElementById("energy-cost").innerText;
        assert.equal(costRitual, "727 EP");
    }

    // -------------------- TEST 5: Schema Migration & Restoration --------------------
    {
        const { read, sandbox, gameState } = runAppWithGameState();
        const loadGameState = read("loadGameState");
        
        const oldState = {
            level: 3,
            fusions: 10,
            lifetimeEarnedXp: -1,
            collection: [
                { id: 'u1', name: "Classic Panda", emoji: "🐼", type: "Balanced", power: 12, rarity: "common" }
            ]
        };
        sandbox.localStorage.setItem("fusionPandaMaster", JSON.stringify(oldState));
        
        loadGameState();
        
        const loadedState = read("gameState");
        // schema version should migrate to 2
        assert.equal(loadedState.saveSchemaVersion, 2);
        // fireChallengeFusions should be populated
        assert.ok(typeof loadedState.fireChallengeFusions === "number");
        // lifetimeEarnedXp should be estimated since it was missing
        // estimate: Math.floor(fusions * 95 + level * 400) = 10 * 95 + 3 * 400 = 950 + 1200 = 2150
        assert.equal(loadedState.lifetimeEarnedXp, 2150);
    }

    // -------------------- TEST 6: Upgrades Shop & Earning Mechanics --------------------
    {
        const { read, gameState, documentStub } = runAppWithGameState({ ep: 1000 });
        const buyUpgrade = read("buyUpgrade");
        const buyBooster = read("buyBooster");
        const renderUpgrades = read("renderUpgrades");

        // Buy Fusion Efficiency upgrade (level 0 -> level 1)
        // Cost: 250 + 0 * 150 = 250 EP. Remaining: 1000 - 250 = 750 EP.
        buyUpgrade("efficiency");
        assert.equal(gameState.upgrades.efficiency, 1);
        assert.equal(gameState.ep, 750);

        // Buy Genetic Stability upgrade (level 0 -> level 1)
        // Cost: 400 + 0 * 250 = 400 EP. Remaining: 750 - 400 = 350 EP.
        buyUpgrade("stability");
        assert.equal(gameState.upgrades.stability, 1);
        assert.equal(gameState.ep, 350);

        // Buy Blazing Catalyst booster
        // Cost: 450 EP. Insufficient EP (350 < 450). Should fail.
        buyBooster("blazing");
        assert.equal(gameState.boosters.blazing, false);
        assert.equal(gameState.ep, 350);

        // Add EP and buy Blazing Catalyst
        gameState.ep = 500;
        buyBooster("blazing");
        assert.equal(gameState.boosters.blazing, true);
        assert.equal(gameState.ep, 50);

        // Test rendering UI elements
        renderUpgrades();
        const balanceText = documentStub.getElementById("upgrades-ep-balance").innerText;
        assert.equal(balanceText, "50");
        const effLvlText = documentStub.getElementById("upgrade-efficiency-level").innerText;
        assert.equal(effLvlText, "LVL 1 / 25");
        const stabLvlText = documentStub.getElementById("upgrade-stability-level").innerText;
        assert.equal(stabLvlText, "LVL 1 / 15");
    }

    // -------------------- TEST 7: Battle Damage Scaling & Training Upgrade --------------------
    {
        const { read, gameState, documentStub } = runAppWithGameState({ ep: 1000 });
        const buyUpgrade = read("buyUpgrade");
        const __createBattleMatch = read("__createBattleMatch");

        // 1. Purchase checks
        buyUpgrade("training"); // lvl 0 -> 1: cost 300 EP
        assert.equal(gameState.upgrades.training, 1);
        assert.equal(gameState.ep, 700);

        buyUpgrade("training"); // lvl 1 -> 2: cost 500 EP
        assert.equal(gameState.upgrades.training, 2);
        assert.equal(gameState.ep, 200);

        buyUpgrade("training"); // lvl 2 -> 3: cost 700 EP (fails due to insufficient EP)
        assert.equal(gameState.upgrades.training, 2);
        assert.equal(gameState.ep, 200);

        // 2. Damage scaling check
        gameState.level = 5;
        gameState.upgrades.training = 0;
        const matchBase = __createBattleMatch();
        const dmgBase = matchBase.playerBaseDamage;

        gameState.upgrades.training = 3; // +15% damage bonus
        const matchUpgraded = __createBattleMatch();
        const dmgUpgraded = matchUpgraded.playerBaseDamage;

        assert.equal(dmgUpgraded, Math.floor(dmgBase * 1.15));
    }

    process.stdout.write("mechanics ok\n");
}

runTests().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
