# Doodleworld

A growing ink-and-paper sandbox: doodles invent little drawings, build their own houses, form friendships and grudges, and find circles to belong to.

## Play
`npm run dev`, then open http://localhost:4173. No dependencies or key required.

Drag or WASD/arrows to pan; scroll or ＋/− to zoom. ◎ zooms out to the globe. Drag the globe to turn it; click a place or choose “Step into this place” to enter the same world in 2D. Home returns to the first meadow. Space pauses. The notebook lets you inspect doodles, their artwork and circles. Draw yourself and add a personality in the creator.

## The simulation
Needs drive action: hunger/thirst, shelter, safety, belonging and purpose. Households have finite beds. Agents compare population, food and projects, then learn, gather inputs and build what is missing. Construction/farming/crafting require actual learned proficiency; nearby skilled residents can teach. Farms grow eight crops over time and need water. Six functional building categories and twelve tool/weapon recipes have generated variation and real effects. Roles, supported leaders, voluntary campaigns and basic territory occupation grow from the same state.

Children inherit genes and appearance, start without learned professions, and receive care/food from family. Randomize combines ten base species, many descriptions and continuously variable proportions/features. Freehand creation remains. Decorative map art is no longer generated or rendered; old artwork is retained in exports.

Read [SIMULATION.md](SIMULATION.md) for concrete rules, prerequisites, learning, parentage, territory and limits. The world remains a bounded local simulation, not neural training, self-modifying code or human-level intelligence. The same 2,400,000 × 2,400,000 planet supports globe and 2D views.

## Saved individual brains
Each character retains goals, proficiencies, episodes, contextual action values, personality, memories, genes and relationships. Device saves and JSON export work offline. Signed-in hosted play can checkpoint the world to D1 every 30 seconds; revisions prevent silent overwrites between sessions. GitHub stores the brain implementation. Runtime development is saved as state, not code commits. Version 1–3 saves migrate to version 4.

The simulation stops while closed. Shared multiplayer and an authoritative persistent server tick remain future work. This version supports 100 living residents, 240 lifetime records, 600 buildings, 300 fields and 100 claims.

## Optional Groq
Configure `GROQ_API_KEY` as a server secret and `GROQ_MODEL` as a supported chat model. Provision the `DB` D1 binding and apply the checked-in schema migration. A manual click sends one compact snapshot for up to 12 doodles, prioritizing the selected doodle and characters with older plans. Groq can return bounded actions, productive job suggestions, social targets and thoughts. Local simulation executes them; no executable model code or external artwork URLs are accepted.

The global atomic quota defaults to five attempts per UTC day, with a 60-second cooldown. Failed attempts count. No automatic requests or retries. Missing key/model, identity or quota storage disables external planning. The growing simulation works without it. Live Groq integration remains untested until a key is supplied.

`npm test`, `npm run build`, `npm run validate`. See PROJECT.md, QA.md and AGENTS.md.
