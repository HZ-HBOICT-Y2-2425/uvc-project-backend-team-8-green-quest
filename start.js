import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import fs from 'fs';  // Import fs module directly
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(router);

// Use path to resolve the path to challenges.json
const challengesData = fs.readFileSync(path.join(__dirname, 'challenges.json'), 'utf-8');
const challenges = JSON.parse(challengesData);

const shopData = fs.readFileSync(path.join(__dirname, 'shop.json'), 'utf-8');
const shop = JSON.parse(shopData);

app.get('/api/challenges', (req, res) => {
  res.json(challenges);
});

app.get('/api/shop', (req, res) => {
  res.json(shop);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


