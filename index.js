require('dotenv').config();
const path  = require('node:path');
const fs = require('node:fs');
const express = require('express');
const cors  = require('cors');

const middleWare = require('./middleware');
const routes = require('./routes');
const pool = require('./db/pool');

async function runSeed() {
    const sql = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql')).toString();
    await pool.query(sql);
    console.log('✅ Database initialized or already seeded');
}

runSeed().catch(err => console.error('❌ seeding database failed', err));


const app = express();
const PORT = process.env.port || 5000;

app.use(cors());
app.use(express.json());
app.use(middleWare);

app.use('/api', routes)

app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.get(/(.*)/, (req,res) => (
    res.sendFile(path.join(__dirname, 'client','dist', 'index.html'))
));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));