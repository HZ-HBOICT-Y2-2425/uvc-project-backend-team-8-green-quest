import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import nock from 'nock';
import apiGateway from '/usr/src/app/routes/index.js';

let server;

beforeAll(() => {
    const app = express();
    app.use(apiGateway);
    server = app.listen(3009); // Start the server

    // mokc HTTP requests
    nock('http://microservice:3011')
        .get('/')
        .reply(200, { message: 'Mocked response from microservice' });

    nock('http://challenges-api:3012')
        .get('/')
        .reply(200, { message: 'Mocked response from challenges-api' });

    nock('http://shop-api:3013')
        .get('/')
        .reply(200, { message: 'Mocked response from shop-api' });
});

//close the server and clean all mock after the tests
afterAll(() => {
    server.close(); 
    nock.cleanAll(); 
});

describe('API Gateway', () => {
    it('should respond to /health with a success message', async () => {
        const res = await request(server).get('/health');
        expect(res.status).toBe(200);
        expect(res.text).toBe('API Gateway is running!');
    });

    it('should proxy requests to /microservice', async () => {
        const res = await request(server).get('/microservice');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Mocked response from microservice' });
    });

    it('should proxy requests to /challenges', async () => {
        const res = await request(server).get('/challenges');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Mocked response from challenges-api' });
    });

    it('should proxy requests to /items', async () => {
        const res = await request(server).get('/items');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Mocked response from shop-api' });
    });
});