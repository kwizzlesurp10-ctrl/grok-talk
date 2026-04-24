// Tailwind script
        function initTailwind() {
            document.documentElement.style.setProperty('--accent', '#00ff9d');
            
            tailwind.config = {
                theme: {
                    extend: {
                        fontFamily: {
                            'grotesk': ['Space Grotesk', 'system-ui', 'sans-serif']
                        }
                    }
                }
            };
        }
        if (typeof tailwind !== "undefined") {
            initTailwind();
        }

        // Game State
        let gameState = {
            level: 0,
            xp: 0,
            fusions: 0,
            ritualFusionsCount: 0,
            collectionCount: 1,
            totalPower: 12,
            collection: [],
            recentFusions: []
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
            { id: 8, name: "Crystal Panda", emoji: "💎🐼", type: "Crystal", power: 16, rarity: "rare", color: "#67e8f9", desc: "Crystalline armor protects it from harm. Beautiful but deadly." }
        ];

        // User's unlocked pandas (new users start with one fair starter)
        let userPandas = [
            { ...basePandas[0], id: 'u1', acquired: new Date().toISOString().split('T')[0] }
        ];

        // Current selected for fusion
        let selectedAlpha = null;
        let selectedBeta = null;
        let currentFusionMode = 'basic'; // basic | advanced | ritual

        function saveGameState() {
            localStorage.setItem('fusionPandaMaster', JSON.stringify({
                ...gameState,
                collection: userPandas,
                recentFusions: gameState.recentFusions
            }));
        }

        function loadGameState() {
            const saved = localStorage.getItem('fusionPandaMaster');
            if (saved) {
                const parsed = JSON.parse(saved);
                gameState = { ...gameState, ...parsed };
                if (parsed.collection) userPandas = parsed.collection;
                if (parsed.recentFusions) gameState.recentFusions = parsed.recentFusions;
                if (typeof gameState.ritualFusionsCount !== "number" || gameState.ritualFusionsCount < 0) {
                    gameState.ritualFusionsCount = 0;
                }
            } else {
                gameState.recentFusions = [];
                saveGameState();
            }
            
            // Update UI
            updateDashboard();
            renderCollection();
            renderBasePandas();
            renderRecentFusions();
        }

        function updateDashboard() {
            // Update nav level
            document.getElementById('nav-level').innerText = gameState.level;
            
            // Dashboard values
            document.getElementById('dash-level').innerText = gameState.level;
            document.getElementById('dash-fusions').innerText = gameState.fusions.toLocaleString();
            document.getElementById('dash-collection').innerText = userPandas.length;
            document.getElementById('dash-power').innerText = (gameState.totalPower / 1000).toFixed(1) + 'k';
            
            // XP bar
            const xpPercent = Math.min((gameState.xp / 10000) * 100, 100);
            document.getElementById('dash-xp-bar').style.width = xpPercent + '%';
            document.getElementById('dash-xp').innerText = `${gameState.xp.toLocaleString()} / 10,000`;
            
            // Update collection count in nav
            document.getElementById('collection-count').innerText = userPandas.length;
        }

        function renderRecentFusions() {
            const container = document.getElementById('recent-fusions-list');
            container.innerHTML = '';
            
            if (!gameState.recentFusions || gameState.recentFusions.length === 0) {
                container.innerHTML = `<div class="text-xs text-gray-500 py-4 text-center">No recent fusions yet. Start fusing!</div>`;
                return;
            }
            
            gameState.recentFusions.slice(0, 3).forEach(fusion => {
                const el = document.createElement('div');
                el.className = `flex items-center gap-x-4 p-3 hover:bg-[#1a1f2e] rounded-2xl transition-colors cursor-pointer`;
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
            const container = document.getElementById('base-pandas-grid');
            container.innerHTML = '';
            
            basePandas.forEach(panda => {
                const isUnlocked = userPandas.some(up => up.name === panda.name || (up.type === panda.type && up.rarity === panda.rarity));
                
                const card = document.createElement('div');
                card.className = `panda-card cyber-card rounded-2xl p-3 border border-gray-700 cursor-pointer flex flex-col items-center text-center ${!isUnlocked ? 'opacity-60' : ''}`;
                
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
            // Find if already in collection
            const found = userPandas.find(p => p.name === panda.name);
            if (!found) {
                showToast("You haven't unlocked this panda yet!", "error");
                return;
            }
            
            // Assign to first empty slot
            if (!selectedAlpha) {
                selectPandaForSlot('alpha', found);
            } else if (!selectedBeta) {
                selectPandaForSlot('beta', found);
            } else {
                // Replace alpha
                selectPandaForSlot('alpha', found);
            }
            
            showToast(`Added ${panda.name} to fusion slot`, "success");
        }

        function renderCollection(filteredPandas = null) {
            const container = document.getElementById('collection-grid');
            container.innerHTML = '';
            
            const pandasToShow = filteredPandas || userPandas;
            
            if (pandasToShow.length === 0) {
                container.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400">No pandas found matching your search.</div>`;
                return;
            }
            
            pandasToShow.forEach((panda, index) => {
                const card = document.createElement('div');
                card.className = `panda-card cyber-card rounded-3xl p-4 border border-gray-700 cursor-pointer group`;
                
                const rarityColor = getRarityColor(panda.rarity);
                
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
                            <div onclick="event.stopImmediatePropagation(); showPandaDetail(${index});" 
                                 class="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl inline-block cursor-pointer">
                                <span class="text-emerald-400">DETAILS</span>
                            </div>
                        </div>
                    </div>
                `;
                
                card.onclick = () => showPandaDetail(index);
                container.appendChild(card);
            });
        }

        function getRarityColor(rarity) {
            switch(rarity) {
                case 'common': return '#64748b';
                case 'rare': return '#22d3ee';
                case 'epic': return '#c026ff';
                case 'legendary': return '#fbbf24';
                case 'mythic': return '#f43f5e';
                default: return '#64748b';
            }
        }

        function filterCollection() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const rarityFilter = document.getElementById('filter-rarity').value;
            
            let filtered = userPandas;
            
            if (searchTerm) {
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes(searchTerm) || 
                    p.type.toLowerCase().includes(searchTerm) ||
                    p.desc.toLowerCase().includes(searchTerm)
                );
            }
            
            if (rarityFilter) {
                filtered = filtered.filter(p => p.rarity === rarityFilter);
            }
            
            renderCollection(filtered);
        }

        // ==================== CODEX (BESTIARY) ====================
        let activeCodexTab = "bestiary";

        const CODEX_ACHIEVEMENTS = [
            { id: "first_fusion", title: "First Spark", desc: "Complete your first successful fusion in the lab.", check: (s) => s.fusions >= 1 },
            { id: "fusion_10", title: "Chain Reactor", desc: "Reach 10 total fusions on record.", check: (s) => s.fusions >= 10 },
            { id: "fusion_100", title: "Mass Synthesis", desc: "Reach 100 total fusions.", check: (s) => s.fusions >= 100 },
            { id: "col_5", title: "Keeper of Five", desc: "Hold at least 5 pandas in your collection.", check: (s, c) => c.length >= 5 },
            { id: "col_15", title: "Sanctuary", desc: "Expand your collection to 15+ unique pandas.", check: (s, c) => c.length >= 15 },
            { id: "level_20", title: "Ascension", desc: "Attain level 20 or higher.", check: (s) => s.level >= 20 },
            { id: "level_50", title: "Overclocked", desc: "Attain level 50 or higher.", check: (s) => s.level >= 50 },
            { id: "ritual_once", title: "Ritualist", desc: "Complete at least one Ritual-mode fusion.", check: (s) => (s.ritualFusionsCount || 0) >= 1 },
            { id: "mythic_owner", title: "Mythic Bond", desc: "Own a mythic-rarity panda in your collection.", check: (s, c) => c.some((p) => p.rarity === "mythic") },
            { id: "legendary_trio", title: "Trinity of Legends", desc: "Own 3+ legendary or mythic pandas at once.", check: (s, c) => c.filter((p) => p.rarity === "legendary" || p.rarity === "mythic").length >= 3 },
        ];

        const FUSION_TREE_RECIPES = [
            { a: "Classic Panda", b: "Inferno Panda", result: "Steam Panda", mode: "basic", extra: "Fire + Balanced" },
            { a: "Shadow Panda", b: "Mystic Panda", result: "Void Walker", mode: "basic", extra: "Dark + Arcane" },
            { a: "Golden Fortune", b: "Thunder Panda", result: "Solar Flare", mode: "ritual", extra: "Light + Electric" },
            { a: "Inferno Panda", b: "Mystic Panda", result: "Inferno Mystic", mode: "ritual", extra: "Fire + Arcane" },
            { a: "Frostbite Panda", b: "Golden Fortune", result: "Frost Eternal", mode: "ritual", extra: "Ice + Light" },
            { a: "Thunder Panda", b: "Crystal Panda", result: "Plasma Sovereign", mode: "basic", extra: "Electric + Crystal" },
        ];

        const CATALYSTS = [
            { id: "c1", name: "Neon Stabilizer", icon: "fa-atom", effect: "−5% base fusion XP variance", unlocked: (s) => s.level >= 5 },
            { id: "c2", name: "Bamboo Resonance Core", icon: "fa-seedling", effect: "Balanced + Hybrid outcomes slightly favor higher PWR", unlocked: (s) => s.fusions >= 25 },
            { id: "c3", name: "Ritual Ink", icon: "fa-scroll", effect: "Ritual fusions: +2% crit fusion chance (cosmetic: Protocol aura)", unlocked: (s) => (s.ritualFusionsCount || 0) >= 3 || s.fusions >= 80 },
            { id: "c4", name: "Panda Prismatic Array", icon: "fa-infinity", effect: "Unlocked: displays rare combo hints in the Fusion Tree", unlocked: (s) => s.fusions >= 200 },
        ];

        const CODEX_ALL_ENTRY_NAMES = [
            ...basePandas.map((p) => p.name),
            "Steam Panda",
            "Eclipse Guardian",
            "Solar Flare",
            "Void Walker",
            "Quantum Overlord",
            "Plasma Sovereign",
            "Inferno Mystic",
            "Frost Eternal",
            "Chaos Weaver",
            "Bamboo Titan",
            "Nebula Phantom",
            "Celestial Harmony",
        ];

        function switchCodexTab(tabId) {
            activeCodexTab = tabId;
            const tabs = {
                bestiary: "tab-bestiary",
                achievements: "tab-achievements",
                catalysts: "tab-catalysts",
                "fusion-tree": "tab-fusion-tree",
            };
            const activeClass = "px-6 py-3 text-sm font-bold cursor-pointer border-b-2 border-purple-400 text-purple-400";
            const idleClass = "px-6 py-3 text-sm font-bold cursor-pointer text-gray-400 hover:text-white";
            Object.keys(tabs).forEach((k) => {
                const el = document.getElementById(tabs[k]);
                if (el) el.className = k === tabId ? activeClass : idleClass;
            });
            document.querySelectorAll(".codex-subpanel").forEach((p) => p.classList.add("hidden"));
            const panel = document.getElementById("codex-panel-" + tabId);
            if (panel) panel.classList.remove("hidden");
            if (tabId === "bestiary") {
                filterCodex();
                updateRecentCodexStrip();
                updateCodexProgressBar();
            } else if (tabId === "achievements") {
                renderAchievements();
            } else if (tabId === "catalysts") {
                renderCatalysts();
            } else if (tabId === "fusion-tree") {
                renderFusionTree();
            }
        }

        function updateCodexProgressBar() {
            const total = Math.max(1, CODEX_ALL_ENTRY_NAMES.length);
            const found = new Set(
                userPandas.map((p) => p.name).filter((n) => CODEX_ALL_ENTRY_NAMES.includes(n)),
            );
            const pct = Math.round((found.size / total) * 100);
            const t = document.getElementById("codex-progress-text");
            const b = document.getElementById("codex-progress-bar");
            if (t) t.textContent = pct + "%";
            if (b) b.style.width = Math.min(100, pct) + "%";
        }

        function updateRecentCodexStrip() {
            const el = document.getElementById("recent-codex");
            if (!el) return;
            el.innerHTML = "";
            const names = new Set();
            const recent = [...userPandas].reverse().filter((p) => {
                if (names.has(p.name)) return false;
                names.add(p.name);
                return true;
            }).slice(0, 6);
            if (recent.length === 0) {
                el.innerHTML = "<div class=\"text-xs text-gray-500 py-2\">No discoveries yet — fuse in the lab!</div>";
                return;
            }
            recent.forEach((p) => {
                const chip = document.createElement("button");
                chip.type = "button";
                chip.className = "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl border border-gray-700 bg-[#1a1f2e] hover:border-purple-400/50 text-left";
                chip.innerHTML = "<span class=\"text-2xl\">" + p.emoji + "</span><span class=\"text-xs font-semibold max-w-[7rem] truncate\">" + p.name + "</span>";
                el.appendChild(chip);
            });
        }

        function renderAchievements() {
            const root = document.getElementById("achievements-grid");
            if (!root) return;
            root.innerHTML = "";
            const unlockedN = CODEX_ACHIEVEMENTS.filter((a) => a.check(gameState, userPandas)).length;
            CODEX_ACHIEVEMENTS.forEach((a) => {
                const ok = a.check(gameState, userPandas);
                const card = document.createElement("div");
                card.className = "cyber-card rounded-2xl p-4 border " + (ok ? "border-emerald-500/60 bg-emerald-950/20" : "border-gray-700 opacity-80");
                card.innerHTML = "\n                    <div class=\"flex items-start gap-3\">\n                        <div class=\"text-2xl w-10 text-center\">" + (ok ? "🏆" : "🔒") + "</div>\n                        <div class=\"min-w-0 flex-1\">\n                            <div class=\"font-bold text-sm " + (ok ? "text-emerald-300" : "text-gray-300") + "\">" + a.title + "</div>\n                            <div class=\"text-xs text-gray-400 mt-1\">" + a.desc + "</div>\n                            <div class=\"text-[10px] mt-2 font-mono " + (ok ? "text-emerald-400" : "text-gray-600") + "\">" + (ok ? "UNLOCKED" : "IN PROGRESS") + "</div>\n                        </div>\n                    </div>\n                ";
                root.appendChild(card);
            });
            const h = document.querySelector("#codex-panel-achievements .section-header");
            if (h && h.parentElement) {
                const sub = h.parentElement.querySelector("p.text-gray-400");
                if (sub) sub.textContent = unlockedN + " / " + CODEX_ACHIEVEMENTS.length + " unlocked • Milestones across your fusion journey";
            }
        }

        function renderCatalysts() {
            const root = document.getElementById("catalysts-grid");
            if (!root) return;
            root.innerHTML = "";
            CATALYSTS.forEach((c) => {
                const on = c.unlocked(gameState);
                const row = document.createElement("div");
                row.className = "cyber-card rounded-2xl p-5 border " + (on ? "border-cyan-500/40" : "border-gray-800");
                row.innerHTML = "\n                    <div class=\"flex gap-4\">\n                        <div class=\"w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 flex items-center justify-center flex-shrink-0\">\n                            <i class=\"fas " + c.icon + " text-xl " + (on ? "text-cyan-300" : "text-gray-600") + "\"></i>\n                        </div>\n                        <div class=\"min-w-0 flex-1\">\n                            <div class=\"font-bold\">" + c.name + "</div>\n                            <div class=\"text-sm text-gray-400 mt-1\">" + c.effect + "</div>\n                            <div class=\"text-xs mt-2 " + (on ? "text-emerald-400" : "text-amber-500/80") + "\">" + (on ? "Active — your Protocol recognizes this catalyst." : "Locked — keep fusing to awaken.") + "</div>\n                        </div>\n                    </div>\n                ";
                root.appendChild(row);
            });
        }

        function collectionHasPandaName(name) {
            return userPandas.some((p) => p.name === name);
        }

        function renderFusionTree() {
            const root = document.getElementById("fusion-tree-root");
            if (!root) return;
            root.innerHTML = "";
            FUSION_TREE_RECIPES.forEach((r) => {
                const haveA = collectionHasPandaName(r.a);
                const haveB = collectionHasPandaName(r.b);
                const haveR = collectionHasPandaName(r.result);
                const row = document.createElement("div");
                row.className = "cyber-card rounded-2xl p-4 border border-gray-700 " + (haveR ? "ring-1 ring-emerald-500/30" : "");
                const dim = (ok) => (ok ? "" : "opacity-50 grayscale");
                row.innerHTML = "\n                    <div class=\"flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm\">\n                        <div class=\"text-center " + dim(haveA) + "\">\n                            <div class=\"text-3xl\">🐼</div>\n                            <div class=\"text-xs font-mono text-gray-400 max-w-[8rem] truncate\">" + r.a + "</div>\n                        </div>\n                        <div class=\"text-fuchsia-400 font-mono text-xs\">+</div>\n                        <div class=\"text-center " + dim(haveB) + "\">\n                            <div class=\"text-3xl\">🐼</div>\n                            <div class=\"text-xs font-mono text-gray-400 max-w-[8rem] truncate\">" + r.b + "</div>\n                        </div>\n                        <div class=\"text-cyan-400 font-mono text-sm\">&rarr;</div>\n                        <div class=\"text-center " + dim(haveR) + "\">\n                            <div class=\"text-3xl\">✨</div>\n                            <div class=\"text-xs font-bold " + (haveR ? "text-emerald-400" : "text-gray-500") + " max-w-[9rem]\">" + r.result + "</div>\n                        </div>\n                    </div>\n                    <div class=\"text-center text-[10px] text-gray-500 mt-2 font-mono\">" + r.mode.toUpperCase() + " &bull; " + (r.extra || "") + " &bull; parents: " + (haveA && haveB ? "ready" : "need both in collection to fuse") + "</div>\n                ";
                root.appendChild(row);
            });
        }

        function renderCodex(filteredEntries = null) {
            const container = document.getElementById('codex-grid');
            if (!container) return;
            container.innerHTML = '';
            
            // Base codex entries (all known species)
            const codexData = [
                ...basePandas,
                // Legendary Hybrids
                { id: 'leg1', name: "Steam Panda", emoji: "🌫️🔥", type: "Hybrid", power: 31, rarity: "epic", color: "#64748b", desc: "Born from the eternal love between Fire and Ice during the Great Shattering. Creates the Steam Valleys where all elements coexist peacefully." },
                { id: 'leg2', name: "Eclipse Guardian", emoji: "🌑☀️", type: "Hybrid", power: 45, rarity: "legendary", color: "#6366f1", desc: "The first successful Dark + Light fusion. It now guards the Veil Between Worlds and appears only during rare celestial alignments." },
                { id: 'leg3', name: "Solar Flare", emoji: "☀️⚡", type: "Hybrid", power: 42, rarity: "mythic", color: "#f59e0b", desc: "Created in a desperate Ritual during the Second Fracture. It is both the ultimate weapon and a warning of what happens when the Protocol is pushed too far." },
                { id: 'leg4', name: "Void Walker", emoji: "🕳️🐼", type: "Hybrid", power: 38, rarity: "legendary", color: "#4f46e5", desc: "The only known Dark + Mystic fusion. It walked through the code of the Master Protocol itself and now exists partially outside of reality." },
                { id: 'leg5', name: "Quantum Overlord", emoji: "👑🐼", type: "Mythic", power: 88, rarity: "mythic", color: "#f43f5e", desc: "The First Panda. The being who performed the very first fusion. Said to have become one with the Master Protocol itself." },
                // Expanded Lore Entries
                { id: 'leg6', name: "Plasma Sovereign", emoji: "⚡💎", type: "Hybrid", power: 51, rarity: "legendary", color: "#eab308", desc: "Electric + Crystal fusion born during the Lightning Eclipse. Commands storms of pure crystal energy that can rewrite local reality." },
                { id: 'leg7', name: "Inferno Mystic", emoji: "🔥🔮", type: "Hybrid", power: 47, rarity: "epic", color: "#f97316", desc: "Arcane + Fire fusion. The living embodiment of the first spell ever cast by a panda during the Age of Whispering Flames." },
                { id: 'leg8', name: "Frost Eternal", emoji: "❄️🌌", type: "Hybrid", power: 39, rarity: "legendary", color: "#67e8f9", desc: "Ice + Light fusion that froze time itself during the longest winter in recorded panda history. Still watches over the frozen peaks." },
                { id: 'leg9', name: "Chaos Weaver", emoji: "🌀🐼", type: "Hybrid", power: 62, rarity: "mythic", color: "#c026ff", desc: "The only successful 3-element fusion (Dark + Arcane + Electric). It weaves the threads of fate and can see possible futures." },
                { id: 'leg10', name: "Bamboo Titan", emoji: "🌿🐼", type: "Balanced", power: 55, rarity: "legendary", color: "#4ade80", desc: "The ancient guardian of the Eternal Grove. Said to be the original form of the First Panda before the first fusion ever occurred." },
                { id: 'leg11', name: "Nebula Phantom", emoji: "🌌🕳️", type: "Hybrid", power: 58, rarity: "mythic", color: "#6366f1", desc: "Dark + Crystal fusion that exists in multiple dimensions simultaneously. It is rarely seen in our reality but leaves trails of starlight." },
                { id: 'leg12', name: "Celestial Harmony", emoji: "✨🌈", type: "Hybrid", power: 49, rarity: "legendary", color: "#fbbf24", desc: "The ultimate Light + Electric + Arcane fusion. It sings the song of creation and can calm even the most unstable Ritual fusions." }
            ];
            
            const entriesToShow = filteredEntries || codexData;
            document.getElementById('codex-count').innerText = entriesToShow.length;
            
            entriesToShow.forEach((entry, index) => {
                const isUnlocked = userPandas.some(p => p.name === entry.name || (p.type === entry.type && p.rarity === entry.rarity));
                
                const card = document.createElement('div');
                card.className = `panda-card cyber-card rounded-3xl p-5 border border-gray-700 cursor-pointer group ${!isUnlocked ? 'opacity-75 grayscale-[0.3]' : ''}`;
                
                const rarityColor = getRarityColor(entry.rarity);
                
                card.innerHTML = `
                    <div class="flex justify-between items-start mb-3">
                        <div class="text-6xl transition-transform group-hover:scale-110">${entry.emoji}</div>
                        <div class="px-3 py-1 text-xs font-bold rounded-full text-center" style="background: ${rarityColor}25; color: ${rarityColor}">
                            ${entry.rarity.toUpperCase()}
                        </div>
                    </div>
                    
                    <div class="font-black text-xl mb-1">${entry.name}</div>
                    <div class="flex items-center gap-x-2 mb-3">
                        <span class="px-2.5 py-px text-xs rounded" style="background: ${entry.color}25; color: ${entry.color}">${entry.type}</span>
                        <span class="text-xs text-emerald-400 font-mono">${entry.power} PWR</span>
                    </div>
                    
                    <div class="text-xs text-gray-400 line-clamp-3 mb-4">
                        ${entry.desc.substring(0, 120)}${entry.desc.length > 120 ? '...' : ''}
                    </div>
                    
                    <div class="flex justify-between items-center text-xs">
                        <div class="${isUnlocked ? 'text-emerald-400' : 'text-gray-500'}">
                            <i class="fas ${isUnlocked ? 'fa-check-circle' : 'fa-lock'} mr-1"></i>
                            ${isUnlocked ? 'Discovered' : 'Locked'}
                        </div>
                        <div onclick="event.stopImmediatePropagation(); showCodexDetail(${index}, ${JSON.stringify(entry).replace(/"/g, '&quot;')});" 
                             class="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                            READ LORE
                        </div>
                    </div>
                `;
                
                card.onclick = () => showCodexDetail(index, entry);
                container.appendChild(card);
            });
            updateRecentCodexStrip();
            updateCodexProgressBar();
        }

        function filterCodex() {
            const searchTerm = document.getElementById('codex-search').value.toLowerCase();
            const typeFilter = document.getElementById('codex-filter').value;
            
            const codexData = [
                ...basePandas,
                { id: 'leg1', name: "Steam Panda", emoji: "🌫️🔥", type: "Hybrid", power: 31, rarity: "epic", color: "#64748b", desc: "Born from the eternal love between Fire and Ice during the Great Shattering." },
                { id: 'leg2', name: "Eclipse Guardian", emoji: "🌑☀️", type: "Hybrid", power: 45, rarity: "legendary", color: "#6366f1", desc: "The first successful Dark + Light fusion. Guardian of the Veil Between Worlds." },
                { id: 'leg3', name: "Solar Flare", emoji: "☀️⚡", type: "Hybrid", power: 42, rarity: "mythic", color: "#f59e0b", desc: "Born in a desperate Ritual during the Second Fracture." },
                { id: 'leg4', name: "Void Walker", emoji: "🕳️🐼", type: "Hybrid", power: 38, rarity: "legendary", color: "#4f46e5", desc: "The only known Dark + Mystic fusion that walked through the Master Protocol." },
                { id: 'leg5', name: "Quantum Overlord", emoji: "👑🐼", type: "Mythic", power: 88, rarity: "mythic", color: "#f43f5e", desc: "The First Panda who performed the very first fusion and became one with the Protocol." },
                { id: 'leg6', name: "Plasma Sovereign", emoji: "⚡💎", type: "Hybrid", power: 51, rarity: "legendary", color: "#eab308", desc: "Electric + Crystal fusion born during the Lightning Eclipse." },
                { id: 'leg7', name: "Inferno Mystic", emoji: "🔥🔮", type: "Hybrid", power: 47, rarity: "epic", color: "#f97316", desc: "Arcane + Fire fusion. Embodiment of the first spell ever cast." },
                { id: 'leg8', name: "Frost Eternal", emoji: "❄️🌌", type: "Hybrid", power: 39, rarity: "legendary", color: "#67e8f9", desc: "Ice + Light fusion that froze time during the longest winter." },
                { id: 'leg9', name: "Chaos Weaver", emoji: "🌀🐼", type: "Hybrid", power: 62, rarity: "mythic", color: "#c026ff", desc: "The only successful 3-element fusion. Weaves the threads of fate." },
                { id: 'leg10', name: "Bamboo Titan", emoji: "🌿🐼", type: "Balanced", power: 55, rarity: "legendary", color: "#4ade80", desc: "Ancient guardian of the Eternal Grove and original form of the First Panda." },
                { id: 'leg11', name: "Nebula Phantom", emoji: "🌌🕳️", type: "Hybrid", power: 58, rarity: "mythic", color: "#6366f1", desc: "Dark + Crystal fusion that exists in multiple dimensions." },
                { id: 'leg12', name: "Celestial Harmony", emoji: "✨🌈", type: "Hybrid", power: 49, rarity: "legendary", color: "#fbbf24", desc: "Ultimate Light + Electric + Arcane fusion that sings the song of creation." }
            ];
            
            let filtered = codexData;
            
            if (searchTerm) {
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes(searchTerm) || 
                    p.type.toLowerCase().includes(searchTerm) ||
                    p.desc.toLowerCase().includes(searchTerm)
                );
            }
            
            if (typeFilter) {
                filtered = filtered.filter(p => p.type === typeFilter);
            }
            
            renderCodex(filtered);
        }

        function showCodexDetail(index, entry) {
            const modalHTML = `
                <div onclick="this.remove()" class="fixed inset-0 bg-black/90 z-[130] flex items-center justify-center p-4">
                    <div onclick="event.stopImmediatePropagation()" class="cyber-card w-full max-w-2xl rounded-3xl overflow-hidden border border-purple-400/50">
                        <div class="px-8 pt-8 pb-6 relative bg-gradient-to-b from-[#0f1117] to-transparent">
                            <button onclick="event.target.closest('.fixed').remove()" class="absolute top-6 right-6 text-gray-400 hover:text-white text-2xl">×</button>
                            
                            <div class="flex justify-center mb-4">
                                <div class="text-[140px]">${entry.emoji}</div>
                            </div>
                            
                            <div class="text-center">
                                <div class="inline-block px-5 py-1 rounded-full text-sm font-extrabold tracking-widest mb-3" 
                                     style="background: ${getRarityColor(entry.rarity)}30; color: ${getRarityColor(entry.rarity)}">
                                    ${entry.rarity.toUpperCase()} • ${entry.type}
                                </div>
                                
                                <div class="text-4xl font-black mb-2">${entry.name}</div>
                                <div class="text-2xl text-emerald-400 font-mono">${entry.power} POWER</div>
                            </div>
                        </div>
                        
                        <div class="px-8 pb-8">
                            <div class="text-sm text-gray-300 leading-relaxed mb-6">
                                ${entry.desc}
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4 text-xs">
                                <div class="bg-[#1a1f2e] rounded-2xl p-4">
                                    <div class="text-purple-400 font-bold mb-1">ORIGIN</div>
                                    <div>The Great Shattering • Era of the First Masters</div>
                                </div>
                                <div class="bg-[#1a1f2e] rounded-2xl p-4">
                                    <div class="text-purple-400 font-bold mb-1">KNOWN FOR</div>
                                    <div>${entry.type === 'Hybrid' ? 'Legendary fusion synergy' : 'Foundational species of the Protocol'}</div>
                                </div>
                            </div>
                            
                            <div class="mt-6 text-center">
                                <button onclick="event.target.closest('.fixed').remove(); navigateTo('fusion-lab');" 
                                        class="px-8 py-3 rounded-2xl border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-all text-sm font-bold">
                                    FUSE WITH THIS SPECIES
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        function showPandaDetail(index) {
            const panda = userPandas[index];
            const modalHTML = `
                <div onclick="this.remove()" class="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4">
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
                            
                            <div class="mt-6 text-sm text-gray-300 leading-relaxed">
                                ${panda.desc}
                            </div>
                            
                            <div class="mt-6 text-xs flex items-center justify-between text-gray-500">
                                <div>Acquired: <span class="font-mono">${panda.acquired || 'Unknown'}</span></div>
                                <div class="flex items-center gap-x-1">
                                    <i class="fas fa-star text-amber-400"></i>
                                    <span>Fusion Master</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="px-8 py-5 border-t border-gray-700 bg-[#0f1117] flex gap-3">
                            <button onclick="event.target.closest('.fixed').remove(); quickSelectPandaFromDetail(${index});" 
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
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        function quickSelectPandaFromDetail(index) {
            const panda = userPandas[index];
            // Close detail modal first
            const detailModal = document.querySelector('.fixed.inset-0.bg-black\\/80');
            if (detailModal) detailModal.remove();
            
            // Select for fusion
            if (!selectedAlpha) {
                selectPandaForSlot('alpha', panda);
            } else if (!selectedBeta) {
                selectPandaForSlot('beta', panda);
            } else {
                selectPandaForSlot('alpha', panda);
            }
            
            navigateTo('fusion-lab');
            showToast(`Loaded ${panda.name} into fusion chamber`, "success");
        }

        function openPandaSelector(slot) {
            const modal = document.getElementById('panda-selector-modal');
            const grid = document.getElementById('selector-grid');
            grid.innerHTML = '';
            
            userPandas.forEach((panda, idx) => {
                const card = document.createElement('div');
                card.className = `panda-card cyber-card rounded-2xl p-4 border border-gray-700 cursor-pointer hover:border-emerald-400 flex flex-col`;
                
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
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closePandaSelector() {
            const modal = document.getElementById('panda-selector-modal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        function selectPandaForSlot(slot, panda) {
            const slotEl = document.getElementById(`slot-${slot}`);
            
            if (slot === 'alpha') selectedAlpha = panda;
            else selectedBeta = panda;
            
            // Update slot UI
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
            
            slotEl.classList.add('active', 'border-solid');
            slotEl.style.borderColor = panda.color;
            
            // Enable fuse button if both selected
            updateFuseButton();
            updateEnergyCost();
        }

        function clearSlot(slot) {
            const slotEl = document.getElementById(`slot-${slot}`);
            
            if (slot === 'alpha') selectedAlpha = null;
            else selectedBeta = null;
            
            slotEl.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-plus text-4xl text-gray-600 mb-3"></i>
                    <div class="font-medium text-gray-400">Select Panda ${slot === 'alpha' ? 'A' : 'B'}</div>
                    <div class="text-xs text-gray-500 mt-1">Click to choose from collection</div>
                </div>
            `;
            
            slotEl.classList.remove('active');
            slotEl.style.borderColor = '';
            
            updateFuseButton();
            updateEnergyCost();
        }

        function updateFuseButton() {
            const btn = document.getElementById('fuse-btn');
            btn.disabled = !(selectedAlpha && selectedBeta);
            
            if (selectedAlpha && selectedBeta) {
                btn.classList.add('fusion-glow');
            } else {
                btn.classList.remove('fusion-glow');
            }
        }

        function setFusionMode(mode) {
            currentFusionMode = mode;
            
            // Update UI buttons
            document.querySelectorAll('[id^="mode-"]').forEach(el => {
                el.classList.remove('bg-emerald-500', 'text-black', 'active-mode');
                el.classList.add('bg-[#1a1f2e]', 'border', 'border-white/20');
                
                if (el.id === `mode-${mode}`) {
                    el.classList.remove('bg-[#1a1f2e]', 'border-white/20');
                    if (mode === 'basic') {
                        el.classList.add('bg-emerald-500', 'text-black');
                    } else if (mode === 'advanced') {
                        el.classList.add('bg-fuchsia-500', 'text-black');
                    } else if (mode === 'ritual') {
                        el.classList.add('bg-amber-500', 'text-black');
                    }
                }
            });
            
            // Update energy cost display
            updateEnergyCost();
        }

        function updateEnergyCost() {
            const costEl = document.getElementById('energy-cost');
            if (!costEl || !selectedAlpha || !selectedBeta) {
                if (costEl) costEl.innerText = '250 EP';
                return;
            }
            
            let baseCost = 250;
            const powerAvg = (selectedAlpha.power + selectedBeta.power) / 2;
            
            if (currentFusionMode === 'advanced') baseCost = Math.floor(baseCost * 1.6);
            if (currentFusionMode === 'ritual') baseCost = Math.floor(baseCost * 2.8);
            
            // Scale with power
            const finalCost = Math.floor(baseCost + (powerAvg * 1.8));
            costEl.innerText = `${finalCost} EP`;
            costEl.style.color = currentFusionMode === 'ritual' ? '#fbbf24' : '#10b981';
        }

        function performFusion() {
            if (!selectedAlpha || !selectedBeta) return;
            
            const btn = document.getElementById('fuse-btn');
            btn.disabled = true;
            btn.innerHTML = `<span>FUSING...</span> <i class="fas fa-spinner fa-spin ml-2"></i>`;
            
            // Simulate fusion delay (longer for ritual)
            const delay = currentFusionMode === 'ritual' ? 2450 : 1450;
            
            setTimeout(() => {
                const newPanda = createFusionResult(selectedAlpha, selectedBeta, currentFusionMode);
                
                // Show result modal
                showFusionResult(newPanda);
                
                // Reset slots
                resetFusionSlots();
                
                // Update stats with mode bonuses
                gameState.fusions++;
                if (currentFusionMode === "ritual") {
                    gameState.ritualFusionsCount = (gameState.ritualFusionsCount || 0) + 1;
                }
                let xpGain = Math.floor(Math.random() * 120) + 85;
                if (currentFusionMode === 'advanced') xpGain = Math.floor(xpGain * 1.4);
                if (currentFusionMode === 'ritual') xpGain = Math.floor(xpGain * 2.1);
                gameState.xp += xpGain;
                
                // Level up check
                if (gameState.xp >= 10000) {
                    gameState.level++;
                    gameState.xp = gameState.xp - 10000;
                    showLevelUp();
                }
                
                // Add to recent
                gameState.recentFusions.unshift({
                    name: newPanda.name,
                    emoji: newPanda.emoji,
                    power: newPanda.power,
                    time: "just now"
                });
                
                if (gameState.recentFusions.length > 5) gameState.recentFusions.pop();
                
                // Save
                saveGameState();
                updateDashboard();
                renderRecentFusions();
                
                // Re-enable button
                btn.innerHTML = `<span>FUSE</span> <i class="fas fa-bolt"></i>`;
                btn.disabled = true;
                
            }, delay);
        }

        function createFusionResult(pandaA, pandaB, mode = 'basic') {
            const types = [pandaA.type, pandaB.type];
            let hybridName = '';
            
            // === ADVANCED SYNERGY SYSTEM ===
            let synergyBonus = 0;
            let synergyName = '';
            let isCritical = false;
            
            // Elemental synergies
            if (types.includes('Fire') && types.includes('Ice')) {
                synergyName = 'Steam';
                synergyBonus = 25;
            } else if (types.includes('Dark') && types.includes('Light')) {
                synergyName = 'Eclipse';
                synergyBonus = 22;
            } else if (types.includes('Electric') && types.includes('Crystal')) {
                synergyName = 'Plasma';
                synergyBonus = 28;
            } else if (types.includes('Arcane') && types.includes('Fire')) {
                synergyName = 'Inferno Mystic';
                synergyBonus = 20;
            } else if (pandaA.type === pandaB.type && pandaA.type !== 'Hybrid') {
                synergyName = 'Pure';
                synergyBonus = 15; // Same type bonus
            } else if (['Fire', 'Ice', 'Electric', 'Dark'].includes(pandaA.type) && 
                       ['Ice', 'Fire', 'Crystal', 'Light'].includes(pandaB.type)) {
                synergyBonus = 12; // Opposites attract
            }
            
            // Generate name
            if (synergyName) {
                hybridName = synergyName;
            } else {
                const prefixes = ['Ultra', 'Mega', 'Neo', 'Quantum', 'Astral', 'Primal', 'Void', 'Nova', 'Eternal', 'Chaos'];
                hybridName = prefixes[Math.floor(Math.random() * prefixes.length)];
            }
            
            const fullName = `${hybridName} ${pandaA.name.split(' ').pop() || 'Panda'}`;
            
            // === POWER CALCULATION (Advanced Mechanics) ===
            let basePower = Math.floor((pandaA.power + pandaB.power) / 2);
            let bonus = Math.floor(Math.random() * 18) + 14;
            
            // Mode multipliers
            if (mode === 'advanced') {
                bonus += 22;
                basePower = Math.floor(basePower * 1.18);
            } else if (mode === 'ritual') {
                bonus += 48;
                basePower = Math.floor(basePower * 1.35);
            }
            
            // Apply synergy
            const finalPower = Math.floor(basePower + bonus + (synergyBonus * 0.8));
            
            // === RARITY & CRITICAL SYSTEM ===
            let rarity = 'epic';
            let rand = Math.random();
            
            // Mode-based rarity chances
            if (mode === 'ritual') {
                if (rand > 0.72) rarity = 'mythic';
                else if (rand > 0.38) rarity = 'legendary';
                else rarity = 'epic';
            } else if (mode === 'advanced') {
                if (rand > 0.91) rarity = 'mythic';
                else if (rand > 0.58) rarity = 'legendary';
                else if (rand > 0.22) rarity = 'epic';
                else rarity = 'rare';
            } else {
                if (rand > 0.88) rarity = 'mythic';
                else if (rand > 0.65) rarity = 'legendary';
                else if (rand > 0.35) rarity = 'epic';
                else rarity = 'rare';
            }
            
            // Critical Fusion chance (extra visual + power)
            if (Math.random() < 0.18 || (mode === 'ritual' && Math.random() < 0.35)) {
                isCritical = true;
                rarity = (rarity === 'rare') ? 'epic' : (rarity === 'epic' ? 'legendary' : 'mythic');
            }
            
            // === EMOJI & TYPE ===
            let emoji = '🐼';
            if (pandaA.emoji.includes('🔥') || pandaB.emoji.includes('🔥')) emoji = '🌋';
            else if (pandaA.emoji.includes('❄️') || pandaB.emoji.includes('❄️')) emoji = '🌨️';
            else if (pandaA.emoji.includes('⚡') || pandaB.emoji.includes('⚡')) emoji = '⚡';
            else if (pandaA.emoji.includes('🌑') || pandaB.emoji.includes('🌑')) emoji = '🌌';
            else if (pandaA.emoji.includes('✨') || pandaB.emoji.includes('✨')) emoji = '🌟';
            else emoji = pandaA.emoji + (pandaB.emoji.includes('🐼') ? '' : pandaB.emoji);
            
            let newType = 'Hybrid';
            if (synergyName) newType = synergyName;
            else if (types[0] !== types[1]) newType = `${types[0]}-${types[1]}`;
            
            // Final panda object
            const newPanda = {
                id: 'f' + Date.now(),
                name: fullName,
                emoji: emoji,
                type: newType,
                power: finalPower,
                rarity: rarity,
                color: getRarityColor(rarity),
                desc: `Advanced ${mode} fusion of ${pandaA.name} and ${pandaB.name}. ${synergyName ? 'Powerful ' + synergyName + ' synergy detected!' : ''} ${isCritical ? 'CRITICAL FUSION!' : ''}`,
                acquired: new Date().toISOString().split('T')[0],
                isCritical: isCritical,
                fusionMode: mode
            };
            
            // Add to collection
            const exists = userPandas.some(p => p.name === newPanda.name);
            if (!exists) {
                userPandas.push(newPanda);
                gameState.collectionCount = userPandas.length;
            }
            
            // Store critical flag for modal
            window.lastFusionWasCritical = isCritical;
            
            return newPanda;
        }

        function showFusionResult(newPanda) {
            const modal = document.getElementById('fusion-result-modal');
            
            document.getElementById('fusion-result-emoji').innerHTML = newPanda.emoji;
            document.getElementById('fusion-result-name').innerText = newPanda.name;
            document.getElementById('fusion-result-type').innerText = newPanda.type.toUpperCase();
            document.getElementById('fusion-result-power').innerText = newPanda.power;
            
            const rarityEl = document.getElementById('fusion-result-rarity');
            const rarityText = document.getElementById('fusion-result-rarity-text');
            const rarityColor = getRarityColor(newPanda.rarity);
            
            rarityEl.style.background = `${rarityColor}30`;
            rarityEl.style.color = rarityColor;
            rarityEl.innerText = newPanda.rarity.toUpperCase();
            rarityText.innerText = newPanda.rarity.toUpperCase();
            rarityText.style.color = rarityColor;
            
            // Dynamic bonus based on mode & critical
            let bonus = Math.floor(Math.random() * 25) + 12;
            if (newPanda.fusionMode === 'advanced') bonus += 18;
            if (newPanda.fusionMode === 'ritual') bonus += 35;
            if (newPanda.isCritical) bonus += 45;
            document.getElementById('fusion-result-bonus').innerText = `+${bonus}%`;
            
            // Critical fusion visual flair
            const emojiEl = document.getElementById('fusion-result-emoji');
            if (newPanda.isCritical) {
                emojiEl.style.animation = 'fusion-pulse 0.6s infinite';
                emojiEl.style.filter = 'drop-shadow(0 0 40px #fbbf24) drop-shadow(0 0 80px #f43f5e)';
                setTimeout(() => {
                    if (emojiEl) emojiEl.style.animation = '';
                }, 4200);
            } else {
                emojiEl.style.filter = '';
            }
            
            // Confetti explosion (more intense on critical/ritual)
            const particleCount = (newPanda.isCritical || newPanda.fusionMode === 'ritual') ? 110 : 65;
            createConfetti(particleCount);
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Store current panda for evolve button
            window.currentFusionResult = newPanda;
            
            // Show evolve button for powerful results
            const evolveBtn = document.getElementById('evolve-btn');
            if (evolveBtn) {
                if (newPanda.power > 55 || ['legendary', 'mythic'].includes(newPanda.rarity)) {
                    evolveBtn.classList.remove('hidden');
                } else {
                    evolveBtn.classList.add('hidden');
                }
            }
        }

        function createConfetti(count = 65) {
            const colors = ['#00ff9d', '#ff00aa', '#00f0ff', '#fbbf24', '#f43f5e'];
            const container = document.getElementById('fusion-result-modal');
            
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = Math.random() * 100 + '%';
                    particle.style.top = '-20px';
                    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                    particle.style.width = (Math.random() * 9 + 5) + 'px';
                    particle.style.height = particle.style.width;
                    particle.style.opacity = Math.random() * 0.8 + 0.4;
                    
                    container.appendChild(particle);
                    
                    const fallDuration = Math.random() * 2800 + 1900;
                    const xDrift = (Math.random() - 0.5) * 180;
                    
                    particle.animate([
                        { 
                            transform: `translateY(0) rotate(0deg)`,
                            opacity: particle.style.opacity 
                        },
                        { 
                            transform: `translateY(520px) translateX(${xDrift}px) rotate(${Math.random() * 620 - 180}deg)`,
                            opacity: 0 
                        }
                    ], {
                        duration: fallDuration,
                        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
                    }).onfinish = () => particle.remove();
                }, i * 0.8);
            }
        }

        function addToCollectionAndClose() {
            const modal = document.getElementById('fusion-result-modal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
            
            // Already added in createFusionResult
            renderCollection();
            updateDashboard();
            
            showToast("Panda added to your collection! 🐼", "success");
            
            // Bonus: small XP
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
            const modal = document.getElementById('fusion-result-modal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
            
            // Hide evolve button
            const evolveBtn = document.getElementById('evolve-btn');
            if (evolveBtn) evolveBtn.classList.add('hidden');
            
            // Clear any remaining particles
            const particles = modal.querySelectorAll('.particle');
            particles.forEach(p => p.remove());
        }

        function evolveFusionResult() {
            const current = window.currentFusionResult;
            if (!current) return;
            
            const modal = document.getElementById('fusion-result-modal');
            
            // Evolve: boost power + upgrade rarity
            current.power = Math.floor(current.power * 1.28) + 12;
            if (current.rarity === 'rare') current.rarity = 'epic';
            else if (current.rarity === 'epic') current.rarity = 'legendary';
            else if (current.rarity === 'legendary') current.rarity = 'mythic';
            
            current.name = 'Evolved ' + current.name;
            current.desc = 'Evolved form of the original fusion. Even more powerful!';
            current.emoji = current.emoji + '✨';
            
            // Update modal live
            document.getElementById('fusion-result-name').innerText = current.name;
            document.getElementById('fusion-result-power').innerText = current.power;
            document.getElementById('fusion-result-emoji').innerHTML = current.emoji;
            
            const rarityColor = getRarityColor(current.rarity);
            document.getElementById('fusion-result-rarity').innerText = current.rarity.toUpperCase();
            document.getElementById('fusion-result-rarity').style.background = `${rarityColor}30`;
            document.getElementById('fusion-result-rarity').style.color = rarityColor;
            document.getElementById('fusion-result-rarity-text').innerText = current.rarity.toUpperCase();
            document.getElementById('fusion-result-rarity-text').style.color = rarityColor;
            
            // Hide evolve button after use
            document.getElementById('evolve-btn').classList.add('hidden');
            
            // Extra confetti for evolution
            createConfetti(45);
            
            showToast("Panda evolved to new heights! +28% power", "success");
        }

        function resetFusionSlots() {
            const alphaSlot = document.getElementById('slot-alpha');
            const betaSlot = document.getElementById('slot-beta');
            
            alphaSlot.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-plus text-4xl text-gray-600 mb-3"></i>
                    <div class="font-medium text-gray-400">Select Panda A</div>
                    <div class="text-xs text-gray-500 mt-1">Click to choose from collection</div>
                </div>
            `;
            betaSlot.innerHTML = alphaSlot.innerHTML.replace('A', 'B');
            
            alphaSlot.classList.remove('active');
            betaSlot.classList.remove('active');
            alphaSlot.style.borderColor = '';
            betaSlot.style.borderColor = '';
            
            selectedAlpha = null;
            selectedBeta = null;
            
            document.getElementById('fuse-btn').disabled = true;
            document.getElementById('fuse-btn').classList.remove('fusion-glow');
        }

        function showLevelUp() {
            const levelUpHTML = `
                <div class="fixed inset-0 bg-black/90 z-[130] flex items-center justify-center" onclick="this.remove()">
                    <div class="text-center max-w-xs px-6" onclick="event.stopImmediatePropagation()">
                        <div class="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 flex items-center justify-center mb-6 shadow-[0_0_80px_#fbbf24]">
                            <span class="text-6xl">🏆</span>
                        </div>
                        
                        <div class="text-5xl font-black mb-1">LEVEL UP!</div>
                        <div class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">${gameState.level}</div>
                        
                        <div class="mt-4 text-xl">You are now a <span class="font-bold text-amber-400">FUSION MASTER</span>!</div>
                        
                        <div class="mt-8">
                            <button onclick="event.target.closest('.fixed').remove()" 
                                    class="px-9 py-3.5 rounded-3xl bg-white text-black font-bold text-sm">AWESOME!</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', levelUpHTML);
            
            // Extra confetti
            setTimeout(() => {
                const container = document.querySelector('.fixed.inset-0.bg-black\\/90');
                if (container) {
                    for (let i = 0; i < 40; i++) {
                        setTimeout(() => {
                            const p = document.createElement('div');
                            p.className = 'particle';
                            p.style.left = Math.random() * 100 + '%';
                            p.style.background = ['#fbbf24', '#00ff9d', '#f43f5e'][Math.floor(Math.random()*3)];
                            p.style.top = Math.random() * 40 + '%';
                            container.appendChild(p);
                            
                            p.animate([
                                {transform: 'translateY(0) scale(1)', opacity: 0.9},
                                {transform: `translateY(${280 + Math.random()*120}px) scale(0.4)`, opacity: 0}
                            ], {
                                duration: 1600 + Math.random()*900,
                                easing: 'ease-out'
                            }).onfinish = () => p.remove();
                        }, i * 2);
                    }
                }
            }, 300);
        }

        function claimDailyChallenge() {
            const btns = event.currentTarget;
            
            showToast("Daily Challenge Completed! +280 XP & 1 Rare Panda", "success");
            
            gameState.xp += 280;
            if (gameState.xp >= 10000) {
                gameState.level++;
                gameState.xp -= 10000;
                setTimeout(showLevelUp, 800);
            }
            
            // Reward panda
            const rewardPanda = {
                id: 'daily-' + Date.now(),
                name: "Blaze Guardian",
                emoji: "🦍🔥",
                type: "Fire",
                power: 29,
                rarity: "rare",
                color: "#f97316",
                desc: "Rewarded for completing today's Inferno Fusion challenge. A loyal guardian of the flame.",
                acquired: new Date().toISOString().split('T')[0]
            };
            
            userPandas.push(rewardPanda);
            gameState.fusions += 5;
            
            saveGameState();
            updateDashboard();
            renderCollection();
            
            // Show reward animation
            setTimeout(() => {
                const rewardModal = document.createElement('div');
                rewardModal.className = `fixed inset-0 z-[140] flex items-center justify-center bg-black/70`;
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

        function __battleWait(ms) {
            return new Promise((r) => setTimeout(r, ms));
        }

        function __resetBeam(el) {
            if (!el) return;
            el.classList.remove("battle-beam--to-enemy", "battle-beam--to-player", "battle-beam--special");
            void el.offsetWidth;
        }

        function __spawnBattleFloatingDmg(anchor, value, isSpecial) {
            if (!anchor) return;
            const el = document.createElement("div");
            el.className = "battle-dmg battle-dmg--float";
            el.style.color = isSpecial ? "#e879f9" : "#34d399";
            el.textContent = `-${value}`;
            anchor.appendChild(el);
            setTimeout(() => {
                el.remove();
            }, 1000);
        }

        function __syncBattleHpBars() {
            const b = window.__activeBattle;
            if (!b) return;
            const pBar = document.getElementById("battle-hp-player-bar");
            const pText = document.getElementById("battle-hp-player-text");
            const eBar = document.getElementById("battle-hp-enemy-bar");
            const eText = document.getElementById("battle-hp-enemy-text");
            const pPct = Math.max(0, (b.playerCur / b.playerMax) * 100);
            const ePct = Math.max(0, (b.enemyCur / b.enemyMax) * 100);
            if (pBar) pBar.style.width = pPct + "%";
            if (eBar) eBar.style.width = ePct + "%";
            if (pText) pText.textContent = `${Math.max(0, b.playerCur)} / ${b.playerMax} HP`;
            if (eText) eText.textContent = `${Math.max(0, b.enemyCur)} / ${b.enemyMax} HP`;
        }

        function __appendBattleLogLine(className, html) {
            const log = document.getElementById("battle-log");
            if (!log) return;
            const line = document.createElement("div");
            if (className) line.className = className;
            line.innerHTML = html;
            log.appendChild(line);
            log.scrollTop = log.scrollHeight;
        }

        function __escapeBattleText(value) {
            const div = document.createElement("div");
            div.textContent = String(value);
            return div.innerHTML;
        }

        function __createBattleMatch() {
            const playerLevel = Math.max(0, Number(gameState.level) || 0);
            const champion = [...userPandas].sort((a, b) => (b.power || 0) - (a.power || 0))[0] || basePandas[0];
            const championPower = Math.max(1, Number(champion.power) || 1);
            const enemyLevelFloor = Math.max(0, playerLevel - 1);
            const enemyLevelCeil = Math.max(enemyLevelFloor, playerLevel + (playerLevel < 3 ? 0 : 1));
            const enemyLevel = enemyLevelFloor + Math.floor(Math.random() * (enemyLevelCeil - enemyLevelFloor + 1));
            const playerMax = 120 + Math.floor(championPower * 2.2) + playerLevel * 9;
            const enemyMax = Math.max(72, Math.floor(playerMax * (playerLevel < 3 ? 0.55 : 0.72)));
            const playerBaseDamage = Math.max(16, Math.floor(championPower * 0.8) + 12 + playerLevel);
            const enemyBaseDamage = Math.max(7, Math.floor(playerBaseDamage * (playerLevel < 3 ? 0.48 : 0.64)));
            return {
                playerCur: playerMax,
                playerMax,
                enemyCur: enemyMax,
                enemyMax,
                round: 1,
                ended: false,
                playerName: champion.name || "Classic Panda",
                playerEmoji: champion.emoji || "🐼",
                playerLevel,
                playerPower: championPower,
                enemyName: playerLevel < 5 ? "Training Bruiser" : playerLevel < 20 ? "Rift Stalker" : "Doombringer",
                enemyEmoji: playerLevel < 5 ? "🥋🐼" : playerLevel < 20 ? "🌑🐼" : "👹🐼",
                enemyLevel,
                enemyPower: Math.max(6, Math.floor(championPower * (playerLevel < 3 ? 0.72 : 0.9))),
                playerBaseDamage,
                enemyBaseDamage,
            };
        }

        function startDemoBattle() {
            const arenaSection = document.getElementById("section-arena");
            const battle = __createBattleMatch();
            window.__activeBattle = battle;
            const safePlayerName = __escapeBattleText(battle.playerName);
            const safeEnemyName = __escapeBattleText(battle.enemyName);
            arenaSection.innerHTML = `
                <div class="max-w-4xl mx-auto">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <div class="uppercase tracking-[3px] text-xs text-red-400">LIVE ARENA</div>
                            <div class="text-4xl font-black">Epic Showdown</div>
                        </div>
                        <button type="button" onclick="location.reload()" class="px-5 py-2 text-xs border border-gray-700 rounded-2xl flex items-center gap-x-2 hover:bg-red-950/40 transition-colors">
                            <i class="fas fa-redo" aria-hidden="true"></i> <span>END BATTLE</span>
                        </button>
                    </div>
                    
                    <div id="battle-stage" class="battle-stage p-4 md:p-6 mb-6" role="img" aria-label="Battle arena, two fighters, animated attacks">
                    <div class="grid grid-cols-1 md:grid-cols-7 gap-3 md:gap-2 items-stretch min-h-[280px]">
                        <div id="battle-fighter-player" class="battle-fighter md:col-span-3 cyber-card rounded-3xl p-4 md:p-6 text-center border border-emerald-500/50">
                            <div class="battle-anim-flash battle-anim-flash--emerald pointer-events-none" id="battle-flash-player" aria-hidden="true"></div>
                            <div class="text-xs mb-1 text-emerald-400">YOUR CHAMPION</div>
                            <div class="text-6xl sm:text-8xl mb-2 min-h-[5rem] flex items-center justify-center" aria-hidden="true">
                                <span class="battle-fighter__emoji" id="battle-emoji-player">${battle.playerEmoji}</span>
                            </div>
                            <div class="font-black text-lg md:text-2xl">${safePlayerName}</div>
                            <div class="text-xs sm:text-sm text-emerald-400/90 mb-3">LVL ${battle.playerLevel} · ${battle.playerPower} PWR</div>
                            <div class="mt-1 h-2.5 bg-gray-800/90 rounded-full overflow-hidden">
                                <div id="battle-hp-player-bar" class="h-2.5 bg-emerald-400 rounded-full transition-[width] duration-500 ease-out" style="width:100%"></div>
                            </div>
                            <div id="battle-hp-player-text" class="text-xs mt-1.5 text-gray-400 font-mono">${battle.playerCur} / ${battle.playerMax} HP</div>
                        </div>
                        
                        <div class="md:col-span-1 flex flex-col justify-center items-center gap-3 py-2 min-h-[100px]">
                            <div class="text-center">
                                <div class="text-red-500 text-4xl md:text-5xl font-black" aria-hidden="true">VS</div>
                                <div class="text-[10px] tracking-[0.2em] text-gray-500 mt-1">ROUND <span id="battle-round">1</span></div>
                            </div>
                            <div class="w-full max-w-[100px] px-1" aria-hidden="true">
                                <div id="battle-beam" class="battle-beam w-full"></div>
                            </div>
                            <p class="text-[9px] text-center text-gray-600 max-w-[7rem] leading-tight">Beams = fusion energy (demo)</p>
                        </div>
                        
                        <div id="battle-fighter-enemy" class="battle-fighter md:col-span-3 cyber-card rounded-3xl p-4 md:p-6 text-center border border-red-500/50">
                            <div class="battle-anim-flash battle-anim-flash--red pointer-events-none" id="battle-flash-enemy" aria-hidden="true"></div>
                            <div class="text-xs mb-1 text-red-400">RIVAL</div>
                            <div class="text-6xl sm:text-8xl mb-2 min-h-[5rem] flex items-center justify-center" aria-hidden="true">
                                <span class="battle-fighter__emoji" id="battle-emoji-enemy">${battle.enemyEmoji}</span>
                            </div>
                            <div class="font-black text-lg md:text-2xl">${safeEnemyName}</div>
                            <div class="text-xs sm:text-sm text-red-400/90 mb-3">LVL ${battle.enemyLevel} · ${battle.enemyPower} PWR</div>
                            <div class="mt-1 h-2.5 bg-gray-800/90 rounded-full overflow-hidden">
                                <div id="battle-hp-enemy-bar" class="h-2.5 bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-[width] duration-500 ease-out" style="width:100%"></div>
                            </div>
                            <div id="battle-hp-enemy-text" class="text-xs mt-1.5 text-gray-400 font-mono">${battle.enemyCur} / ${battle.enemyMax} HP</div>
                        </div>
                    </div>
                    </div>
                    
                    <div class="mt-2 cyber-card rounded-3xl p-4 text-sm">
                        <div class="flex items-center justify-between text-xs px-1 mb-2">
                            <div class="font-mono text-gray-400">COMBAT LOG</div>
                            <div class="font-mono text-emerald-500/90 text-[10px]">◇ ANIMATED</div>
                        </div>
                        <div class="space-y-1.5 text-xs font-mono bg-black/50 p-3 rounded-2xl max-h-36 overflow-y-auto" id="battle-log">
                            <div class="text-gray-500">A level-matched foe enters range. Choose Attack or Special — moves play on the stage above.</div>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap justify-center gap-3 mt-6">
                        <button type="button" id="battle-attack-btn" onclick="void simulateBattleAttack(this, false)" class="px-8 py-3 text-sm bg-red-600 hover:bg-red-500 transition-colors rounded-2xl font-bold flex items-center gap-x-2">
                            <span>ATTACK</span> <i class="fas fa-fist-raised" aria-hidden="true"></i>
                        </button>
                        <button type="button" id="battle-special-btn" onclick="void simulateBattleAttack(this, true)" class="px-8 py-3 text-sm border border-fuchsia-400 text-fuchsia-300 hover:bg-fuchsia-500/20 transition-all rounded-2xl font-bold flex items-center gap-x-2">
                            <span>SPECIAL</span> <i class="fas fa-magic" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            `;
            __syncBattleHpBars();
        }

        async function simulateBattleAttack(element, isSpecial = false) {
            const b = window.__activeBattle;
            const log = document.getElementById("battle-log");
            if (!log || !b || b.ended) return;
            const pCard = document.getElementById("battle-fighter-player");
            const eCard = document.getElementById("battle-fighter-enemy");
            const pFlash = document.getElementById("battle-flash-player");
            const eFlash = document.getElementById("battle-flash-enemy");
            const beam = document.getElementById("battle-beam");
            const atkBtn = document.getElementById("battle-attack-btn");
            const spBtn = document.getElementById("battle-special-btn");
            if (!pCard || !eCard) return;
            if (element && element.disabled) return;
            if (atkBtn) atkBtn.disabled = true;
            if (spBtn) spBtn.disabled = true;
            const attacks = isSpecial
                ? ["CRITICAL FUSION BEAM", "DIMENSION RIFT", "PANDAS UNITE"]
                : ["BAMBOO SLAM", "PAW STRIKE", "ROAR OF FURY"];
            const attackName = attacks[Math.floor(Math.random() * attacks.length)];
            const dmg = isSpecial
                ? Math.floor(Math.random() * 14) + b.playerBaseDamage + 12
                : Math.floor(Math.random() * 10) + b.playerBaseDamage;
            pCard.classList.add("battle-anim-attack-left");
            __resetBeam(beam);
            if (beam) {
                if (isSpecial) {
                    beam.classList.add("battle-beam--special");
                    beam.style.background =
                        "linear-gradient(90deg, #a855f7, #e879f9, #f43f5e)";
                } else {
                    beam.style.background =
                        "linear-gradient(90deg, #10b981, #2dd4bf, #a855f7)";
                }
                beam.classList.add("battle-beam--to-enemy");
            }
            await __battleWait(120);
            b.enemyCur = Math.max(0, b.enemyCur - dmg);
            __syncBattleHpBars();
            eCard.classList.add("battle-anim-shake");
            if (eFlash) eFlash.classList.add("battle-anim-flash--on", "battle-anim-flash--red");
            __spawnBattleFloatingDmg(eCard, dmg, isSpecial);
            __appendBattleLogLine(
                isSpecial ? "text-fuchsia-300" : "text-emerald-300",
                `${__escapeBattleText(b.playerName)} used <span class="font-bold">${attackName}</span> <span class="text-white/60">→</span> <span class="font-mono">${dmg} DMG</span>`,
            );
            await __battleWait(450);
            pCard.classList.remove("battle-anim-attack-left");
            eCard.classList.remove("battle-anim-shake");
            if (eFlash) eFlash.classList.remove("battle-anim-flash--on", "battle-anim-flash--red");
            if (beam) {
                beam.classList.remove("battle-beam--to-enemy", "battle-beam--special");
            }
            if (b.enemyCur <= 0) {
                b.ended = true;
                b.enemyCur = 0;
                __syncBattleHpBars();
                eCard.classList.add("battle-fighter--defeated");
                eCard.setAttribute("aria-hidden", "true");
                document.getElementById("battle-stage")?.classList.add("battle-stage--victory");
                __appendBattleLogLine(
                    "text-amber-300 font-bold border-t border-amber-500/20 pt-2 mt-1",
                    `🏆 VICTORY! ${__escapeBattleText(b.enemyName)} vanished from the arena! +650 XP`,
                );
                showToast("Battle won! +650 XP earned", "success");
                gameState.xp += 650;
                if (gameState.xp >= 10000) {
                    gameState.level++;
                    gameState.xp = gameState.xp % 10000;
                    setTimeout(showLevelUp, 1200);
                }
                saveGameState();
                updateDashboard();
                return;
            }
            await __battleWait(380);
            const roundEl = document.getElementById("battle-round");
            const enemyAttacks = ["VOID CRUSH", "HELLFIRE ROAR", "DARK PULSE"];
            const enemyAttack = enemyAttacks[Math.floor(Math.random() * enemyAttacks.length)];
            const enemyDmg = Math.floor(Math.random() * 8) + b.enemyBaseDamage;
            eCard.classList.add("battle-anim-attack-right");
            __resetBeam(beam);
            if (beam) {
                beam.style.background = "linear-gradient(90deg, #f43f5e, #a855f7, #10b981)";
                beam.classList.add("battle-beam--to-player");
            }
            await __battleWait(120);
            b.playerCur = Math.max(0, b.playerCur - enemyDmg);
            __syncBattleHpBars();
            pCard.classList.add("battle-anim-shake");
            if (pFlash) pFlash.classList.add("battle-anim-flash--on", "battle-anim-flash--emerald");
            __spawnBattleFloatingDmg(pCard, enemyDmg, false);
            __appendBattleLogLine(
                "text-rose-300",
                `${__escapeBattleText(b.enemyName)}: <span class="font-bold">${enemyAttack}</span> <span class="text-white/60">→</span> <span class="font-mono text-white">${enemyDmg} DMG</span>`,
            );
            await __battleWait(450);
            eCard.classList.remove("battle-anim-attack-right");
            pCard.classList.remove("battle-anim-shake");
            if (pFlash) pFlash.classList.remove("battle-anim-flash--on", "battle-anim-flash--emerald");
            if (beam) {
                beam.classList.remove("battle-beam--to-player");
            }
            b.round += 1;
            if (roundEl) {
                roundEl.textContent = String(b.round);
            }
            if (!b.ended) {
                if (atkBtn) atkBtn.disabled = false;
                if (spBtn) spBtn.disabled = false;
            }
        }

        function navigateTo(section) {
            // Hide all sections
            document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
            
            // Show target
            const target = document.getElementById('section-' + section);
            if (target) target.classList.remove('hidden');
            
            // Update desktop and mobile nav active states
            const activeIds = new Set([`nav-${section}`, `nav-mobile-${section}`]);
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                link.removeAttribute("aria-current");
                if (activeIds.has(link.id)) {
                    link.classList.add('active');
                    link.setAttribute("aria-current", "page");
                }
            });
            
            // Special actions per section
            if (section === 'collection') {
                renderCollection();
            }
            if (section === "codex") {
                switchCodexTab("bestiary");
            }
        }

        function showToast(message, type = "success") {
            const container = document.getElementById('toast-container');
            
            const toast = document.createElement('div');
            toast.className = `flex items-center gap-x-3 px-5 py-3.5 rounded-3xl shadow-2xl max-w-xs text-sm border ${type === 'success' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' : type === 'error' ? 'bg-red-950 border-red-700 text-red-300' : 'bg-[#1a1f2e] border-gray-700 text-white'}`;
            
            let icon = 'fa-check-circle';
            if (type === 'error') icon = 'fa-exclamation-circle';
            if (type === 'info') icon = 'fa-info-circle';
            
            toast.innerHTML = `
                <i class="fas ${icon} text-xl"></i>
                <div>${message}</div>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.transition = 'all 0.3s ease';
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
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
                                <div class="font-semibold mb-3 text-xs tracking-widest text-gray-400">KEYBOARD</div>
                                <div class="text-xs text-gray-400 space-y-1 py-1">
                                    <div><span class="font-mono text-emerald-500/90">Esc</span> — close top dialog / overlay</div>
                                    <div><span class="font-mono text-emerald-500/90">⌘ + /</span> (Ctrl + /) — search collection</div>
                                    <div><span class="font-mono text-emerald-500/90">?</span> with body focus — go to Fusion Lab</div>
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
                                FusionPanda Master Webapp v4.2.1 • Built with ❤️ for the Panda Protocol<br>
                                Data stored locally in your browser
                            </div>
                        </div>
                        
                        <div class="px-6 py-4 bg-[#0f1117] flex justify-end gap-x-3">
                            <button onclick="event.target.closest('.fixed').remove()" class="px-6 py-2 text-sm rounded-2xl border border-gray-700">CLOSE</button>
                            <button onclick="resetAllData(); event.target.closest('.fixed').remove()" class="px-6 py-2 text-sm rounded-2xl bg-red-600 hover:bg-red-700 text-white">RESET ALL DATA</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', settingsHTML);
        }

        function resetAllData() {
            if (confirm("Are you sure you want to reset ALL progress? This cannot be undone.")) {
                localStorage.removeItem('fusionPandaMaster');
                location.reload();
            }
        }

        function closeTopModalOrOverlay() {
            const fusionResult = document.getElementById("fusion-result-modal");
            if (fusionResult && !fusionResult.classList.contains("hidden")) {
                closeFusionModal();
                return true;
            }
            const pandaSel = document.getElementById("panda-selector-modal");
            if (pandaSel && !pandaSel.classList.contains("hidden")) {
                closePandaSelector();
                return true;
            }
            const overlays = Array.from(document.querySelectorAll("body > div")).filter(
                (d) =>
                    d.classList &&
                    d.classList.contains("fixed") &&
                    d.classList.contains("inset-0") &&
                    d.id !== "fusion-result-modal" &&
                    d.id !== "panda-selector-modal" &&
                    !d.classList.contains("hidden") &&
                    window.getComputedStyle(d).display !== "none",
            );
            const top = overlays[overlays.length - 1];
            if (top) {
                top.remove();
                return true;
            }
            return false;
        }

        function wireNavLinkAccessibility() {
            document.querySelectorAll(".nav-link").forEach((el) => {
                el.setAttribute("role", "button");
                if (!el.hasAttribute("tabindex")) {
                    el.setAttribute("tabindex", "0");
                }
                el.addEventListener("keydown", (ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        el.click();
                    }
                });
            });
        }

        function initKeyboardShortcuts() {
            document.addEventListener('keydown', function(e) {
                if (e.key === "Escape") {
                    if (closeTopModalOrOverlay()) {
                        e.preventDefault();
                    }
                    return;
                }
                if (e.metaKey && e.key === "/") {
                    e.preventDefault();
                    const search = document.getElementById('search-input');
                    if (search) {
                        navigateTo('collection');
                        search.focus();
                    }
                }
                
                if (e.key === "?" && document.activeElement.tagName === "BODY") {
                    e.preventDefault();
                    navigateTo('fusion-lab');
                }
            });
            
            // Easter egg: Konami code for mega fusion
            let konami = '';
            const konamiCode = '38384040373937396665'; // up up down down left right left right b a
            document.addEventListener('keydown', function(e) {
                konami += e.keyCode;
                if (konami.length > 20) konami = konami.slice(-20);
                
                if (konami === konamiCode) {
                    konami = '';
                    showToast("🎉 KONAMI CODE ACTIVATED! +999 XP & Legendary Panda!", "success");
                    
                    const legendary = {
                        id: 'konami-' + Date.now(),
                        name: "Quantum Overlord Panda",
                        emoji: "👑🐼",
                        type: "Mythic Hybrid",
                        power: 88,
                        rarity: "mythic",
                        color: "#f43f5e",
                        desc: "The ultimate panda. Achieved only by true masters of the fusion arts.",
                        acquired: new Date().toISOString().split('T')[0]
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
                        showPandaDetail(userPandas.length - 1);
                    }, 1200);
                }
            });
        }

        // Initialize everything
        function initializeApp() {
            loadGameState();
            
            // Set initial section to dashboard
            document.getElementById('section-dashboard').classList.remove('hidden');
            document.getElementById('nav-dashboard').classList.add('active');
            
            // Render initial collection (hidden)
            renderCollection();
            renderBasePandas();
            
            // Random tip toast after 6 seconds
            setTimeout(() => {
                if (!document.hidden) {
                    showToast("Pro tip: Use the Konami code ↑↑↓↓←→←→BA for a surprise! 🎮", "info");
                }
            }, 6500);
            
            wireNavLinkAccessibility();
            initKeyboardShortcuts();
            
            // Make sure fuse button starts disabled
            document.getElementById('fuse-btn').disabled = true;
            
            // Initialize advanced fusion mode
            setTimeout(() => {
                setFusionMode('basic');
            }, 300);
            
            // Easter egg hint in console
            console.log('%c[FusionPanda Master] Konami code enabled! Try ↑↑↓↓←→←→BA', 'color:#64748b');
            
            // Welcome message for first timers (if no save)
            if (!localStorage.getItem('fusionPandaMaster')) {
                setTimeout(() => {
                    showToast("Welcome to FusionPanda Master! Start by fusing your first pandas 🐼", "success");
                }, 1400);
            }
            
            // Demo: Pre-select two pandas in fusion lab for new users (optional)
            // Uncomment if wanted:
            // setTimeout(() => { if (userPandas.length > 1) { selectPandaForSlot('alpha', userPandas[0]); selectPandaForSlot('beta', userPandas[1]); } }, 800);
        }

        function scheduleInit() {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
            } else {
                initializeApp();
            }
        }
        scheduleInit();
        
        // Expose some functions for console debugging (fun)
        window.FusionPanda = {
            addPanda: (name) => {
                const newP = {...basePandas[0], name: name || "Debug Panda", id: 'debug-' + Date.now(), rarity: 'legendary', power: 55};
                userPandas.push(newP);
                renderCollection();
                console.log('%c[Panda added]', 'color:#00ff9d', newP);
            },
            levelUp: () => {
                gameState.level++;
                showLevelUp();
            }
        };
