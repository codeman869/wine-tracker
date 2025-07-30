const express = require('express');
const router = express.Router();
const requireAuth  = require('../middleware/requireAuth');
const pool = require('../db/pool');

router.get('/', requireAuth, async (req,res) => {

    const result = await pool.query('SELECT * FROM wines');
    return res.json(result.rows);
});

module.exports = router;