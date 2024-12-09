import express from 'express';
import db from '../db.js';
import fs from 'fs/promises';
import path from 'path';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';

const app = express();
app.use(bodyParser.json());

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

        await db.query(
            `UPDATE User 
             JOIN Challenge ON Challenge.challengeID = ? 
             SET User.coins = User.coins + Challenge.coins 
             WHERE User.userID = ? AND User.challengeID = ?`,
            [challengeID, userID, challengeID]
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

export async function register(req, res) {
    console.log('Register endpoint hit');
    const { username, password } = req.body;

    if (!username || !password) {
        console.log('Missing fields:', { username, password });
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO Users (username, password) VALUES (?, ?)';
        db.query(query, [username, hashedPassword], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            console.log('User registered:', result);
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const query = 'SELECT * FROM Users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({ message: 'Login successful', token });
    });
}

export async function profile(req, res) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ message: 'Profile data', user: decoded });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
}
// Automatically execute database setup and seeding when the server starts
setupDatabase();

export default router;



