# Doodleworld simulation contract

This is the implemented version 4 model, not a promise of unbounded intelligence. Source lives in GitHub; individuals develop distinct runtime state. A real local simulator executes every outcome. Groq is an optional, scarce high-level suggestion source, with survival and skill prerequisites enforced locally.

## Causal priorities

1. Survive: thirst → carried water/well/natural water; hunger → carried food/granary/foraging; exhaustion or injury → rest/retreat.
2. Assess the settlement: count local or affiliated living people, completed beds, planned beds, carried food, granary reserves, growing crops, ready harvests and useful facilities.
3. Respond to shortages: learn the needed skill, gather inputs, then construct/plant/craft. Existing projects count so everyone does not queue redundant housing.
4. Develop individual wants: belonging, family, security, exploration and mastery compete according to personality, needs, learned outcomes and small stochastic variation.
5. Reconsider social choices independently. Individuals may refuse membership and war. A leader does not own members’ choices.

Example: two residents can occupy one two-bed cottage. A third resident creates a shortage. A novice cannot conjure another house: construction study → timber → stone → build → beds assigned. A food shortage can similarly cause farming study → seed planting → watering → growth → harvest → supplies → eating. These chains are checked behaviorally.

## Individual state and learning

| State | Meaning |
| --- | --- |
| Needs | Food, water, shelter, safety, belonging, purpose; energy and health remain separate |
| Personality | 24 genetic and description-biased dispositions |
| Proficiencies | Foraging, construction, farming, crafting, warfare, medicine and leadership |
| Brain | Current goal/reason, study topic, selected recipe, mentor, decision count, 16 recent action/outcome episodes, context-specific action values |
| Inventory | Food, water, wood, stone, fibre, seed; finite quantities |
| Equipment | Up to six variant items with material, quality, durability and functional statistics |
| Household | Assigned house ID; each finished house has a finite resident list and capacity |
| History | Memories, trust, age, genes, parents, generation, birth/death and previous action values |

New individuals have zero learned professions. They experiment, practise, use skills or study with a more skilled nearby teacher. Teaching accelerates actual proficiency and records the mentor. Passive age does not unlock construction. Walking develops movement through use. Generic world knowledge summarizes learned abilities; it does not replace their prerequisites. Optional action-learning can be disabled while practice still develops skills, as the setting explains.

At an action boundary, the brain records need relief, action reward and effort. It updates a bounded value for the current need context and action, then chooses again. This is inspectable experience-based adaptation, not a neural network, sentience or autonomous source-code rewriting.

## Jobs and resources

| Job | Requirements | Consequence |
| --- | --- | --- |
| Forage / drink | Reach finite natural supplies or available stores | Actual food/water moves into inventory or satisfies a need |
| Gather timber / stone | Reach a nondepleted resource node | Inventory grows; node depletes; energy is spent |
| Study | Experiment, or reach a willing/nonhostile skilled neighbour | Named proficiency grows; real teaching is counted |
| Build | Construction ≥ 8, timber and stone, clear land | Paid materials become an unfinished project, then functional housing/facility |
| Plant | Farming ≥ 6, seed, available plot and clear land | Seed is consumed; a growing crop is created |
| Tend | Reach crops with carried water | Water is consumed; moisture and crop health improve |
| Harvest | Ripe living crop, physical work | Food and seed are produced; plot becomes fallow |
| Craft | Recipe-specific crafting level and inputs | Material is consumed; a varied tool, weapon or shield is created |
| Upgrade | Construction ≥ 16, timber and stone | Durability/quality/level improve; housing can gain beds |
| Fight | Combat allowed; campaigns additionally need training/equipment/provisions | Skill, injury, equipment wear, possible permanent non-graphic death |

Eight crops vary in time and yield: wheat, carrot, potato, cabbage, pumpkin, tomato, bean and rice. Rain replenishes moisture; heat dries plots; drought harms health; winter slows growth. Fields can be replanted. There is no instantaneous food from a field.

Six building categories: cottage, farmhouse, workshop, well, granary and tower. Their generated geometry varies in dimensions, roof, windows and material. Cottages begin with two beds; farmhouses with four. Wells store and replenish water. Granaries retain harvest overflow and feed residents who physically retrieve supplies. Workshops speed crafting. Housing supplies shelter and homes for family growth.

Twelve recipes: hoe, hammer, pickaxe, axe, club, spear, sling, shield, bow, sword, scythe and shovel. Tool bonuses affect their actual work; weapon damage and shield protection affect combat. There is no metal-smelting economy yet; current blades use stone/flint and timber. Items vary in shape/name, material, quality and durability.

## Roles and politics

Professions and temperament lead to farmer, builder, crafter, guard, scholar, forager or explorer roles. Children and novices remain identifiable. Leadership needs majority support from the members’ trust and independence; it can be lost. Leaders have a visible status/crown, with a gold sovereign treatment for a developed kingdom. Appearance-only costume crowns do not grant political authority.

A supported group with housing and agriculture can claim a bounded territory cell. Six or more members, a territory and learned leadership can constitute a kingdom. Hostility and an ambitious leader can motivate expansion. The group must have enough trained, armed, energetic, provisioned volunteers and food reserves before its strategy becomes ready. Each participant still weighs risk, empathy, loyalty and aggression. Unarmed/untrained followers do not magically become an army.

Territory capture requires at least two equipped, trained challengers and no equipped trained defenders for three consecutive 30-second occupation checks. Returning defenders reset progress. This is a basic territory/occupation system, not a complete diplomacy, siege, tax, law or national-economy model. Those require further explicit design and testing.

## Children and individual appearance

Children recombine parental alleles, with small mutation. Inherited appearance includes species and multiple face/body proportions, hair, ears, stance and markings. They inherit predispositions, not learned skill. Trusted parents can share food physically nearby. Young children stay near a living parent and learn basic survival before broader roles. Adult trust, food, health, cooldown, shelter and free household capacity constrain births. Close relatives cannot become parents together.

Randomize uses generated descriptions and genes, not four fixed drawings. Ten base species, combinatorial descriptions and continuously varied facial/body features produce distinct silhouettes. Deliberate descriptions constrain the result. Freehand characters remain supported; arbitrary freehand strokes are not interpreted as biological genes.

## Persistence and boundaries

The world runs while the page is active. Each doodle’s brain is part of its versioned save. Device saves and JSON export remain available offline. Signed-in hosted play adds owner-scoped D1 checkpoints, with chunked storage and optimistic revisions. Normal continuation can autosave every 30 seconds; divergent sessions require a deliberate version choice. A stale writer cannot overwrite the winning checkpoint. No GitHub token or Groq secret enters the browser, and runtime play does not create Git commits.

Legacy decorative artwork remains in old exports for compatibility but is no longer rendered, targeted or autonomously created. Only characters, geography/resources, functional projects/equipment, fields and political overlays belong in the current scene.

Current engineering limits: 100 living residents, 240 lifetime records, 600 building records, 300 fields, 100 territory claims and bounded per-agent memories/equipment. The 2,400,000 × 2,400,000 planet uses procedural terrain and visible-area rendering. It does not run millions of agents. Shared multiplayer, an authoritative server tick and background progress while closed are not implemented. Hosted checkpoint code is tested against real SQLite; a signed-in production restore still needs an end-user check.
