'use strict';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

test.after(async () => { await db.close(); });

test('POST /api/v1/orders con customer_id inexistente responde 422', async () => {
    const res = await request(app)
        .post('/api/v1/orders')
        .send({ customer_id: 999999999, total: 10.0 });
    assert.strictEqual(res.status, 422);
});

test('POST /api/v1/orders con channel inválido responde 422', async () => {
    // Crear un cliente válido primero
    const doc = `O${Date.now()}`;
    const cust = await request(app)
        .post('/api/v1/customers')
        .send({ document_number: doc, full_name: 'Cliente Orders' });
    assert.strictEqual(cust.status, 201);

    const res = await request(app)
        .post('/api/v1/orders')
        .send({ customer_id: cust.body.id, total: 5.0, channel: 'INVALIDO' });
    assert.strictEqual(res.status, 422);
});