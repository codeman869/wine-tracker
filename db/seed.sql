-- Wines table
CREATE TABLE IF NOT EXISTS wines (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER CHECK (year > 1000 AND year < 2100),
    varietal TEXT,
    region TEXT,
    notes TEXT,
    status TEXT CHECK (status IN ('owned', 'consumed')) DEFAULT 'owned',
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP   
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL
);

-- Credentials table
CREATE TABLE IF NOT EXISTS credentials (
    id TEXT PRIMARY KEY,
    user_id INTEGER references users(id),
    public_key BYTEA NOT NULL,
    transports TEXT[],
    counter INTEGER NOT NULL,
    credential_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invite Tokens
CREATE TABLE IF NOT EXISTS invite_tokens (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    used_at TIMESTAMP,
    used_by_user_id INTEGER references users(id)
);

-- Session Table
CREATE TABLE IF NOT EXISTS "user_sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey'
        ) THEN 
            ALTER TABLE "user_sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
        END IF;
    END
$$;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");