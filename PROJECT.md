# Doodleworld

## Purpose
A large ink-and-paper canvas simulation. Doodles move, practise, gather ink, draw buildings, and spar. Players can draw a custom doodle and describe its personality. Occasional Groq plans guide local execution.

## Architecture
Dependency-free JavaScript. `sim/engine.js` owns serializable simulation and experience-based action learning. `ui/index.html` owns canvas rendering and controls. `worker/index.js` owns the server-side Groq bridge. Build embeds all source into one Worker. World saves are device-local and exportable, not shared multiplayer.

## Run and verify
`npm run dev` serves port 4173. `npm test` exercises simulation, schema limits and brain-budget behavior. `npm run build` packages a Worker; `npm run validate` checks it. No Groq calls without both server environment keys and a provisioned quota DB.

## Constraints
Source target: https://github.com/itsnotalwin/Doodle_world (public, initially empty). API key must only be a server secret. Huge means a finite 24,000 x 24,000 world with viewport culling; no infinite-world claim. Learning means persistent action values and practice skills, not neural-network training. Verified: 13 automated tests pass; desktop and 390 × 844 responsive-width captures recorded. Browser checks passed for creator insertion, save persistence after reload, pause, arrow-key pan, wheel zoom, mobile notebook and creator scrolling. Live Groq integration remains untested without a key.

## Next
Finish prototype and QA, sync source, publish privately, then configure a supplied Groq secret and run one deliberate integration test.
