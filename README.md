# Doodleworld

A growing ink-and-paper sandbox: doodles invent little drawings, build their own houses, form friendships and grudges, and find circles to belong to.

## Play
`npm run dev`, then open http://localhost:4173. No dependencies or key required.

Drag or WASD/arrows to pan; scroll or ＋/− to zoom. ◎ zooms out to the globe. Drag the globe to turn it; click a place or choose “Step into this place” to enter the same world in 2D. Home returns to the first meadow. Space pauses. The notebook lets you inspect doodles, their artwork and circles. Draw yourself and add a personality in the creator.

## What grows
- Procedural drawings combine motifs from interests, emotions, biome, weather and artwork observed nearby. Skill affects stroke quality; new artwork seeks a clear patch of paper.
- Buildings have varied generated blueprints. Food, water and ink are real depleting/regenerating resources. Biomes, weather, seasons and day/night influence activity.
- Conversations change trust. Conflicts create anger and grudges; apologies repair bonds. Three mutual friendships can form a circle. Hostility can make members leave.
- Settlements with shelter and social ties can attract newcomers. Experience updates action preferences; curiosity keeps new activities possible.

These are local procedural and rule-based systems with experience learning, not neural training or a learned physics model. The 24,000 × 24,000 world has bounds of 80 doodles, 300 buildings and 400 artwork records; automatic newcomers stop at 32. It stays device-local, and stops advancing while closed. Export/import backs up sketches, progress and society. Existing version 1 saves migrate automatically.

## Optional Groq
Configure `GROQ_API_KEY` as a server secret and `GROQ_MODEL` as a supported chat model. Provision the `DB` D1 binding and apply the checked-in schema migration. A manual click sends one compact snapshot for up to 12 doodles, prioritizing the selected doodle and characters with older plans. Groq can return bounded actions, motif recipes, social targets and thoughts. Local simulation executes them; no executable model code or external artwork URLs are accepted.

The global atomic quota defaults to five attempts per UTC day, with a 60-second cooldown. Failed attempts count. No automatic requests or retries. Missing key/model, identity or quota storage disables external planning. The growing simulation works without it. Live Groq integration remains untested until a key is supplied.

`npm test`, `npm run build`, `npm run validate`. See PROJECT.md, QA.md and AGENTS.md.
