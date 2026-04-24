// Tailwind script
function initTailwind() {
  document.documentElement.style.setProperty("--accent", "#00ff9d");

  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          grotesk: ["Space Grotesk", "system-ui", "sans-serif"],
        },
      },
    },
  };
}

// Game State
let gameState = {
  level: 47,
  xp: 8420,
  fusions: 1284,
  collectionCount: 64,
  totalPower: 94700,
  collection: [],
  recentFusions: [],
};

// Base Pandas Data
const basePandas = [
  { id: 1, name: "Classic Panda", emoji: "🐼", type: "Balanced", power: 12, rarity: "common", color: "#64748b", desc: "The original bamboo-loving legend. Reliable and steady in every fusion." },
  { id: 2, name: "Inferno Panda", emoji: "🔥🐼", type: "Fire", power: 18, rarity: "rare", color: "#f97316", desc: "Born in volcanic craters. Brings explosive energy to any fusion." },
  { id: 3, name: "Frostbite Panda", emoji: "❄️🐼", type: "Ice", power: 15, rarity: "rare", color: "#67e8f9", desc: "From the eternal glaciers of the north. Slows enemies with icy aura." },
  { id: 4, name: "Shadow Panda", emoji: "🌑🐼", type: "Dark", power: 22, rarity: "epic", color: "#6366f1", desc: "Master of stealth and illusion. Vanishes in plain sight." },
  { id: 5, name: "Thunder Panda", emoji: "⚡🐼", type: "Electric", power: 19, rarity: "rare", color: "#eab308", desc: "Channeling the power of storms. Fast and shocking." },
  { id: 6, name: "Golden Fortune", emoji: "✨🐼", type: "Light", power: 27, rarity: "legendary", color: "#fbbf24", desc: "Extremely rare. Brings incredible luck and prosperity." },
  { id: 7, name: "Mystic Panda", emoji: "🔮🐼", type: "Arcane", power: 24, rarity: "epic", color: "#c026ff", desc: "Wielder of ancient panda magic. Unpredictable and wise." },
  { id: 8, name: "Crystal Panda", emoji: "💎🐼", type: "Crystal", power: 16, rarity: "rare", color: "#67e8f9", desc: "Crystalline armor protects it from harm. Beautiful but deadly." },
];

// User's unlocked pandas (starts with some)
let userPandas = [
  { ...basePandas[0], id: "u1", acquired: "2025-11-12" },
  { ...basePandas[1], id: "u2", acquired: "2025-12-03" },
  { ...basePandas[2], id: "u3", acquired: "2025-12-18" },
  { ...basePandas[3], id: "u4", acquired: "2026-01-05" },
  { ...basePandas[4], id: "u5", acquired: "2026-01-22" },
  { ...basePandas[5], id: "u6", acquired: "2026-02-14" },
  { ...basePandas[6], id: "u7", acquired: "2026-03-01" },
  { id: "u8", name: "Steam Panda", emoji: "🌫️🔥", type: "Hybrid", power: 31, rarity: "epic", color: "#64748b", desc: "A perfect fusion of fire and ice. Creates powerful steam blasts.", acquired: "2026-02-20" },
  { id: "u9", name: "Void Walker", emoji: "🕳️🐼", type: "Dark", power: 38, rarity: "legendary", color: "#4f46e5", desc: "Created from Shadow + Mystic. Bends reality itself.", acquired: "2026-03-10" },
  { id: "u10", name: "Solar Flare", emoji: "☀️⚡", type: "Hybrid", power: 42, rarity: "mythic", color: "#f59e0b", desc: "Ultimate light + electric fusion. Blinds opponents with pure energy.", acquired: "2026-03-28" },
];

// Current selected for fusion
let selectedAlpha = null;
let selectedBeta = null;

function saveGameState() {
  localStorage.setItem("fusionPandaMaster", JSON.stringify({
    ...gameState,
    collection: userPandas,
    recentFusions: gameState.recentFusions,
  }));
}

function loadGameState() {
  const saved = localStorage.getItem("fusionPandaMaster");
  if (saved) {
    const parsed = JSON.parse(saved);
    gameState = { ...gameState, ...parsed };
    if (parsed.collection) userPandas = parsed.collection;
    if (parsed.recentFusions) gameState.recentFusions = parsed.recentFusions;
  } else {
    gameState.recentFusions = [
      { name: "Void Walker", emoji: "🕳️🐼", power: 38, time: "2h ago" },
      { name: "Solar Flare", emoji: "☀️⚡", power: 42, time: "yesterday" },
      { name: "Steam Panda", emoji: "🌫️🔥", power: 31, time: "3d ago" },
    ];
  }

  updateDashboard();
  renderCollection();
  renderBasePandas();
  renderRecentFusions();
}

function updateDashboard() {
  document.getElementById("nav-level").innerText = String(gameState.level);
  document.getElementById("dash-level").innerText = String(gameState.level);
  document.getElementById("dash-fusions").innerText = gameState.fusions.toLocaleString();
  document.getElementById("dash-collection").innerText = String(userPandas.length);
  document.getElementById("dash-power").innerText = `${(gameState.totalPower / 1000).toFixed(1)}k`;

  const xpPercent = Math.min((gameState.xp / 10000) * 100, 100);
  document.getElementById("dash-xp-bar").style.width = `${String(xpPercent)}%`;
  document.getElementById("dash-xp").innerText = `${gameState.xp.toLocaleString()} / 10,000`;
  document.getElementById("collection-count").innerText = String(userPandas.length);
}

function renderRecentFusions() {
  const container = document.getElementById("recent-fusions-list");
  container.innerHTML = "";

  if (!gameState.recentFusions || gameState.recentFusions.length === 0) {
    container.innerHTML = `<div class="text-xs text-gray-500 py-4 text-center">No recent fusions yet. Start fusing!</div>`;
    return;
  }

  gameState.recentFusions.slice(0, 3).forEach((fusion) => {
    const el = document.createElement("div");
    el.className = "flex items-center gap-x-4 p-3 hover:bg-[#1a1f2e] rounded-2xl transition-colors cursor-pointer";
    el.innerHTML = `
      <div class="text-4xl flex-shrink-0">${fusion.emoji}</div>
      <div class="flex-1 min-w-0">
        <div class="font-semibold">${fusion.name}</div>
        <div class="text-xs text-gray-400 flex items-center gap-x-2">
          <span>Power: <span class="font-mono text-emerald-400">${fusion.power}</span></span>
          <span class="text-gray-600">•</span>
          <span>${fusion.time}</span>
        </div>
      </div>
      <div class="text-emerald-400">
        <i class="fas fa-check-circle"></i>
      </div>
    `;
    container.appendChild(el);
  });
}

function renderBasePandas() {
  const container = document.getElementById("base-pandas-grid");
  container.innerHTML = "";

  basePandas.forEach((panda) => {
    const isUnlocked = userPandas.some(
      (up) => up.name === panda.name || (up.type === panda.type && up.rarity === panda.rarity),
    );

    const card = document.createElement("div");
    card.className = `panda-card cyber-card rounded-2xl p-3 border border-gray-700 cursor-pointer flex flex-col items-center text-center ${!isUnlocked ? "opacity-60" : ""}`;

    card.innerHTML = `
      <div class="text-5xl mb-2 transition-transform">${panda.emoji}</div>
      <div class="font-bold text-sm">${panda.name}</div>
      <div class="text-[10px] mt-0.5 px-2.5 py-px rounded-full" style="background: ${panda.color}30; color: ${panda.color}">
        ${panda.type}
      </div>
      <div class="mt-auto pt-2 text-xs flex items-center justify-center gap-x-1">
        <span class="font-mono text-emerald-400">${panda.power}</span>
        <span class="text-gray-500">PWR</span>
      </div>
    `;

    if (isUnlocked) {
      card.onclick = () => quickSelectPanda(panda);
    } else {
      card.onclick = () => showToast("This species hasn't been discovered yet!", "info");
    }

    container.appendChild(card);
  });
}

function quickSelectPanda(panda) {
  const found = userPandas.find((p) => p.name === panda.name);
  if (!found) {
    showToast("You haven't unlocked this panda yet!", "error");
    return;
  }

  if (!selectedAlpha) {
    selectPandaForSlot("alpha", found);
  } else if (!selectedBeta) {
    selectPandaForSlot("beta", found);
  } else {
    selectPandaForSlot("alpha", found);
  }

  showToast(`Added ${panda.name} to fusion slot`, "success");
}
function renderCollection(filteredPandas = null) {
  const container = document.getElementById("collection-grid");
  container.innerHTML = "";

  const pandasToShow = filteredPandas || userPandas;

  if (pandasToShow.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400">No pandas found matching your search.</div>`;
    return;
  }

  pandasToShow.forEach((panda) => {
    const card = document.createElement("div");
    card.className = "panda-card cyber-card rounded-3xl p-4 border border-gray-700 cursor-pointer group";

    const rarityColor = getRarityColor(panda.rarity);
    const pandaIdJson = JSON.stringify(panda.id);

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="text-6xl mb-3 transition-all group-hover:scale-110">${panda.emoji}</div>
        <div class="px-2.5 py-0.5 text-xs font-bold rounded-full self-start" style="background: ${rarityColor}30; color: ${rarityColor}">
          ${panda.rarity.toUpperCase()}
        </div>
      </div>
      
      <div class="font-bold text-lg leading-none mb-1">${panda.name}</div>
      <div class="flex items-center gap-x-2 text-xs">
        <span class="px-2 py-px rounded" style="background: ${panda.color}25; color: ${panda.color}">${panda.type}</span>
      </div>
      
      <div class="mt-4 flex items-end justify-between">
        <div>
          <div class="text-xs text-gray-400">POWER</div>
          <div class="font-black text-2xl text-white">${panda.power}</div>
        </div>
        <div class="text-right">
          <div onclick="event.stopImmediatePropagation(); showPandaDetail(${pandaIdJson});" 
            class="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl inline-block cursor-pointer">
            <span class="text-emerald-400">DETAILS</span>
          </div>
        </div>
      </div>
    `;

    card.onclick = () => showPandaDetail(panda.id);
    container.appendChild(card);
  });
}

function getRarityColor(rarity) {
  switch (rarity) {
    case "common":
      return "#64748b";
    case "rare":
      return "#22d3ee";
    case "epic":
      return "#c026ff";
    case "legendary":
      return "#fbbf24";
    case "mythic":
      return "#f43f5e";
    default:
      return "#64748b";
  }
}

function filterCollection() {
  const searchTerm = document.getElementById("search-input").value.toLowerCase();
  const rarityFilter = document.getElementById("filter-rarity").value;

  let filtered = userPandas;

  if (searchTerm) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.type.toLowerCase().includes(searchTerm) ||
        p.desc.toLowerCase().includes(searchTerm),
    );
  }

  if (rarityFilter) {
    filtered = filtered.filter((p) => p.rarity === rarityFilter);
  }

  renderCollection(filtered);
}

function showPandaDetail(pandaId) {
  const panda = userPandas.find((p) => p.id === pandaId);
  if (!panda) {
    return;
  }

  const pandaIdJson = JSON.stringify(panda.id);
  const modalHTML = `
    <div id="panda-detail-overlay" onclick="this.remove()" class="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4">
      <div onclick="event.stopImmediatePropagation()" class="cyber-card w-full max-w-lg rounded-3xl overflow-hidden border border-gray-700">
        <div class="px-8 pt-8 pb-6 relative">
          <button onclick="event.target.closest('.fixed').remove()" class="absolute top-6 right-6 text-gray-400 hover:text-white">
            <i class="fas fa-times text-2xl"></i>
          </button>
          <div class="flex justify-center">
            <div class="text-[130px] transition-all">${panda.emoji}</div>
          </div>
          <div class="text-center mt-1">
            <div class="inline-block px-5 py-1 rounded-full text-xs font-extrabold tracking-widest mb-2" 
              style="background: ${getRarityColor(panda.rarity)}30; color: ${getRarityColor(panda.rarity)}">
              ${panda.rarity.toUpperCase()}
            </div>
            <div class="text-4xl font-black">${panda.name}</div>
            <div class="text-lg text-emerald-400 mt-1">${panda.type} TYPE</div>
          </div>
          <div class="mt-8 grid grid-cols-2 gap-4">
            <div class="bg-[#1a1f2e] rounded-2xl p-4 text-center">
              <div class="text-xs text-gray-400">ATTACK POWER</div>
              <div class="text-5xl font-black text-emerald-400 mt-1">${panda.power}</div>
            </div>
            <div class="bg-[#1a1f2e] rounded-2xl p-4 text-center">
              <div class="text-xs text-gray-400">SPECIAL</div>
              <div class="text-3xl mt-2 font-bold">${panda.type}</div>
              <div class="text-xs mt-1 text-gray-400">TRAIT</div>
            </div>
          </div>
          <div class="mt-6 text-sm text-gray-300 leading-relaxed">${panda.desc}</div>
          <div class="mt-6 text-xs flex items-center justify-between text-gray-500">
            <div>Acquired: <span class="font-mono">${panda.acquired || "Unknown"}</span></div>
            <div class="flex items-center gap-x-1">
              <i class="fas fa-star text-amber-400"></i>
              <span>Fusion Master</span>
            </div>
          </div>
        </div>
        <div class="px-8 py-5 border-t border-gray-700 bg-[#0f1117] flex gap-3">
          <button onclick="event.target.closest('.fixed').remove(); quickSelectPandaFromDetail(${pandaIdJson});" 
            class="flex-1 py-3 rounded-2xl border border-emerald-400 text-emerald-400 font-bold text-sm flex items-center justify-center gap-x-2 hover:bg-emerald-400 hover:text-black transition-all">
            <i class="fas fa-plus"></i> 
            <span>ADD TO FUSION</span>
          </button>
          <button onclick="event.target.closest('.fixed').remove()" 
            class="flex-1 py-3 rounded-2xl border border-gray-700 font-medium text-sm hover:bg-gray-800 transition-all">
            CLOSE
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function quickSelectPandaFromDetail(pandaId) {
  const panda = userPandas.find((p) => p.id === pandaId);
  if (!panda) {
    return;
  }

  const detailOverlay = document.getElementById("panda-detail-overlay");
  if (detailOverlay) {
    detailOverlay.remove();
  }

  if (!selectedAlpha) {
    selectPandaForSlot("alpha", panda);
  } else if (!selectedBeta) {
    selectPandaForSlot("beta", panda);
  } else {
    selectPandaForSlot("alpha", panda);
  }

  navigateTo("fusion-lab");
  showToast(`Loaded ${panda.name} into fusion chamber`, "success");
}

function openPandaSelector(slot) {
  const modal = document.getElementById("panda-selector-modal");
  const grid = document.getElementById("selector-grid");
  grid.innerHTML = "";

  userPandas.forEach((panda) => {
    const card = document.createElement("div");
    card.className = "panda-card cyber-card rounded-2xl p-4 border border-gray-700 cursor-pointer hover:border-emerald-400 flex flex-col";

    const rarityColor = getRarityColor(panda.rarity);

    card.innerHTML = `
      <div class="flex justify-between">
        <div class="text-5xl mb-2">${panda.emoji}</div>
        <div>
          <div class="px-2 py-0.5 text-xs font-bold rounded-full text-center" style="background: ${rarityColor}30; color: ${rarityColor}">
            ${panda.rarity}
          </div>
        </div>
      </div>
      <div class="font-bold">${panda.name}</div>
      <div class="text-xs text-emerald-400">${panda.type}</div>
      <div class="mt-auto pt-3 flex justify-between items-center">
        <div class="font-mono text-lg">${panda.power}</div>
        <div class="text-xs px-2 py-px bg-white/10 rounded">PWR</div>
      </div>
    `;

    card.onclick = () => {
      selectPandaForSlot(slot, panda);
      closePandaSelector();
    };

    grid.appendChild(card);
  });

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closePandaSelector() {
  const modal = document.getElementById("panda-selector-modal");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

function selectPandaForSlot(slot, panda) {
  const slotEl = document.getElementById(`slot-${slot}`);

  if (slot === "alpha") selectedAlpha = panda;
  else selectedBeta = panda;

  slotEl.innerHTML = `
    <div class="p-5 w-full flex flex-col items-center justify-center text-center">
      <div class="text-7xl mb-3 transition-all">${panda.emoji}</div>
      <div class="font-black text-xl">${panda.name}</div>
      <div class="flex items-center gap-x-2 mt-1">
        <span class="px-3 py-px text-xs rounded-full" style="background: ${panda.color}25; color: ${panda.color}">${panda.type}</span>
        <span class="font-mono text-xs text-emerald-400">${panda.power} PWR</span>
      </div>
      <div onclick="event.stopImmediatePropagation(); clearSlot('${slot}')" 
        class="mt-4 text-xs flex items-center gap-x-1 text-red-400 hover:text-red-300 cursor-pointer">
        <i class="fas fa-times"></i> <span>REMOVE</span>
      </div>
    </div>
  `;

  slotEl.classList.add("active", "border-solid");
  slotEl.style.borderColor = panda.color;
  updateFuseButton();
}

function clearSlot(slot) {
  const slotEl = document.getElementById(`slot-${slot}`);

  if (slot === "alpha") selectedAlpha = null;
  else selectedBeta = null;

  slotEl.innerHTML = `
    <div class="text-center">
      <i class="fas fa-plus text-4xl text-gray-600 mb-3"></i>
      <div class="font-medium text-gray-400">Select Panda ${slot === "alpha" ? "A" : "B"}</div>
      <div class="text-xs text-gray-500 mt-1">Click to choose from collection</div>
    </div>
  `;

  slotEl.classList.remove("active");
  slotEl.style.borderColor = "";
  updateFuseButton();
}

function updateFuseButton() {
  const btn = document.getElementById("fuse-btn");
  btn.disabled = !(selectedAlpha && selectedBeta);

  if (selectedAlpha && selectedBeta) {
    btn.classList.add("fusion-glow");
  } else {
    btn.classList.remove("fusion-glow");
  }
}

function performFusion() {
  if (!selectedAlpha || !selectedBeta) return;

  const btn = document.getElementById("fuse-btn");
  btn.disabled = true;
  btn.innerHTML = `<span>FUSING...</span> <i class="fas fa-spinner fa-spin ml-2"></i>`;

  setTimeout(() => {
    const newPanda = createFusionResult(selectedAlpha, selectedBeta);
    showFusionResult(newPanda);
    resetFusionSlots();

    gameState.fusions++;
    gameState.xp += Math.floor(Math.random() * 120) + 85;

    if (gameState.xp >= 10000) {
      gameState.level++;
      gameState.xp = gameState.xp - 10000;
      showLevelUp();
    }

    gameState.recentFusions.unshift({
      name: newPanda.name,
      emoji: newPanda.emoji,
      power: newPanda.power,
      time: "just now",
    });

    if (gameState.recentFusions.length > 5) gameState.recentFusions.pop();

    saveGameState();
    updateDashboard();
    renderRecentFusions();

    btn.innerHTML = `<span>FUSE</span> <i class="fas fa-bolt"></i>`;
    btn.disabled = true;
  }, 1450);
}

function createFusionResult(pandaA, pandaB) {
  let hybridName = "";
  const types = [pandaA.type, pandaB.type];

  if (types.includes("Fire") && types.includes("Ice")) {
    hybridName = "Steam";
  } else if (types.includes("Dark") && types.includes("Light")) {
    hybridName = "Eclipse";
  } else if (types.includes("Electric") && types.includes("Crystal")) {
    hybridName = "Plasma";
  } else if (types.includes("Arcane") && types.includes("Fire")) {
    hybridName = "Inferno Mystic";
  } else {
    const prefixes = ["Ultra", "Mega", "Neo", "Quantum", "Astral", "Primal", "Void", "Nova"];
    hybridName = prefixes[Math.floor(Math.random() * prefixes.length)];
  }

  const fullName = `${hybridName} ${pandaA.name.split(" ").pop() || "Panda"}`;

  const basePower = Math.floor((pandaA.power + pandaB.power) / 2);
  const bonus = Math.floor(Math.random() * 18) + 14;
  const finalPower = basePower + bonus;

  let rarity = "epic";
  const rand = Math.random();
  if (rand > 0.88) rarity = "mythic";
  else if (rand > 0.65) rarity = "legendary";
  else if (rand > 0.35) rarity = "epic";
  else rarity = "rare";

  let emoji = "🐼";
  if (pandaA.emoji.includes("🔥") || pandaB.emoji.includes("🔥")) emoji = "🌋";
  else if (pandaA.emoji.includes("❄️") || pandaB.emoji.includes("❄️")) emoji = "🌨️";
  else if (pandaA.emoji.includes("⚡") || pandaB.emoji.includes("⚡")) emoji = "⚡";
  else if (pandaA.emoji.includes("🌑") || pandaB.emoji.includes("🌑")) emoji = "🌌";
  else if (pandaA.emoji.includes("✨") || pandaB.emoji.includes("✨")) emoji = "🌟";
  else {
    emoji = pandaA.emoji + pandaB.emoji.split("🐼")[0] || "🐼";
  }

  let newType = "Hybrid";
  if (types.length === 2 && types[0] !== types[1]) {
    newType = `${types[0]}-${types[1]}`;
  }

  const newPanda = {
    id: `f${String(Date.now())}`,
    name: fullName,
    emoji,
    type: newType,
    power: finalPower,
    rarity,
    color: getRarityColor(rarity),
    desc: `A magnificent fusion of ${pandaA.name} and ${pandaB.name}. This hybrid possesses incredible ${newType.toLowerCase()} abilities.`,
    acquired: new Date().toISOString().split("T")[0],
  };

  const exists = userPandas.some((p) => p.name === newPanda.name);
  if (!exists) {
    userPandas.push(newPanda);
    gameState.collectionCount = userPandas.length;
  }

  return newPanda;
}

function showFusionResult(newPanda) {
  const modal = document.getElementById("fusion-result-modal");

  document.getElementById("fusion-result-emoji").innerHTML = newPanda.emoji;
  document.getElementById("fusion-result-name").innerText = newPanda.name;
  document.getElementById("fusion-result-type").innerText = newPanda.type.toUpperCase();
  document.getElementById("fusion-result-power").innerText = String(newPanda.power);

  const rarityEl = document.getElementById("fusion-result-rarity");
  const rarityText = document.getElementById("fusion-result-rarity-text");
  const rarityColor = getRarityColor(newPanda.rarity);

  rarityEl.style.background = `${rarityColor}30`;
  rarityEl.style.color = rarityColor;
  rarityEl.innerText = newPanda.rarity.toUpperCase();
  rarityText.innerText = newPanda.rarity.toUpperCase();
  rarityText.style.color = rarityColor;

  const bonus = Math.floor(Math.random() * 25) + 12;
  document.getElementById("fusion-result-bonus").innerText = `+${String(bonus)}%`;

  createConfetti();
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function createConfetti() {
  const colors = ["#00ff9d", "#ff00aa", "#00f0ff", "#fbbf24", "#f43f5e"];
  const container = document.getElementById("fusion-result-modal");

  for (let i = 0; i < 65; i++) {
    setTimeout(() => {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${String(Math.random() * 100)}%`;
      particle.style.top = "-20px";
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.width = `${String(Math.random() * 9 + 5)}px`;
      particle.style.height = particle.style.width;
      particle.style.opacity = String(Math.random() * 0.8 + 0.4);

      container.appendChild(particle);

      const fallDuration = Math.random() * 2800 + 1900;
      const xDrift = (Math.random() - 0.5) * 180;

      particle
        .animate(
          [
            { transform: "translateY(0) rotate(0deg)", opacity: particle.style.opacity },
            {
              transform: `translateY(520px) translateX(${String(xDrift)}px) rotate(${String(
                Math.random() * 620 - 180,
              )}deg)`,
              opacity: 0,
            },
          ],
          { duration: fallDuration, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" },
        )
        .onfinish = () => {
          particle.remove();
        };
    }, i * 0.8);
  }
}

function addToCollectionAndClose() {
  const modal = document.getElementById("fusion-result-modal");
  modal.classList.remove("flex");
  modal.classList.add("hidden");

  renderCollection();
  updateDashboard();
  showToast("Panda added to your collection! 🐼", "success");

  gameState.xp += 35;
  if (gameState.xp >= 10000) {
    gameState.level++;
    gameState.xp -= 10000;
    showLevelUp();
  }
  saveGameState();
  updateDashboard();
}

function closeFusionModal() {
  const modal = document.getElementById("fusion-result-modal");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
  const particles = modal.querySelectorAll(".particle");
  particles.forEach((p) => p.remove());
}

function resetFusionSlots() {
  const alphaSlot = document.getElementById("slot-alpha");
  const betaSlot = document.getElementById("slot-beta");

  alphaSlot.innerHTML = `
    <div class="text-center">
      <i class="fas fa-plus text-4xl text-gray-600 mb-3"></i>
      <div class="font-medium text-gray-400">Select Panda A</div>
      <div class="text-xs text-gray-500 mt-1">Click to choose from collection</div>
    </div>
  `;
  betaSlot.innerHTML = alphaSlot.innerHTML.replace("A", "B");

  alphaSlot.classList.remove("active");
  betaSlot.classList.remove("active");
  alphaSlot.style.borderColor = "";
  betaSlot.style.borderColor = "";

  selectedAlpha = null;
  selectedBeta = null;

  document.getElementById("fuse-btn").disabled = true;
  document.getElementById("fuse-btn").classList.remove("fusion-glow");
}

function showLevelUp() {
  const levelUpHTML = `
    <div id="level-up-overlay" class="fixed inset-0 bg-black/90 z-[130] flex items-center justify-center" onclick="this.remove()">
      <div class="text-center max-w-xs px-6" onclick="event.stopImmediatePropagation()">
        <div class="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 flex items-center justify-center mb-6 shadow-[0_0_80px_#fbbf24]">
          <span class="text-6xl">🏆</span>
        </div>
        <div class="text-5xl font-black mb-1">LEVEL UP!</div>
        <div class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">${String(
    gameState.level,
  )}</div>
        <div class="mt-4 text-xl">You are now a <span class="font-bold text-amber-400">FUSION MASTER</span>!</div>
        <div class="mt-8">
          <button onclick="event.target.closest('.fixed').remove()" class="px-9 py-3.5 rounded-3xl bg-white text-black font-bold text-sm">AWESOME!</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", levelUpHTML);

  setTimeout(() => {
    const levelEl = document.getElementById("level-up-overlay");
    if (!levelEl) return;
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = `${String(Math.random() * 100)}%`;
        p.style.background = ["#fbbf24", "#00ff9d", "#f43f5e"][Math.floor(Math.random() * 3)];
        p.style.top = `${String(Math.random() * 40)}%`;
        levelEl.appendChild(p);

        p.animate(
          [
            { transform: "translateY(0) scale(1)", opacity: 0.9 },
            { transform: `translateY(${String(280 + Math.random() * 120)}px) scale(0.4)`, opacity: 0 },
          ],
          { duration: 1600 + Math.random() * 900, easing: "ease-out" },
        ).onfinish = () => p.remove();
      }, i * 2);
    }
  }, 300);
}

function claimDailyChallenge() {
  showToast("Daily Challenge Completed! +280 XP & 1 Rare Panda", "success");

  gameState.xp += 280;
  if (gameState.xp >= 10000) {
    gameState.level++;
    gameState.xp -= 10000;
    setTimeout(showLevelUp, 800);
  }

  const rewardPanda = {
    id: `daily-${String(Date.now())}`,
    name: "Blaze Guardian",
    emoji: "🦍🔥",
    type: "Fire",
    power: 29,
    rarity: "rare",
    color: "#f97316",
    desc: "Rewarded for completing today's Inferno Fusion challenge. A loyal guardian of the flame.",
    acquired: new Date().toISOString().split("T")[0],
  };

  userPandas.push(rewardPanda);
  gameState.fusions += 5;

  saveGameState();
  updateDashboard();
  renderCollection();

  setTimeout(() => {
    const rewardModal = document.createElement("div");
    rewardModal.className = "fixed inset-0 z-[140] flex items-center justify-center bg-black/70";
    rewardModal.innerHTML = `
      <div class="cyber-card max-w-xs w-full mx-4 rounded-3xl p-8 text-center border border-amber-400">
        <div class="text-7xl mb-4">🦍🔥</div>
        <div class="font-black text-2xl">NEW PANDA UNLOCKED!</div>
        <div class="mt-1 text-amber-400">Blaze Guardian</div>
        <div class="mt-6 text-xs px-6 py-4 bg-black/40 rounded-2xl text-left">
          <div class="flex justify-between text-xs">
            <span>Power</span> <span class="font-mono text-emerald-400">29</span>
          </div>
        </div>
        <button onclick="this.closest('.fixed').remove(); navigateTo('collection')" 
          class="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-bold">VIEW IN COLLECTION</button>
      </div>
    `;
    document.body.appendChild(rewardModal);
  }, 650);
}

function startDemoBattle() {
  const arenaSection = document.getElementById("section-arena");
  arenaSection.innerHTML = `
    <div class="max-w-3xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <div class="uppercase tracking-[3px] text-xs text-red-400">LIVE DEMO</div>
          <div class="text-4xl font-black">Epic Showdown</div>
        </div>
        <button onclick="location.reload()" class="px-5 py-2 text-xs border border-gray-700 rounded-2xl flex items-center gap-x-2 hover:bg-red-950 transition-colors">
          <i class="fas fa-redo"></i> <span>END BATTLE</span>
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        <div class="md:col-span-2 cyber-card rounded-3xl p-6 text-center border border-emerald-400">
          <div class="text-xs mb-2 text-emerald-400">YOUR CHAMPION</div>
          <div class="text-8xl mb-4">🌟🐼</div>
          <div class="font-black text-2xl">Nova Guardian</div>
          <div class="text-sm text-emerald-400">LVL 42 • 47 PWR</div>
          <div class="mt-5 h-2 bg-gray-800 rounded">
            <div class="h-2 bg-emerald-400 w-[92%] rounded"></div>
          </div>
          <div class="text-xs mt-1 text-gray-400">HEALTH 92%</div>
        </div>
        <div class="md:col-span-1 flex justify-center">
          <div class="text-center">
            <div class="text-red-500 text-6xl font-black mb-1">VS</div>
            <div class="text-xs tracking-[4px]">ROUND 3</div>
          </div>
        </div>
        <div class="md:col-span-2 cyber-card rounded-3xl p-6 text-center border border-red-400">
          <div class="text-xs mb-2 text-red-400">OPPONENT</div>
          <div class="text-8xl mb-4">👹🐼</div>
          <div class="font-black text-2xl">Doombringer</div>
          <div class="text-sm text-red-400">LVL 51 • 51 PWR</div>
          <div class="mt-5 h-2 bg-gray-800 rounded">
            <div class="h-2 bg-red-500 w-[67%] rounded"></div>
          </div>
          <div class="text-xs mt-1 text-gray-400">HEALTH 67%</div>
        </div>
      </div>
      <div class="mt-8 cyber-card rounded-3xl p-5 text-sm">
        <div class="flex items-center justify-between text-xs px-2 mb-3">
          <div>BATTLE LOG</div>
          <div class="font-mono text-red-400">LIVE</div>
        </div>
        <div class="space-y-2 text-xs font-mono bg-black/50 p-4 rounded-2xl max-h-48 overflow-auto" id="battle-log">
          <div class="text-emerald-400">Nova Guardian used <span class="font-bold">STELLAR BURST</span> → 28 DMG</div>
          <div>Doombringer countered with <span class="font-bold">SHADOW SLASH</span> → 19 DMG</div>
          <div class="text-emerald-400">Critical hit! Nova used <span class="font-bold">FUSION RAY</span> → 41 DMG</div>
        </div>
      </div>
      <div class="flex justify-center gap-x-3 mt-8">
        <button onclick="simulateBattleAttack(this)" class="px-8 py-3 text-sm bg-red-500 hover:bg-red-600 transition-colors rounded-2xl font-bold flex items-center gap-x-2">
          <span>ATTACK</span> <i class="fas fa-fist-raised"></i>
        </button>
        <button onclick="simulateBattleAttack(this, true)" class="px-8 py-3 text-sm border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black transition-all rounded-2xl font-bold flex items-center gap-x-2">
          <span>SPECIAL</span> <i class="fas fa-magic"></i>
        </button>
      </div>
    </div>
  `;
}

function simulateBattleAttack(element, isSpecial = false) {
  const log = document.getElementById("battle-log");
  if (!log) return;

  const attacks = isSpecial
    ? ["CRITICAL FUSION BEAM", "DIMENSION RIFT", "PANDAS UNITE"]
    : ["BAMBOO SLAM", "PAW STRIKE", "ROAR OF FURY"];
  const attackName = attacks[Math.floor(Math.random() * attacks.length)];
  const dmg = isSpecial ? Math.floor(Math.random() * 28) + 35 : Math.floor(Math.random() * 18) + 14;

  const newLine = document.createElement("div");
  newLine.className = isSpecial ? "text-fuchsia-400" : "text-emerald-400";
  newLine.innerHTML = `You used <span class="font-bold">${attackName}</span> → <span class="font-mono">${String(dmg)} DMG</span>`;
  log.appendChild(newLine);
  log.scrollTop = log.scrollHeight;

  setTimeout(() => {
    const el = document.getElementById("battle-log");
    if (!el) return;
    const enemyAttacks = ["VOID CRUSH", "HELLFIRE ROAR", "DARK PULSE"];
    const enemyAttack = enemyAttacks[Math.floor(Math.random() * enemyAttacks.length)];
    const enemyDmg = Math.floor(Math.random() * 22) + 12;

    const enemyLine = document.createElement("div");
    enemyLine.className = "text-red-400";
    enemyLine.innerHTML = `Doombringer used <span class="font-bold">${enemyAttack}</span> → <span class="font-mono">${String(
      enemyDmg,
    )} DMG</span>`;
    el.appendChild(enemyLine);
    el.scrollTop = el.scrollHeight;

    if (Math.random() > 0.65) {
      setTimeout(() => {
        const b = document.getElementById("battle-log");
        if (b) {
          const winLine = document.createElement("div");
          winLine.className = "text-amber-400 font-bold pt-3 border-t border-gray-800 mt-2";
          winLine.innerHTML = `🏆 VICTORY! You defeated Doombringer! +650 XP`;
          b.appendChild(winLine);
          showToast("Battle won! +650 XP earned", "success");
          gameState.xp += 650;
          if (gameState.xp >= 10000) {
            gameState.level++;
            gameState.xp = gameState.xp % 10000;
            setTimeout(showLevelUp, 1200);
          }
          saveGameState();
          updateDashboard();
        }
      }, 1400);
    }
  }, 1100);

  element.disabled = true;
  setTimeout(() => {
    if (element) element.disabled = false;
  }, 2100);
}

function navigateTo(section) {
  document.querySelectorAll(".section").forEach((s) => s.classList.add("hidden"));
  const target = document.getElementById(`section-${section}`);
  if (target) target.classList.remove("hidden");

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.id === `nav-${section}`) {
      link.classList.add("active");
    }
  });

  if (section === "collection") {
    renderCollection();
  }
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `flex items-center gap-x-3 px-5 py-3.5 rounded-3xl shadow-2xl max-w-xs text-sm border ${
    type === "success"
      ? "bg-emerald-950 border-emerald-700 text-emerald-300"
      : type === "error"
        ? "bg-red-950 border-red-700 text-red-300"
        : "bg-[#1a1f2e] border-gray-700 text-white"
  }`;

  let icon = "fa-check-circle";
  if (type === "error") icon = "fa-exclamation-circle";
  if (type === "info") icon = "fa-info-circle";

  toast.innerHTML = `
    <i class="fas ${icon} text-xl"></i>
    <div>${message}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "all 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3100);
}

function showSettings() {
  const settingsHTML = `
    <div onclick="this.remove()" class="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-5">
      <div onclick="event.stopImmediatePropagation()" class="cyber-card max-w-md w-full rounded-3xl border border-gray-700 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-700 flex justify-between items-center">
          <div class="font-bold text-xl">Master Settings</div>
          <i class="fas fa-times text-xl cursor-pointer" onclick="event.target.closest('.fixed').remove()"></i>
        </div>
        <div class="p-6 space-y-6 text-sm">
          <div>
            <div class="font-semibold mb-3 text-xs tracking-widest text-gray-400">ACCOUNT</div>
            <div class="flex justify-between items-center py-2 border-b border-gray-800">
              <div>Display Name</div>
              <div class="font-mono text-emerald-400">Master_Zero</div>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-800">
              <div>Member Since</div>
              <div class="font-mono">Nov 2024</div>
            </div>
          </div>
          <div>
            <div class="font-semibold mb-3 text-xs tracking-widest text-gray-400">PREFERENCES</div>
            <div class="flex items-center justify-between py-3">
              <div>Enable Fusion Animations</div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked class="sr-only peer">
                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <div class="flex items-center justify-between py-3">
              <div>Sound Effects</div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked class="sr-only peer">
                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <div class="flex items-center justify-between py-3">
              <div>Auto-save Collection</div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked class="sr-only peer">
                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
          <div class="pt-4 border-t border-gray-700 text-xs text-gray-500">
            FusionPanda Master Webapp v4.2.1 • Data stored locally in your browser
          </div>
        </div>
        <div class="px-6 py-4 bg-[#0f1117] flex justify-end gap-x-3">
          <button onclick="event.target.closest('.fixed').remove()" class="px-6 py-2 text-sm rounded-2xl border border-gray-700">CLOSE</button>
          <button onclick="resetAllData(); event.target.closest('.fixed').remove()" class="px-6 py-2 text-sm rounded-2xl bg-red-600 hover:bg-red-700 text-white">RESET ALL DATA</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", settingsHTML);
}

function resetAllData() {
  if (confirm("Are you sure you want to reset ALL progress? This cannot be undone.")) {
    localStorage.removeItem("fusionPandaMaster");
    location.reload();
  }
}

function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (e.metaKey && e.key === "/") {
      e.preventDefault();
      const search = document.getElementById("search-input");
      if (search) {
        navigateTo("collection");
        search.focus();
      }
    }
    if (e.key === "?" && document.activeElement && document.activeElement.tagName === "BODY") {
      e.preventDefault();
      navigateTo("fusion-lab");
    }
  });

  let konami = "";
  const konamiCode = "38384040373937396665";
  document.addEventListener("keydown", (e) => {
    konami += String(e.keyCode);
    if (konami.length > 20) konami = konami.slice(-20);
    if (konami === konamiCode) {
      konami = "";
      showToast("🎉 KONAMI CODE ACTIVATED! +999 XP & Legendary Panda!", "success");
      const legendary = {
        id: `konami-${String(Date.now())}`,
        name: "Quantum Overlord Panda",
        emoji: "👑🐼",
        type: "Mythic Hybrid",
        power: 88,
        rarity: "mythic",
        color: "#f43f5e",
        desc: "The ultimate panda. Achieved only by true masters of the fusion arts.",
        acquired: new Date().toISOString().split("T")[0],
      };
      userPandas.push(legendary);
      gameState.xp += 999;
      if (gameState.xp >= 10000) {
        gameState.level++;
        gameState.xp -= 10000;
      }
      saveGameState();
      updateDashboard();
      renderCollection();
      setTimeout(() => {
        showPandaDetail(userPandas[userPandas.length - 1].id);
      }, 1200);
    }
  });
}

function initializeApp() {
  initTailwind();
  loadGameState();
  document.getElementById("section-dashboard").classList.remove("hidden");
  document.getElementById("nav-dashboard").classList.add("active");
  renderCollection();
  renderBasePandas();
  setTimeout(() => {
    if (!document.hidden) {
      showToast("Pro tip: Use the Konami code ↑↑↓↓←→←→BA for a surprise! 🎮", "info");
    }
  }, 6500);
  initKeyboardShortcuts();
  document.getElementById("fuse-btn").disabled = true;
  console.log("%c[FusionPanda Master] Konami code enabled! Try ↑↑↓↓←→←→BA", "color:#64748b");
  if (!localStorage.getItem("fusionPandaMaster")) {
    setTimeout(() => {
      showToast("Welcome to FusionPanda Master! Start by fusing your first pandas 🐼", "success");
    }, 1400);
  }
}

window.onload = initializeApp;

window.FusionPanda = {
  addPanda: (name) => {
    const newP = { ...basePandas[0], name: name || "Debug Panda", id: `debug-${String(Date.now())}`, rarity: "legendary", power: 55 };
    userPandas.push(newP);
    renderCollection();
    console.log("%c[Panda added]", "color:#00ff9d", newP);
  },
  levelUp: () => {
    gameState.level++;
    showLevelUp();
  },
};
