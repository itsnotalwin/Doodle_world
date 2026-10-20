# Doodleworld

A living doodle sandbox on a 24,000 × 24,000 canvas. Draw a character, give it a personality, and watch it practise, build and spar.

## Play
`npm run dev` then open http://localhost:4173. No dependencies or API key needed. Drag to pan, scroll to zoom, click a doodle to inspect, arrow keys/WASD to pan, Space to pause. Use the creator to sketch a character. Saves are device-local; export to back them up.

## Optional Groq
Configure `GROQ_API_KEY` as a server secret and `GROQ_MODEL` as a supported chat model. Provision the `DB` D1 binding and apply the checked-in schema migration. A click requests one JSON plan for up to 12 doodles; no automatic calls or retries. A global atomic quota defaults to five attempts per UTC day with a 60-second cooldown. Failed upstream attempts count. Without the key, model, DB, or authenticated hosted access, external planning stays disabled.

The simulator executes bounded action plans locally and resumes its local policy when they expire. Local experience updates action values and practice skills; this prototype does not train a neural network. No multiplayer or offline server simulation yet.

`npm test`, `npm run build`, `npm run validate`. See PROJECT.md for handoff and AGENTS.md for build standards.
