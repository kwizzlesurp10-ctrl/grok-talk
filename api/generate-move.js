/**
 * Vercel Serverless Function: Custom Move AI Generator
 * Connects FusionPanda Master to a Gemini AI model in the background.
 */

function localHeuristicFallback(prompt, name, element, moveType) {
  const text = String(prompt || "").toLowerCase();
  
  // 1. Determine speed
  let speed = 1.2;
  if (text.includes('fast') || text.includes('speed') || text.includes('sonic') || text.includes('quick') || text.includes('flash') || text.includes('velocity') || text.includes('laser') || text.includes('wind') || text.includes('lightning')) {
    speed = 2.0;
  } else if (text.includes('slow') || text.includes('heavy') || text.includes('delay') || text.includes('giant') || text.includes('rock') || text.includes('earth')) {
    speed = 0.7;
  }
  
  // 2. Determine size
  let size = 1.0;
  if (text.includes('giant') || text.includes('huge') || text.includes('colossal') || text.includes('heavy') || text.includes('massive') || text.includes('mega') || text.includes('large') || text.includes('meteor')) {
    size = 2.0;
  } else if (text.includes('small') || text.includes('tiny') || text.includes('needle') || text.includes('point') || text.includes('spark')) {
    size = 0.6;
  }
  
  // 3. Determine count
  let count = 35;
  if (text.includes('many') || text.includes('swarm') || text.includes('shower') || text.includes('storm') || text.includes('flood') || text.includes('multitude') || text.includes('barrage') || text.includes('particles')) {
    count = 75;
  } else if (text.includes('single') || text.includes('lone') || text.includes('one') || text.includes('focused')) {
    count = 18;
  }
  
  // 4. Determine shape
  let shape = 'particle';
  if (text.includes('wave') || text.includes('tsunami') || text.includes('ripple') || text.includes('surge') || text.includes('shockwave')) {
    shape = 'wave';
  } else if (text.includes('slash') || text.includes('cut') || text.includes('blade') || text.includes('strike') || text.includes('slice') || text.includes('swipe')) {
    shape = 'slash';
  } else if (text.includes('burst') || text.includes('explode') || text.includes('nova') || text.includes('boom') || text.includes('shatter') || text.includes('blast')) {
    shape = 'burst';
  } else if (text.includes('ring') || text.includes('halo') || text.includes('orbit') || text.includes('circle') || text.includes('loop')) {
    shape = 'ring';
  }
  
  // 5. Determine element onomatopoeia
  const elementOnom = {
    Fire: "FWOOSH!", Water: "SPLASH!", Ice: "FREEZE!", Steam: "HISS!",
    Thunder: "ZZZAP!", Void: "VOID!", Light: "FLASH!", Wind: "WHOOSH!", Earth: "QUAKE!"
  };
  const fallbackOnom = elementOnom[element] || "SLAM!";
  
  let chosenOnomatopoeia = fallbackOnom;
  if (text.includes('boom') || text.includes('explode')) chosenOnomatopoeia = "KABOOM!";
  else if (text.includes('slice') || text.includes('slash')) chosenOnomatopoeia = "SHING!";
  else if (text.includes('zap') || text.includes('shock')) chosenOnomatopoeia = "ZZZAP!";
  else if (text.includes('freeze') || text.includes('shatter')) chosenOnomatopoeia = "SHATTER!";
  
  // 6. Move name
  const adjs = ["Cyber", "Latent", "Neural", "Stable", "Quantum", "Hyper", "Vectored", "Synthetic"];
  const nouns = {
    Fire: ["Blaze", "Ember", "Inferno", "Ignition"],
    Water: ["Tsunami", "Deluge", "Torrent", "Cascade"],
    Ice: ["Glacier", "Frost", "Chamber", "Avalanche"],
    Steam: ["Geyser", "Vapor", "Vortex", "Vent"],
    Thunder: ["Overload", "Volt", "Lightning", "Pulse"],
    Void: ["Singularity", "Eclipse", "Rift", "Anomaly"],
    Light: ["Nova", "Corona", "Radiance", "Beacon"],
    Wind: ["Cyclone", "Tempest", "Breeze", "Gale"],
    Earth: ["Quake", "Terra", "Crust", "Mantle"]
  };
  const elementNouns = nouns[element] || ["Strike", "Force", "Impact", "Wave"];
  const randomAdj = adjs[Math.floor(Math.random() * adjs.length)];
  const randomNoun = elementNouns[Math.floor(Math.random() * elementNouns.length)];
  const finalName = name || `${randomAdj} ${randomNoun}`;
  
  const power = moveType === 'special' 
    ? Math.floor(Math.random() * 20) + 140
    : Math.floor(Math.random() * 15) + 110;
    
  const moveSeed = Math.floor(Math.random() * 999999);
  const promptSanitized = encodeURIComponent((prompt || "").replace(/[^a-zA-Z0-9 ]/g, ''));
  const imageUrl = `https://image.pollinations.ai/p/neon_cyberpunk_battle_action_${promptSanitized}?width=400&height=250&nologo=true&seed=${moveSeed}`;

  return {
    name: finalName,
    description: `A synthesized ${element} move: "${prompt}"`,
    power: power,
    onomatopoeia: chosenOnomatopoeia,
    visuals: { speed, size, count, shape },
    visualDescription: `A ${shape} of ${element.toLowerCase()} energy particles generated at speed ${speed} and scale ${size}.`,
    imageUrl: imageUrl,
    generationModel: "local-heuristic-model"
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { prompt, name, element, moveType } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt description.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const fallback = localHeuristicFallback(prompt, name, element, moveType);
    return res.status(200).json(fallback);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const systemPrompt = `You are an expert game mechanics and visual generator for FusionPanda Master (an idle fusion RPG).
Based on the player's custom move concept description, generate a creative move configuration.

Inputs:
- Player Prompt Concept: "${prompt}"
- Suggested Name: "${name || 'None'}"
- Champion Element Type: "${element || 'Balanced'}"
- Move Type: "${moveType || 'attack'}" (can be "attack" or "special")

Generate a structured JSON configuration for this move. The fields are:
- name: A cool, creative, element-themed combat name for the move (if a suggested name was provided, refine it or use it if it's already cool).
- description: A short, epic 1-sentence description of what the move does in battle.
- power: An attack power rating. For "attack" moves, it should be between 105 and 130. For "special" moves, it should be between 135 and 175.
- onomatopoeia: A creative comic action sound word (e.g., "KABOOM!", "ZAP-CRACKLE!", "SLICE-SHATTER!", "FWOOSH-FLAME!") that represents this move's impact.
- visuals:
  - speed: A decimal number representing animation speed. Fast concepts (lightning, sonic, laser, wind) should be between 1.6 and 2.5. Slow concepts (heavy, giant, rock, freeze) should be between 0.5 and 0.9. Default is 1.2.
  - size: A decimal number representing particle size. Heavy/massive concepts should be between 1.6 and 2.5. Tiny/needle concepts should be between 0.5 and 0.8. Default is 1.0.
  - count: An integer representing particle count. Swarm/shower/storm concepts should be between 60 and 100. Single/focused concepts should be between 15 and 30. Default is 35.
  - shape: Must be exactly one of these strings: "particle", "wave", "slash", "burst", "ring". Choose the one that best matches the prompt concept.
- visualDescription: A 1-sentence description describing the visual animation as if simulated by video/Stable Diffusion models (e.g., "A circular burst of cyan frost spikes radiating outward in a shockwave").

You MUST return ONLY a raw JSON object matching this schema. Do not write markdown blocks or backticks. If you do, ensure it is valid JSON inside.`;

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!apiResponse.ok) {
      throw new Error(`Gemini API returned status ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    const resultText = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('Empty response from Gemini API');
    }

    let parsedResult;
    try {
      let cleanedText = resultText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.substring(7);
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.substring(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
      cleanedText = cleanedText.trim();
      parsedResult = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error("JSON parsing error on Gemini output:", parseErr, resultText);
      throw parseErr;
    }

    const moveSeed = Math.floor(Math.random() * 999999);
    const promptSanitized = encodeURIComponent((prompt || "").replace(/[^a-zA-Z0-9 ]/g, ''));
    const imageUrl = `https://image.pollinations.ai/p/neon_cyberpunk_battle_action_${promptSanitized}?width=400&height=250&nologo=true&seed=${moveSeed}`;

    return res.status(200).json({
      name: parsedResult.name || name || "AI Striker",
      description: parsedResult.description || `AI generated move: ${prompt}`,
      power: Number(parsedResult.power) || 120,
      onomatopoeia: parsedResult.onomatopoeia || "CRASH!",
      visuals: {
        speed: Number(parsedResult.visuals?.speed) || 1.2,
        size: Number(parsedResult.visuals?.size) || 1.0,
        count: Number(parsedResult.visuals?.count) || 35,
        shape: parsedResult.visuals?.shape || 'particle'
      },
      visualDescription: parsedResult.visualDescription || "A custom cyber-neon blast preview.",
      imageUrl: imageUrl,
      generationModel: "gemini-1.5-flash"
    });

  } catch (err) {
    console.error("Gemini invocation failed, falling back:", err);
    const fallback = localHeuristicFallback(prompt, name, element, moveType);
    return res.status(200).json(fallback);
  }
}
