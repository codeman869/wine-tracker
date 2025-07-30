const express = require('express');
const router = express.Router();

const authRoutes  = require('./auth');
const wineRoutes = require('./wine');

router.use('/auth', authRoutes);
router.use('/wines', wineRoutes);

module.exports = router;