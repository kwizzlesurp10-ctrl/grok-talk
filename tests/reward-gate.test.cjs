const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const rawApp = fs.readFileSync(path.join(root, "app.js"), "utf8");
const appSrc = rawApp.replace(/\n\s*scheduleInit\(\);\s*$/, "\n");

function makeDomStub() {
    const el = (tag) => ({
        tag,
        className: "",
        classList: { add() {}, remove() {}, contains() {
            return false;
        } },
        style: {},
        innerHTML: "",
        innerText: "",
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
        "toast-container",
        "mode-basic",
        "mode-advanced",
        "mode-ritual",
        "energy-cost",
        "slot-alpha",
        "slot-beta",
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

function runAppWithGameState(initial) {
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
    };
    let timeoutSerial = 0;
    sandbox.setTimeout = (fn) => {
        queueMicrotask(() => {
            try {
                fn();
            } catch (_) {
                /* ignore deferred UI in stub DOM */
            }
        });
        return ++timeoutSerial;
    };
    sandbox.clearTimeout = () => {};
    sandbox.window = sandbox;
    const ctx = vm.createContext(sandbox);
    vm.runInContext(appSrc + "\n;0", ctx, { filename: "app.js" });

    const read = (name) => vm.runInContext(name, ctx);

    const saveGameState = read("saveGameState");
    const loadGameState = read("loadGameState");
    const claimDailyChallenge = read("claimDailyChallenge");
    const bumpLifetimeEarnedXp = read("bumpLifetimeEarnedXp");

    const gameState = read("gameState");
    Object.assign(gameState, initial);
    const userPandas = read("userPandas");
    userPandas.length = 0;
    userPandas.push({
        id: "u-test",
        name: "Classic Panda",
        emoji: "🐼",
        type: "Balanced",
        power: 12,
        rarity: "common",
        color: "#64748b",
        desc: "Test",
        acquired: "2026-01-01",
    });
    saveGameState();
    loadGameState();

    return {
        get gameState() {
            return read("gameState");
        },
        get userPandas() {
            return read("userPandas");
        },
        claimDailyChallenge,
        bumpLifetimeEarnedXp,
    };
}

{
    const { gameState, claimDailyChallenge } = runAppWithGameState({
        level: 0,
        xp: 0,
        lifetimeEarnedXp: 0,
        fusions: 0,
        ritualFusionsCount: 0,
        collectionCount: 1,
        totalPower: 12,
        collection: [],
        recentFusions: [],
    });
    const xpBefore = gameState.xp;
    claimDailyChallenge();
    if (gameState.xp !== xpBefore) {
        throw new Error("claimDailyChallenge should not grant XP when below earned threshold");
    }
}

{
    const { gameState, claimDailyChallenge, bumpLifetimeEarnedXp, userPandas } = runAppWithGameState({
        level: 0,
        xp: 0,
        lifetimeEarnedXp: 499,
        fusions: 0,
        ritualFusionsCount: 0,
        collectionCount: 1,
        totalPower: 12,
        collection: [],
        recentFusions: [],
    });
    bumpLifetimeEarnedXp(1);
    const lenBefore = userPandas.length;
    claimDailyChallenge();
    if (userPandas.length <= lenBefore) {
        throw new Error("claimDailyChallenge should add reward panda once threshold is met");
    }
}

process.stdout.write("reward gate ok\n");
