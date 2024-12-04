import express from 'express';
import db from '../db.js';
import fs from 'fs/promises';
import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const router = express.Router();

// Utility to execute SQL files
export async function executeSqlFile(fileName) {
    const sqlFilePath = path.join(__dirname, `../database/${fileName}`);
    console.log(`Attempting to read SQL file from: ${sqlFilePath}`);

    try {
        const sql = await fs.readFile(sqlFilePath, 'utf-8');
        const queries = sql.split(';').filter(query => query.trim() !== '');

        for (let query of queries) {
            await db.query(query); 
        }
        
        console.log(`${fileName} executed successfully.`);
    } catch (error) {
        console.error(`Error executing SQL file ${fileName}:`, error);
        throw error;
    }
}

// Controller to get all items from the database
export async function getAllItems(req, res) {
    try {
        // Assume db.query returns an array of items directly, not wrapped in `rows`
        const items = await db.query('SELECT * FROM Items');
        
        res.status(200).json({
            success: true,
            message: 'Items fetched successfully',
            data: items, // Use the result directly without `.rows`
        });
    } catch (error) {
        console.error('Database query error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch items from the database',
            error: error.message,
        });
    }
}

// Controller to seed the database with SQL from seed-shop.sql
export async function seedDatabase() {
    try {
        // Pass the file name to be executed
        await executeSqlFile('seed-shop.sql');
        console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

// Database setup and seeding on startup
export async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        
        // Execute the primary database setup script
        await executeSqlFile('database.sql');

        // Then seed the database
        await seedDatabase();

        console.log('Database setup and seeding completed successfully.');
    } catch (error) {
        console.error('Error setting up and seeding database:', error);
    }
}

// Automatically execute database setup and seeding when the server starts
setupDatabase();

export default router;



