import express from 'express';
import db from '../db.js';
import fs from 'fs/promises';
import path from 'path';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
import dotenv from 'dotenv';
dotenv.config(); // This loads variables from your .env file


const app = express();
app.use(bodyParser.json());

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const router = express.Router();

// Function to purchase an item
export async function purchaseItem(req, res) {
    const { userId, itemId } = req.query;

    let width;
    let height;
    let posX;
    let posY;

    console.log('Purchase request received:', { userId, itemId });

    try {
        // Check if the user exists and fetch their current coin balance
        console.log('Fetching user coins...');
        const [userResult] = await db.query('SELECT coins FROM Users WHERE userID = ?', [userId]);
        console.log('User result:', userResult);
        if (!userResult || userResult.length === 0) {
            return res.status(404).send({ error: 'User not found' });
        }
        const userCoins = userResult[0].coins;

        // Check if the item exists and fetch its price
        console.log('Fetching item price...');
        const [itemResult] = await db.query('SELECT price FROM Items WHERE itemID = ?', [itemId]);
        console.log('Item result:', itemResult);
        if (!itemResult || itemResult.length === 0) {
            return res.status(404).send({ error: 'Item not found' });
        }
        const itemPrice = parseFloat(itemResult[0].price);

        // Check if the user has enough coins to purchase the item
        if (userCoins < itemPrice) {
            return res.status(400).send({ error: 'Insufficient coins' });
        }

        // Deduct the item's price from the user's coins
        await db.query('UPDATE Users SET coins = coins - ? WHERE userID = ?', [itemPrice, userId]);

        const [itemToAdd] = await db.query('SELECT * FROM Items WHERE itemID = ?', [itemId]);
        if (itemToAdd[0].category == "trees") {
            width = 70;
            height = 80;
            posY = 205;
        }
        else if (itemToAdd[0].category == "flowers") {
            width = 15;
            height = 30;
            posY = 305;
        } else if (itemToAdd[0].category == "bushes") {
            width = 50;
            height = 40;
            posY = 295;
        } else if (itemToAdd[0].category == "animals") {
            width = 30;
            height = 40;
            posY = 255;
        } else if (itemToAdd[0].category == "bugs") {
            width = 25;
            height = 25;
            posY = 305;
        }

        if (itemToAdd[0].category == "trees" || itemToAdd[0].category == "animals") {
            const [shopResult] = await db.query(
                'SELECT Shop.* FROM Shop JOIN Items ON Shop.itemID = Items.itemID WHERE Items.category IN (?, ?) AND Shop.userID = ? ORDER BY Shop.shopID DESC LIMIT 1',
                ['trees', 'animals', userId]
            );
            if (shopResult[0] != null) {
                posX = shopResult[0].posX + 100;
            } else {
                posX = 30;
            }
        }

        if (itemToAdd[0].category == "bushes" || itemToAdd[0].category == "flowers" || itemToAdd[0].category == "bugs") {
            const [shopResult] = await db.query(
                'SELECT Shop.* FROM Shop JOIN Items ON Shop.itemID = Items.itemID WHERE Items.category IN (?, ?, ?) AND Shop.userID = ? ORDER BY Shop.shopID DESC LIMIT 1',
                ['flowers', 'bushes', 'bugs', userId]
            );
            if (shopResult[0] != null) {
                posX = shopResult[0].posX + 30;
            } else {
                posX = 30;
            }
        }

        // Add the purchased item to the Shop table for the user
        await db.query(
            'INSERT INTO Shop (itemID, userID, posX, posY, width, height) VALUES (?, ?, ?, ?, ?, ?)',
            [itemId, userId, posX, posY, width, height]
        );

        console.log('Purchase successful');
        res.status(200).send({ message: 'Purchase successful', remainingCoins: userCoins - itemPrice });
    } catch (error) {
        console.error('Error during purchase:', error);
        res.status(500).send({ error: 'Failed to complete purchase' });
    }
}

export async function getItemUser(req, res) {
    const { userId } = req.query;

    try {
        const [shopResult] = await db.query('SELECT * FROM Shop WHERE userID = ?', [userId]);
        console.log('Shop result:', shopResult);
        if (!shopResult) {
            return res.status(404).send({ error: 'Shop not found' });
        }

        res.status(200).send({ message: 'Shop retrieved successful', purchases: shopResult });
    } catch (error) {
        console.error('Error during retrieving:', error);
        res.status(500).send({ error: 'Failed to complete retrieving' });
    }
}

// Other existing controllers...

export async function getAllUsers(req, res) {
    try {
        const [users] = await db.query('SELECT * FROM Users');
        res.status(200).send(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send({ error: 'Failed to fetch users' });
    }
}

export async function getDailyChallenges(req, res) {
    try {
        const userID = 1; // Ideally, replace this with a dynamic user ID, e.g., from `req.userID`
        
        // Query to get the latest challenge assigned to the user
        const [lastInserted] = await db.query(
            'SELECT * FROM ChallengeUser WHERE userID = ? ORDER BY challengeUserID DESC LIMIT 1;', 
            [userID]
        );

        // Check if any row was returned
        if (!lastInserted || lastInserted.length === 0) {
            // If no record exists for the user, we can assume this is the user's first challenge
            console.log("No previous challenges assigned.");
            // Proceed to assign new daily challenges
        } else {
            const today = new Date().toISOString().split('T')[0];
            const formattedDate = new Date(lastInserted[0].dateAssigned).toISOString().split('T')[0];

            // If the last assigned date is today's date, skip updating
            if (formattedDate === today) {
                return res.status(200).send("No need to update challenges");
            }
        }

        // Retrieve all challenges from the database
        const [challenges] = await db.query('SELECT * FROM Challenges');
        if (challenges.length < 3) {
            return res.status(400).send({ error: 'Not enough challenges available' });
        }

        // Get 3 random unique indices
        const randomIndices = getRandomIndices(challenges.length);

        // Map the indices to actual challenges
        const dailyChallenges = randomIndices.map(index => challenges[index]);

        // Insert new challenges for the user
        const today = new Date().toISOString().split('T')[0]; // Get today's date
        for (let i = 0; i < 3; i++) {
            await db.query(
                `INSERT INTO ChallengeUser (userID, challengeID, completed, dateAssigned) VALUES (?, ?, 1, ?)`,
                [userID, dailyChallenges[i].challengeID, today]
            );
        }

        const [challengeUsers] = await db.query('SELECT * FROM ChallengeUser');
        console.log(challengeUsers);

        // Send success response
        res.status(200).send("DailyChallengesUpdated");
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
    const { username, password } = req.query;

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO Users (username, password, co2Saved, coins) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [username, hashedPassword, 0, 0]); // Destructure result
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Database or hashing error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function login(req, res) {
    const { username, password } = req.query;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Query to fetch user from database
        const query = 'SELECT * FROM Users WHERE username = ?';
        const [results] = await db.query(query, [username]); // Await the promise returned by db.query
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function profile(req, res) {
    const query = 'SELECT * FROM Users WHERE userID = 1';
    const [results] = await db.query(query);
    res.status(200).json({ message: 'Profile data', results });
    /*const token = req.headers['authorization']; // Extract the token from the Authorization header

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        // Verify the token and extract the payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Use the correct column name (userID) in the query
        const query = 'SELECT username, co2Saved, coins, habits FROM Users WHERE userID = ?';
        const [results] = await db.query(query, [decoded.id]); // Use decoded.id to fetch user details

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user's profile data
        res.status(200).json({
            message: 'Profile data retrieved successfully',
            profile: results[0], // Return only the necessary fields
        });
    } catch (err) {
        console.error('Error verifying token or fetching profile:', err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }*/

}

export async function logout(req, res) { 
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).json({ message: 'Token is required for logout' });
    }

    try {

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
// Automatically execute database setup and seeding when the server starts
setupDatabase();

export default router;
