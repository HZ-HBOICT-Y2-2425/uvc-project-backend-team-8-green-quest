import express from 'express';
import db from '../db.js';
import fs from 'fs/promises';
import path from 'path';

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
