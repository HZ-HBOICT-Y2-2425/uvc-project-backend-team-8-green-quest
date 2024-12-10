import express from 'express';
import db from '../db.js';
import fs from 'fs/promises';
import path from 'path';
import { error } from 'console';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const router = express.Router();

// Utility to execute SQL files
async function executeSqlFile(fileName) {
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

export async function getAllChallenges(req, res) {
    try {
        const [challenges] = await db.query('SELECT * FROM Challenges');
        res.status(200).send(challenges);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch challenges' });
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

export async function complete(req, res) {
    const challengeID = Number(req.params.id); 

    console.log(challengeID);

    if (!challengeID) {
        return res.status(400).json({ error: "challengeID is required" });
    }

    try {
        const [challenge] = await db.query(
            'SELECT CO2_reduction_kg, coins FROM Challenges WHERE challengeID = ?', [challengeID]
        );

        if (challenge.length === 0) {
            return res.status(404).json({ error: "Challenge not found" });
        }

        const co2Reduction = parseFloat(challenge[0].CO2_reduction_kg);
        const coins = parseFloat(challenge[0].coins);

        await db.query(
            'UPDATE Users SET co2Saved = co2Saved + ? WHERE userID = 1', [co2Reduction]
        );

        await db.query(
            'UPDATE Users SET coins = coins + ? WHERE userID = 1', [coins]
        );

        res.json({
            success: true,
            message: 'Challenge completed',
            co2Reduction,
            coins 
        });
    } catch (error) {
        console.error('Error completing challenge', error);
        res.status(500).json({ error: 'An error occurred while completing the challenge' });
    }
}


// setuo database automatically
setupDatabase();


