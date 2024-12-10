import express from 'express';
import db from '../db.js';
import fs from 'fs/promises';
import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const router = express.Router();

// Function to purchase an item
export async function purchaseItem(req, res) {
    const { userId, itemId } = req.query; // Expecting userId and itemId in the request body

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

        // Add the purchased item to the Shop table for the user
        const posX = Math.floor(Math.random() * 10); // Randomized position for simplicity
        const posY = Math.floor(Math.random() * 10);
        await db.query(
            'INSERT INTO Shop (itemID, userID, posX, posY) VALUES (?, ?, ?, ?)',
            [itemId, userId, posX, posY]
        );

        console.log('Purchase successful');
        res.status(200).send({ message: 'Purchase successful', remainingCoins: userCoins - itemPrice });
    } catch (error) {
        console.error('Error during purchase:', error);
        res.status(500).send({ error: 'Failed to complete purchase' });
    }
}

export async function login(req, res) {
    const { username } = req.query; // Expecting username in the request body

    try {
        // Query the database to find the user by username
        const [userResult] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);

        if (userResult.length === 0) {
            return res.status(404).send({ error: 'User not found' });
        }

        const user = userResult[0];

        // Return user details
        res.status(200).send({ user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ error: 'Failed to log in' });
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

// Automatically execute database setup and seeding when the server starts
setupDatabase();


export default router;
