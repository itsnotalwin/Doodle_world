# Hosting
Stores the Sites project identity and logical storage declarations. `hosting.json` is deployment configuration, never secret storage. Preserve its project_id; update runtime secrets with the Sites connector. DB is only for a global daily Groq request cap. Player worlds stay in browser storage and JSON exports. Build copies the manifest into the deploy archive.
