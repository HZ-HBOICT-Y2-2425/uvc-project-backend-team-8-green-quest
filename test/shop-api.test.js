import { describe, it, expect, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { readChallengesFile, getAllItems } from '../shop-api/controller/itemController.js';

vi.mock('fs', () => ({
    promises: {
        readFile: vi.fn(),
    },
}));

describe('Shop API tests', () => {
    describe('readChallengesFile', () => {
        it('should read and parse the item file correctly', async () => {
            const mockChallenges = JSON.stringify([{ id: 1, name: 'Item 1' }]);
            fs.readFile.mockResolvedValueOnce(mockChallenges);

            const result = await readChallengesFile();

            expect(fs.readFile).toHaveBeenCalledWith(
                path.join(__dirname, '../shop-api/shop.json'),
                'utf-8'
            );
            expect(result).toEqual([{ id: 1, name: 'Item 1' }]);
        });

        it('should throw an error if reading the file fails', async () => {
            const error = new Error('File not found');
            fs.readFile.mockRejectedValueOnce(error);

            await expect(readChallengesFile()).rejects.toThrow('File not found');
        });
    });

    describe('return all of the items in the shop', () => {
        it('should return all of the items in the shop', async () => {
            const mockItems = ([
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
                { id: 3, name: 'Item 3' }
            ]);

            fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

            const req = {};
            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn(),
            };

            await getAllItems(req, res);

            expect(fs.readFile).toHaveBeenCalledWith(
                path.join(__dirname, '../shop-api/shop.json'), 'utf-8'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockItems);
        });

        it('should return 500 error if it can not fetch data', async () => {
            const error = new Error('Fetching error');

            fs.readFile.mockRejectedValueOnce(error);

            const req = {};
            const res = {
                status: vi.fn().mockReturnThis(),
                send: vi.fn(),
            };

            await getAllItems(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ error: 'Failed to fetch challenges' });

        })
    });
});