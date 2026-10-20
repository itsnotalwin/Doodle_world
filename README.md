# Doodleworld

A growing ink-and-paper sandbox: doodles invent little drawings, build their own houses, form friendships and grudges, and find circles to belong to.

## Play
`npm run dev`, then open http://localhost:4173. No dependencies or key required.

Drag or WASD/arrows to pan; scroll or ＋/− to zoom. ◎ zooms out to the globe. Drag the globe to turn it; click a place or choose “Step into this place” to enter the same world in 2D. Home returns to the first meadow. Space pauses. The notebook lets you inspect doodles, their artwork and circles. Draw yourself and add a personality in the creator.

## What grows
- 95 original vector motifs, interest/mood/biome compositions and progressively unlocked vocabulary. Open Gallery → drawing motifs to inspect the full library.
- Every individual has paired genes, a distinct appearance and 24 personality traits. Use From description or Randomize in the creator. Supported animal/robot/alien/mushroom shapes and accessories are generated locally; freehand strokes are preserved until you explicitly replace them. Description interpretation uses keywords, not an image model.
- Doodles choose to found, join, refuse, stay in or leave circles. Trust, shared values, loyalty, independence and danger influence membership. A rally invites willing allies; others can refuse. The inspector shows each character’s decision and reason.
- Novices start with zero skills and knowledge. Practice, outcomes and aptitude develop skills, action values and knowledge. Learned skills are individual; children inherit alleles and visual traits, not their parents’ learned experience. Family growth needs adults, mutual trust, resources and shelter; direct relatives cannot become parents together.
- Buildings have generated blueprints and five upgrade levels with real durability. Hostile agents can attack, destroy buildings and leave ruins. Friendly sparring requires willingness and remains nonlethal; hostile attacks can kill. Cautious injured doodles can retreat. Deceased characters retain family and ownership history.
- Food, water and ink deplete and regenerate. Biomes, seasons, weather and day/night affect activity. Social doodles gravitate toward their homes/circles; independent explorers roam.

These are bounded local procedural systems with experience learning, not neural training, sentience or a learned physics model. The 2,400,000 × 2,400,000 world is 100 times wider than before (10,000 times the area), shown by the same globe and 2D projections. Terrain rendering uses a bounded visible tile grid. Limits: 100 living residents, 240 lifetime stories, 600 buildings and 1,200 artwork records; automatic arrivals stop at 32 living residents. This is not a claim to simulate millions of agents.

Worlds remain device-local and stop advancing while closed. Export/import preserves genes, family, drawings, decisions and progress. Version 1 and 2 saves migrate automatically. Shared multiplayer requires a future authoritative server, identity, synchronized commands, persistence and conflict resolution; it is not implemented in this version.

## Optional Groq
Configure `GROQ_API_KEY` as a server secret and `GROQ_MODEL` as a supported chat model. Provision the `DB` D1 binding and apply the checked-in schema migration. A manual click sends one compact snapshot for up to 12 doodles, prioritizing the selected doodle and characters with older plans. Groq can return bounded actions, motif recipes, social targets and thoughts. Local simulation executes them; no executable model code or external artwork URLs are accepted.

The global atomic quota defaults to five attempts per UTC day, with a 60-second cooldown. Failed attempts count. No automatic requests or retries. Missing key/model, identity or quota storage disables external planning. The growing simulation works without it. Live Groq integration remains untested until a key is supplied.

`npm test`, `npm run build`, `npm run validate`. See PROJECT.md, QA.md and AGENTS.md.
