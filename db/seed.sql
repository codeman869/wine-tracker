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