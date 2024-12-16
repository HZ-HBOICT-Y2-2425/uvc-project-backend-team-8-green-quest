import express from 'express';
import db from '../db.js';
import fs from 'fs/promises';
import path from 'path';
import { error } from 'console';

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

export async function getAllChallenges(req, res) {
    try {
        const [challenges] = await db.query('SELECT * FROM Challenges');
        res.status(200).json({
            success: true,
            message: 'Items fetched successfully',
            data: challenges 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch challenges',
            error: 'Database query failed'
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

export async function complete(req, res) {
    const challengeID = Number(req.params.id); 
    const userID = 1;

    if (!userID || !challengeID) {
        return res.status(400).json({ error: "challengeID is required" });
    }

    try {
        // Fetch challenge details
        const [challenge] = await db.query(
            'SELECT CO2_reduction_kg, coins FROM Challenges WHERE challengeID = ?', 
            [challengeID]
        );
    
        if (!challenge || challenge.length === 0) {
            return res.status(404).json({ error: "Challenge not found" });
        }
    
        const co2Reduction = parseFloat(challenge[0].CO2_reduction_kg);
        const coins = parseFloat(challenge[0].coins);
    
        await db.query('UPDATE Users SET co2Saved = co2Saved + ? WHERE userID = ?', [co2Reduction, userID]);
        await db.query('UPDATE Users SET coins = coins + ? WHERE userID = ?', [coins, userID]);
        await db.query('INSERT INTO ChallengeUser(userID, challengeID) VALUES ( ?, ?) ', [userID, challengeID]);

        //SOLVE: that sql code is not being executed
        try {
            const updateResult = await db.query(
        'UPDATE ChallengeUser SET completed = 1 WHERE challengeID = ? AND userID = ?', 
        [challengeID, userID]
         );
          } catch (error) {
            console.error('Error during update:', error);
        }
    
        const [updatedStatus] = await db.query(
            'SELECT completed FROM ChallengeUser WHERE challengeID = ? AND userID = ?', 
            [challengeID, userID]
        );

        const completed = updatedStatus.length > 0 ? updatedStatus[0].completed : false;
    
        res.json({
            success: true,
            message: 'Challenge completed',
            co2Reduction,
            coins,
            completed,
        });
    } catch (error) {
        console.error('Error completing challenge', error);
        res.status(500).json({ error: 'An error occurred while completing the challenge' });
    }
}

export async function status(req, res) {
    const userID = 1; // Replace with dynamic user ID as needed

    try {
        // Query the database for challenges where `completed` is true
        const [statuses] = await db.query(
            'SELECT challengeID, completed FROM ChallengeUser WHERE completed = ? AND userID = ?',
            [1, userID] // Use 1 for true if `completed` is stored as TINYINT(1)
        );

        if (!statuses || statuses.length === 0) {
            return res.status(404).json({ message: "No completed challenges found" });
        }

        res.status(200).json(statuses);
    } catch (error) {
        console.error('Error fetching challenge statuses:', error);
        res.status(500).json({ error: 'Failed to fetch challenge statuses' });
    }
}


// setuo database automatically
setupDatabase();