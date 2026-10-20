# Doodleworld

## Purpose
A growing paper-and-ink simulation. Doodles meet real needs, assess household/settlement shortages, learn skills, farm, build, craft, raise families, choose circles and develop leadership/territory. See SIMULATION.md for the implemented contract and limits. A globe and detailed 2D canvas are projections of the same 2,400,000 × 2,400,000 world.

## Architecture
Dependency-free JavaScript. `sim/engine.js` owns fixed-step activity, learning and strict versioned saves; `sim/world-systems.js` owns biomes, resources, social rules, procedural artwork and tested globe projection. `sim/livelihood.js` owns farms, materials, jobs, household capacity and productive building/equipment variation; `sim/agent-brain.js` owns individual goals, contextual learning, careers and basic political strategy; `sim/drawing-library.js` preserves legacy save compatibility; `sim/life-systems.js` owns 24 personality traits, paired genes, phenotype, family growth, autonomous affiliation and death history. `ui/index.html` owns controls and character creation; `ui/world-view.js` owns globe rendering, environment, gallery and social inspection. `worker/index.js` is the secret-bearing optional Groq bridge. The build embeds simulation and UI into one Worker. Player worlds are device-local/exportable, with owner-scoped D1 checkpoints through `worker/world-store.js`.

## Run and verify
`npm run dev` serves port 4173. `npm test` runs 55 behavioral checks. `npm run build` and `npm run validate` verify both Worker ESM and embedded browser JavaScript. Use Sites preview for browser QA. See `QA.md` for tested scenarios and real screenshot provenance.

## Decisions and limits
Source: https://github.com/itsnotalwin/Doodle_world. Preserve the original aesthetic and saves. Version 1, 2 and 3 saves migrate additively to version 4; existing sketches, skills, buildings and memories survive. Current bounds: 100 living doodles and 240 lifetime records; automatic arrivals stop at 32 living residents; 600 buildings; 300 fields and 100 claims; old artwork remains exportable but hidden. At those content bounds, other needs, emotions, relationships and simulation continue. No shared multiplayer or progression while the page is closed. Authenticated cloud checkpoints preserve individual state across sessions; GitHub contains code, not runtime brain commits. Creativity is varied functional blueprints, crop plots and crafted equipment, emotions are explicit social rules, and learning is experience-based action values and skills; no neural training or learned physics claim.

## Optional Groq
No provider call is required for the growing world. One explicitly requested batch can supply up to 12 character plans, art recipes, social targets and thoughts; local execution lasts at most 180 simulated seconds before local policies resume. Server D1 quota defaults to five attempts per UTC day with a 60-second cooldown; failed attempts count and nothing retries automatically. Key stays in server secrets. Live testing is pending a user-supplied `GROQ_API_KEY` plus supported `GROQ_MODEL`.

## Next action
Configure the server-side Groq key/model and test one deliberate batch. Shared multiplayer and background/cloud worlds remain future work; keep expansion grounded in observed behavior and user feedback.
