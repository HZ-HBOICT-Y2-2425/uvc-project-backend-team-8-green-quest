import { describe, it, expect, vi } from 'vitest';
import { executeSqlFile, getAllItems, seedDatabase } from '../../shop-api/controller/itemController.js';
import db from '../../shop-api/db.js';
import fs from 'fs/promises';
import path from 'path';

// Mock the db module
vi.mock('../../shop-api/db.js', () => ({
    default: {
        query: vi.fn(), // Mock the `query` method
    },
}));
// Mock the fs module
vi.mock('fs/promises');

describe('executeSqlFile', () => {
    it('executeSqlFile should execute a SQL file', async () => {
        // Ensure the SQL string is trimmed and consistent in format
        const mockSQL = `
            CREATE TABLE IF NOT EXISTS test_table (id INT);INSERT INTO Items (id, name) VALUES (1, "Item 1");
        `.trim(); // Trim leading and trailing whitespace
        
        const mockFileName = 'seed-shop.sql';
        const mockFilePath = path.join(__dirname, '../../shop-api/database/seed-shop.sql'); // Correct path used by the code
        
        // Mock fs and db behavior
        fs.readFile.mockResolvedValueOnce(mockSQL);
        db.query.mockResolvedValue({}); // Mock query success
        
        await executeSqlFile(mockFileName);
        
        expect(fs.readFile).toHaveBeenCalledWith(mockFilePath, 'utf-8');
        expect(db.query).toHaveBeenCalledWith('CREATE TABLE IF NOT EXISTS test_table (id INT)');
        expect(db.query).toHaveBeenCalledWith('INSERT INTO Items (id, name) VALUES (1, "Item 1")');
        expect(db.query).toHaveBeenCalledTimes(2);
    });
    

    it('should throw an error if file not found', async () => {
        fs.readFile.mockRejectedValueOnce(new Error('File not found'));

        await expect(executeSqlFile('../../database/database.sql')).rejects.toThrow('File not found');  // Adjusted path with `../`
    });

    it('should throw an error if query fails', async () => {
        fs.readFile.mockResolvedValueOnce('CREATE TABLE IF NOT EXISTS test_table (id INT);');
        db.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(executeSqlFile('database.sql')).rejects.toThrow('Query failed');
    });
});

describe('getAllItems', () => {
    it('should fetch all items successfully', async () => {
        const mockItems = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 3' },
            { id: 3, name: 'Item 3' }
        ];
          
    
        // Mock the database query to return mockItems within a `rows` property.
        db.query.mockResolvedValueOnce(mockItems);
    
        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        // Call the function
        await getAllItems(req, res);
    
        // Check the calls to status and json
        expect(res.status).toHaveBeenCalledWith(200); // Should be called with 200
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Items fetched successfully',
            data: mockItems, // Ensure data matches the mock
        });
    });
    
    
    it('should return 500 if an error occurs', async () => {
        // Simulate a database error
        db.query.mockRejectedValueOnce(new Error('Database error'));
    
        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    
        await getAllItems(req, res);
    
        // Ensure 500 is returned if there's an error
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: 'Database error',  // This now matches the actual response
            message: 'Failed to fetch items from the database',
        });
    });
    
    

    it('should handle database query errors', async () => {
        db.query.mockRejectedValueOnce(new Error('Database query failed'));

        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };

        await getAllItems(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Failed to fetch items from the database',
            error: 'Database query failed',
        });
    });
});

describe('seedDatabase', () => {
    it('should seed the database successfully', async () => {
        const mockSQL = 'INSERT INTO Items (id, name) VALUES (1, "Item 1");';
        fs.readFile.mockResolvedValueOnce(mockSQL);
        db.query.mockResolvedValueOnce([{ rows: [] }]);

        await seedDatabase();

        expect(fs.readFile).toHaveBeenCalledWith(path.join(__dirname, '../../shop-api/database/seed-shop.sql'), 'utf-8');  // Adjusted path with `../`
        expect(db.query).toHaveBeenCalledWith('INSERT INTO Items (id, name) VALUES (1, "Item 1")');
    });

    it('should handle errors during seeding', async () => {
        fs.readFile.mockRejectedValueOnce(new Error('File not found'));

        await expect(seedDatabase()).rejects.toThrow('File not found');
    });
});
