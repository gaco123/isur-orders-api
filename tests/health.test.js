'use strict';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

test('GET /health/live responde 200', async () => {
    const res = await request(app).get('/health/live');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
});

test('GET /version responde con nombre y versión', async () => {
    const res = await request(app).get('/version');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.name, 'isur-orders-api');
});