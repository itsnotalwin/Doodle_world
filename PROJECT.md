# Doodleworld

## Purpose
A growing paper-and-ink simulation. Doodles invent drawings and building designs, learn through practice, meet, develop trust and grudges, form circles, and sustain settlements. A globe and detailed 2D canvas are projections of the same 2,400,000 × 2,400,000 world.

## Architecture
Dependency-free JavaScript. `sim/engine.js` owns fixed-step activity, learning and strict versioned saves; `sim/world-systems.js` owns biomes, resources, social rules, procedural artwork and tested globe projection. `sim/drawing-library.js` supplies 95 original vector motifs; `sim/life-systems.js` owns 24 personality traits, paired genes, phenotype, family growth, autonomous affiliation and death history. `ui/index.html` owns controls and character creation; `ui/world-view.js` owns globe rendering, environment, gallery and social inspection. `worker/index.js` is the secret-bearing optional Groq bridge. The build embeds simulation and UI into one Worker. Player worlds are device-local and exportable.

## Run and verify
`npm run dev` serves port 4173. `npm test` runs 36 behavioral checks. `npm run build` and `npm run validate` verify both Worker ESM and embedded browser JavaScript. Use Sites preview for browser QA. See `QA.md` for tested scenarios and real screenshot provenance.

## Decisions and limits
Source: https://github.com/itsnotalwin/Doodle_world. Preserve the original aesthetic and saves. Version 1 and 2 saves migrate additively to version 3; existing sketches, skills, buildings and memories survive. Current bounds: 100 living doodles and 240 lifetime records; automatic arrivals stop at 32 living residents; 600 buildings; 1,200 artwork records. At those content bounds, other needs, emotions, relationships and simulation continue. No shared multiplayer or progression while the page is closed. Creativity is generated motif composition and variable blueprints, emotions are explicit social rules, and learning is experience-based action values and skills; no neural training or learned physics claim.

## Optional Groq
No provider call is required for the growing world. One explicitly requested batch can supply up to 12 character plans, art recipes, social targets and thoughts; local execution lasts at most 180 simulated seconds before local policies resume. Server D1 quota defaults to five attempts per UTC day with a 60-second cooldown; failed attempts count and nothing retries automatically. Key stays in server secrets. Live testing is pending a user-supplied `GROQ_API_KEY` plus supported `GROQ_MODEL`.

## Next action
Configure the server-side Groq key/model and test one deliberate batch. Shared multiplayer and background/cloud worlds remain future work; keep expansion grounded in observed behavior and user feedback.
