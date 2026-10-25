'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const config = require('../src/config');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'db', 'migrations');
const LOCK_KEY = 9273461; // advisory lock arbitrario

function sha256(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

async function ensureMigrationsTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
        version    VARCHAR(64) PRIMARY KEY,
        checksum   CHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

async function run() {
    const client = new Client({
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
        ssl: config.db.ssl ? { rejectUnauthorized: false } : false
    });

    await client.connect();
    console.log(`[migrate] conectado a ${config.db.host}:${config.db.port}/${config.db.database}`);

    // Advisory lock para evitar migradores concurrentes
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);

    try {
        await ensureMigrationsTable(client);

        const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();

        const { rows: applied } = await client.query(
        'SELECT version, checksum FROM schema_migrations'
        );
        const appliedMap = new Map(applied.map(r => [r.version, r.checksum]));

        let appliedCount = 0;

        for (const file of files) {
            const version = file.replace(/\.sql$/, '');
            const fullPath = path.join(MIGRATIONS_DIR, file);
            const sql = fs.readFileSync(fullPath, 'utf8');
            const checksum = sha256(sql);

            if (appliedMap.has(version)) {
                if (appliedMap.get(version) !== checksum) {
                    throw new Error(
                    `[migrate] La migración ${version} fue modificada (checksum mismatch). ` +
                    `Restaura el archivo y crea una nueva migración.`
                    );
                }
                continue;
            }

            console.log(`[migrate] aplicando ${version}...`);
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query(
                'INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)',
                [version, checksum]
                );
                await client.query('COMMIT');
                appliedCount++;
                console.log(`[migrate]   ok ${version}`);
            } catch (err) {
                await client.query('ROLLBACK');
                throw new Error(`[migrate] fallo en ${version}: ${err.message}`);
            }
        }

        console.log(`[migrate] completado. Migraciones nuevas aplicadas: ${appliedCount}`);
    } finally {
        await client.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]).catch(() => {});
        await client.end();
    }
}

run().catch(err => {
    console.error(err.message);
    process.exit(1);
});