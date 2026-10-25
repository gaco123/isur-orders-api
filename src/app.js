'use strict';

const express = require('express');
const config = require('./config');
const db = require('./db');

const app = express();
app.use(express.json());

// Liveness: el proceso está vivo
app.get('/health/live', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Readiness: la app puede atender tráfico (valida BD)
app.get('/health/ready', async (req, res) => {
    try {
        await db.checkHealth();
        res.json({ status: 'ready', database: 'ok' });
    } catch (err) {
        res.status(503).json({ status: 'not_ready', error: err.message });
    }
});

app.get('/version', (req, res) => {
    res.json({
        name: 'isur-orders-api',
        version: config.version,
        commit: config.commit,
        env: config.nodeEnv
    });
});

// ---- Clientes ----
app.get('/api/v1/customers', async (req, res, next) => {
    try {
        const { rows } = await db.query(
        'SELECT id, document_number, full_name, email, created_at FROM customers ORDER BY id'
        );
        res.json(rows);
    } catch (err) { 
        next(err); 
    }
});

app.post('/api/v1/customers', async (req, res, next) => {
    const { document_number, full_name, email } = req.body || {};
    if (!document_number || !full_name) {
        return res.status(400).json({ error: 'document_number y full_name son obligatorios' });
    }
    try {
        const { rows } = await db.query(
        `INSERT INTO customers (document_number, full_name, email)
        VALUES ($1, $2, $3)
        RETURNING id, document_number, full_name, email, created_at`,
        [document_number, full_name, email || null]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') {
        return res.status(409).json({ error: 'El document_number ya existe' });
        }
        next(err);
    }
});

// ---- Pedidos ----
app.get('/api/v1/orders', async (req, res, next) => {
    try {
        const { rows } = await db.query(
        `SELECT id, customer_id, total, status, external_reference, channel, created_at
        FROM orders ORDER BY id`
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

app.post('/api/v1/orders', async (req, res, next) => {
    const { customer_id, total, status, external_reference, channel } = req.body || {};
    if (customer_id === undefined || total === undefined) {
        return res.status(400).json({ error: 'customer_id y total son obligatorios' });
    }
    try {
        const { rows } = await db.query(
        `INSERT INTO orders (customer_id, total, status, external_reference, channel)
        VALUES ($1, $2, COALESCE($3,'PENDING'), $4, $5)
        RETURNING id, customer_id, total, status, external_reference, channel, created_at`,
        [customer_id, total, status || null, external_reference || null, channel || null]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23503') { // foreign_key_violation
            return res.status(422).json({ error: 'customer_id no existe' });
        }
        if (err.code === '23514') { // check_violation
            return res.status(422).json({ error: 'channel inválido' });
        }
        next(err);
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('[app] error:', err.message);
    res.status(500).json({ error: 'Error interno' });
});

module.exports = app;