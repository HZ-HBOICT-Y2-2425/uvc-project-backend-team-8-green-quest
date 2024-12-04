import express from 'express';
import db from '../db.js';
import fs from 'fs/promises';
import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const router = express.Router();

// Utility to execute SQL files
export async function executeSqlFile(fileName) {
    const sqlFilePath = path.join(__dirname, `../../database/${fileName}`);
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

export async function getAllChallenges(req, res) {
    try {
        const { rows: challenges } = await db.query('SELECT * FROM Challenges');
        res.status(200).json({
            success: true,
            message: 'Items fetched successfully',
            data: challenges,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch challenges',
            error: error.message,
        });
    }
}

export async function getChallengeById(req, res) {
    try {
        const id = Number(req.params.id);

        const result = await db.query('SELECT * FROM Challenges WHERE challengeId = ?', [id]);

        if (result.length === 0) {
            return res.status(404).send({ error: 'Challenge not found' });
        }

        return res.status(200).json(result[0]);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch challenge due to server error' });
    }
}

export async function seedDatabase() {
    try {
        await executeSqlFile('seed-challenges.sql');
        console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

export async function setupDatabase() {
    try {
        console.log('Starting database setup...');

        await executeSqlFile('database.sql');

        await seedDatabase();

        console.log('Database setup and seeding completed successfully.');
    } catch (error) {
        console.error('Error setting up and seeding database:', error);
    }
}

// setup database automatically
setupDatabase();


