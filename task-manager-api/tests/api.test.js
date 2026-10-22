const request = require('supertest');
const app = require('../server');

describe('Task Management API - CI/CD Automated Test Suite', () => {

    // Test 1: Root welcome endpoint returns status 200
    test('GET / returns 200 and API metadata', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('endpoints');
    });

    // Test 2: Practical 12 Required Test - GET /tasks returns 200 (FIXED)
    test('GET /tasks returns 200', async () => {
        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200); // FIXED: Correct expected HTTP status 200 OK
        expect(res.body).toHaveProperty('success', true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    // Test 3: Input validation check - POST /tasks without title returns 400
    test('POST /tasks fails with 400 when title is missing', async () => {
        const res = await request(app)
            .post('/tasks')
            .send({
                description: 'Test task without title'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

});
