'use strict';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

test.after(async () => { await db.close(); });

test('GET /api/v1/customers responde 200 y array', async () => {
    const res = await request(app).get('/api/v1/customers');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
});

test('POST /api/v1/customers rechaza document_number duplicado con 409', async () => {
    const doc = `T${Date.now()}`;
    const first = await request(app)
        .post('/api/v1/customers')
        .send({ document_number: doc, full_name: 'Test Uno' });
    assert.strictEqual(first.status, 201);

    const second = await request(app)
        .post('/api/v1/customers')
        .send({ document_number: doc, full_name: 'Test Dos' });
    assert.strictEqual(second.status, 409);
});