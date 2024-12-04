import supertest from "supertest";
import { vi, describe, it, expect, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const GatewayURL = 'http://localhost:3010';

describe('Api Gateway tests', () => {
    it('should proxy requests to challenges-api when accessing /challenges', async () => {
        const expectedChallengesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../Challenges-api/challenges.json'), 'utf-8'));
        const response = await supertest(GatewayURL)
            .get('/challenges')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toEqual(expectedChallengesData);
    });

    it('should proxy requests to shop-api when accessing /items', async () => {
    // Read the contents of shop.json from the shop-api directory
        const expectedShopData = JSON.parse(fs.readFileSync(path.join(__dirname, '../shop-api/shop.json'), 'utf-8'));
        // Send a GET request to the /items
        const response = await supertest(GatewayURL)
            .get('/items') // route for the shop API
            .expect('Content-Type', /json/) // Match the content type
            .expect(200);  // Expect status code 200

        // Compare the response body to the contents of shop.json
        expect(response.body).toEqual(expectedShopData); // Compare with the shop.json data
    });

    it('should handle 404 from challenges-api', async () => {
        const response = await supertest(GatewayURL)
            .get('/challenges/999') // A request for a non-existent challenge
            .expect(404);

        expect(response.body.error).toBe('Challenge not found');
    });
});