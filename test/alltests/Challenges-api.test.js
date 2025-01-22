import { describe, it, expect, vi } from 'vitest';
import { executeSqlFile, getAllChallenges, seedDatabase } from '/usr/src/app/challengesController/challengesController.js'; // Added an extra `../` to the import
import db from '/usr/src/app/db.js'; // Added an extra `../` to the import
import fs from 'fs/promises';
import path from 'path';

// Mock the db module
vi.mock('../../Challenges-api/db.js', () => ({
    default: {
        query: vi.fn(), // Mock the `query` method
    },
}));
// Mock the fs module
vi.mock('fs/promises');

describe('executeSqlFile', () => {
    it('executeSqlFile should execute a SQL file', async () => {
        const mockSQL = `
            CREATE TABLE IF NOT EXISTS test_table (id INT); INSERT INTO Items (id, name) VALUES (1, "Item 1");
        `;
    
        const mockFileName = 'seed-challenges.sql';
        const mockFilePath = path.resolve(__dirname, '../../Challenges-api/database/seed-challenges.sql'); // Added `../` to the path
    
        // Mock fs and db behavior
        fs.readFile.mockResolvedValueOnce(mockSQL); // Mock the content of the SQL file
        db.query.mockResolvedValue({}); // Mock query success
    
        await executeSqlFile(mockFileName);
    
        // Assertions
        expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf-8');
    
        // Check for exact queries, trimming any unwanted spaces/newlines
        expect(db.query).toHaveBeenCalledWith(expect.stringMatching(/CREATE TABLE IF NOT EXISTS test_table \(id INT\)/)); 
        expect(db.query).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO Items \(id, name\) VALUES \(1, "Item 1"\)/)); 
        expect(db.query).toHaveBeenCalledTimes(2);
    });
    

    it('should throw an error if file not found', async () => {
        fs.readFile.mockRejectedValueOnce(new Error('File not found'));

        await expect(executeSqlFile('../../database/database.sql')).rejects.toThrow('File not found'); // Adjusted path with `../`
    });

    it('should throw an error if query fails', async () => {
        fs.readFile.mockResolvedValueOnce('CREATE TABLE IF NOT EXISTS test_table (id INT);');
        db.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(executeSqlFile('database.sql')).rejects.toThrow('Query failed');
    });
});

describe('getAllChallenges', () => {
    it('should fetch all items successfully', async () => {
        const challenges = [{ id: 1, name: 'Challenge 1' }];
        db.query.mockResolvedValueOnce([challenges]);
    
        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        await getAllChallenges(req, res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Items fetched successfully',
            data: challenges, // Updated to match the correct key and mock data
        });
    });
    

    it('should handle database query errors', async () => {
        db.query.mockRejectedValueOnce(new Error('Database query failed'));

        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        await getAllChallenges(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Failed to fetch challenges',
            error: 'Database query failed',
        });
    });
});

describe('seedDatabase', () => {
    it('should seed the database successfully', async () => {
        const mockSQL = 'INSERT INTO Items (id, name) VALUES (1, "Item 1")';
        fs.readFile.mockResolvedValueOnce(mockSQL);
        db.query.mockResolvedValueOnce({ rows: [] });
    
        // Adjusted mockFilePath to match actual resolution
        const mockFilePath = path.resolve(__dirname, '../../Challenges-api/database/seed-challenges.sql'); // Correct the path
    
        await seedDatabase();
    
        // Correct the assertion to match the path used in the code
        expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf-8');
        expect(db.query).toHaveBeenCalledWith(mockSQL);
    });
    

    it('should handle errors during seeding', async () => {
        fs.readFile.mockRejectedValueOnce(new Error('File not found'));

        await expect(seedDatabase()).rejects.toThrow('File not found');
    });
});
