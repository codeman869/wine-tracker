require('dotenv').config();
const express = require('express');
const cors  = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.port || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.get('/api/wines', async (req,res) => {

    const result = await pool.query('SELECT * FROM wines');
    res.json(result.rows);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));