'use strict';

const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
    console.error('[db] Error inesperado en el pool:', err.message);
});

async function query(text, params) {
    return pool.query(text, params);
}

async function checkHealth() {
    const result = await pool.query('SELECT 1 AS ok');
    return result.rows[0].ok === 1;
}

async function close() {
    await pool.end();
}

module.exports = { pool, query, checkHealth, close };