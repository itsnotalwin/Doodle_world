# Database migrations
Owns the hosted global Groq request allowance. The schema tracks a single counter per UTC day and last request time; it does not store characters, descriptions, drawings or secrets. `0000_brain_budget.sql` is schema-only. Apply through Sites deployment before enabling Groq; missing quota storage fails closed. Preserve applied migrations and add later changes as new files.
