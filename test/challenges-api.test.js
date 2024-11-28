import { describe, it, expect, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { getAllChallenges, readChallengesFile, getChallengeById } from '../Challenges-api/challengesController/challengesController.js';

// Mock the `fs` module
vi.mock('fs', () => ({
    promises: {
        readFile: vi.fn(),
    },
}));

describe('Challenges API Tests', () => {
    describe('readChallengesFile', () => {
        it('should read and parse the challenges file correctly', async () => {
            const mockChallenges = JSON.stringify([{ id: 1, name: 'Challenge 1' }]);
            fs.readFile.mockResolvedValueOnce(mockChallenges);

            const result = await readChallengesFile();

            expect(fs.readFile).toHaveBeenCalledWith(
                path.join(__dirname, '../Challenges-api/challenges.json'),
                'utf-8'
            );
            expect(result).toEqual([{ id: 1, name: 'Challenge 1' }]);
        });

        it('should throw an error if reading the file fails', async () => {
            const error = new Error('File not found');
            fs.readFile.mockRejectedValueOnce(error);

            await expect(readChallengesFile()).rejects.toThrow('File not found');
        });
    });

    describe('getAllChallenges', () => {
        it('should return all challenges', async () => {
            const mockChallenges = [
                { id: 1, name: 'Challenge 1' },
                { id: 2, name: 'Challenge 2' },
            ];
            fs.readFile.mockResolvedValueOnce(JSON.stringify(mockChallenges));

            const req = {};
            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn(),
            };

            await getAllChallenges(req, res);

            expect(fs.readFile).toHaveBeenCalledWith(
                path.join(__dirname, '../Challenges-api/challenges.json'),
                'utf-8'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockChallenges);
        });

        it('should return 500 if fetching challenges fails', async () => {
            const error = new Error('Fetching error');
            fs.readFile.mockRejectedValueOnce(error);

            const req = {};
            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn(),
            };

            await getAllChallenges(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'Failed to fetch challenges' });
        });
    });

    describe('getChallengeById', () => {
        it('should return a challenge when called with a valid ID', async () => {
            const mockChallenges = [
                { id: 1, name: 'Challenge 1' },
                { id: 2, name: 'Challenge 2' },
                { id: 3, name: 'Challenge 3' },
                { id: 4, name: 'Challenge 4' },
                { id: 5, name: 'Challenge 5' }
            ];
            fs.readFile.mockResolvedValueOnce(JSON.stringify(mockChallenges));

            const req = { params: { id: '1' } };
            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn(),
                json: vi.fn()
            };

            await getChallengeById(req, res);

            expect(fs.readFile).toHaveBeenCalledWith(
                path.join(__dirname, '../Challenges-api/challenges.json'),
                'utf-8'
              );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Challenge 1' });
        });

        it('should return 404 if the challenge is not found by ID', async () => {
            const mockChallenges = [
                { id: 1, name: 'Challenge 1' },
                { id: 2, name: 'Challenge 2' },
            ];
            fs.readFile.mockResolvedValueOnce(JSON.stringify(mockChallenges));

            const req = { params: { id: '99' } }; //nonexistend ID
            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn(),
            };

            await getChallengeById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ error: 'Challenge not found' });
        });

        it('should return 500 if there is an error reading the file', async () => {
            fs.readFile.mockRejectedValueOnce(new Error('File read error'));

            const req = { params: { id: '1' } };
            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn(),
            };

            await getChallengeById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'Failed to fetch challenge' });
        });
    });
});
