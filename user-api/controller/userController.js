import express from 'express';
import db from '../db.js';
import fs from 'fs/promises';
import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const router = express.Router();

export async function getAllUsers(req, res) {
    try {
        const [users] = await db.query('SELECT * FROM Users');
        res.status(200).send(users);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch users' });
    }
}

export async function getDailyChallenges(req, res) {
    try {
        const [lastInserted] = await db.query('SELECT * FROM ChallengeUser ORDER BY challengeUserID DESC LIMIT 1');
        const today = new Date().toISOString().split('T')[0];

        const formattedDate = new Date(lastInserted[0].dateAssigned).toISOString().split('T')[0];

        if (formattedDate == today) {
            res.status(200).send("No need to update challenges");
        }
        else {
            // Retrieve all challenges from the database
            const [challenges] = await db.query('SELECT * FROM Challenges');
            if (challenges.length < 3) {
                return res.status(400).send({ error: 'Not enough challenges available' });
            }

            // Get 3 random unique indices
            const randomIndices = getRandomIndices(challenges.length);

            // Map the indices to actual challenges
            const dailyChallenges = randomIndices.map(index => challenges[index]);

            for (let i = 0; i < 3; i++) {
                await db.query(
                    `INSERT INTO ChallengeUser (userID, challengeID, completed, dateAssigned) VALUES (?, ?, TRUE, ?)`,
                    [1, dailyChallenges[i].challengeID, today]
                    // userID needs to be updated with request userID
                );
            }

            const [challengeUsers] = await db.query('SELECT * FROM ChallengeUser');
            console.log(challengeUsers);
            res.status(200).send("DailyChallengesUpdated");
        }
    } catch (error) {
        console.error('Error fetching daily challenges:', error);
        res.status(500).send({ error: 'Failed to fetch daily challenges' });
    }
}

export async function completeChallenge(req, res) {
    try {
        const { userID, challengeID } = req.query;

        if (!userID || !challengeID) {
            return res.status(400).send({ error: 'UserID and ChallengeID are required' });
        }

        // Retrieve the most recent entry for this user and challenge
        const [challengeUser] = await db.query(
            'SELECT * FROM ChallengeUser WHERE userID = ? AND challengeID = ? ORDER BY challengeUserID DESC LIMIT 1',
            [userID, challengeID]
        );

        // Check if the challengeUser entry exists
        if (challengeUser.length === 0) {
            return res.status(404).send({ error: 'Challenge not found for the user' });
        }

        // Update the "completed" field to TRUE
        await db.query(
            'UPDATE ChallengeUser SET completed = TRUE WHERE challengeUserID = ?',
            [challengeUser[0].challengeUserID]
        );

        console.log(await db.query(
            'SELECT * FROM ChallengeUser WHERE userID = ? AND challengeID = ? ORDER BY challengeUserID DESC LIMIT 1',
            [userID, challengeID]
        ));

        res.status(200).send({ message: 'Challenge completed successfully' });
    } catch (error) {
        console.error('Error completing challenge:', error);
        res.status(500).send({ error: 'Failed to complete the challenge' });
    }
}


// Utility function to get 3 random unique indices
function getRandomIndices(arrayLength, count = 3) {
    if (arrayLength < count) {
        throw new Error('Not enough elements to extract unique indices.');
    }

    const indices = new Set();
    while (indices.size < count) {
        const randomIndex = Math.floor(Math.random() * arrayLength);
        indices.add(randomIndex);
    }

    return Array.from(indices);
}


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

// Controller to seed the database with SQL from seed-shop.sql
export async function seedDatabase() {
    try {
        // Pass the file name to be executed
        await executeSqlFile('seed-user.sql');
        console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

// Database setup and seeding on startup
async function setupDatabase() {
    try {
        console.log('Starting database setup...');

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



