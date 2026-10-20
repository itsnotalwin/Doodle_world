CREATE TABLE world_checkpoints (
 owner TEXT PRIMARY KEY NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1,
 token TEXT NOT NULL,
 parts INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE world_chunks (
 owner TEXT NOT NULL,
 token TEXT NOT NULL,
 part INTEGER NOT NULL,
 data TEXT NOT NULL,
 PRIMARY KEY (owner, token, part)
);
