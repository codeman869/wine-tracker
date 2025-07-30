const session = require('express-session')
const pgSession = require('connect-pg-simple')(session);

const pool = require('../db/pool');

const sessionMiddleware = session({
    store: new pgSession({
        pool: pool,
        tableName: 'user_sessions' 
    }),
    secret: process.env.SESSION_SECRET || 'keyboard kitty',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV == 'prod',
        maxAge: 1000 * 60 * 15,
    } 
});

module.exports = sessionMiddleware;