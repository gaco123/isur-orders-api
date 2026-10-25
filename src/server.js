'use strict';

const app = require('./app');
const config = require('./config');
const db = require('./db');

const server = app.listen(config.port, () => {
    console.log(`[server] isur-orders-api escuchando en :${config.port} (${config.nodeEnv})`);
});

async function shutdown(signal) {
    console.log(`[server] recibido ${signal}, cerrando...`);
    server.close(async () => {
        await db.close();
        process.exit(0);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));