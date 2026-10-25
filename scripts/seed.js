'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const config = require('../src/config');

const SEED_FILE = path.join(__dirname, '..', 'db', 'seeds', '001_demo_data.sql');

async function run() {
    if (config.nodeEnv === 'production') {
        console.error('[seed] Bloqueado: no se ejecuta seed en producción.');
        process.exit(1);
    }

    const sql = fs.readFileSync(SEED_FILE, 'utf8');
    const client = new Client({
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
        ssl: config.db.ssl ? { rejectUnauthorized: false } : false
    });

    await client.connect();
    try {
        await client.query(sql);
        console.log('[seed] datos de demostración cargados.');
    } finally {
        await client.end();
    }
}

run().catch(err => {
    console.error('[seed] error:', err.message);
    process.exit(1);
});