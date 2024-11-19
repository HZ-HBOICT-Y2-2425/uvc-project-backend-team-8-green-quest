import * as dotenv from 'dotenv';
dotenv.config({ path: '../variables.env' });

import express from 'express';
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

const challengesData = fs.readFileSync(path.join(__dirname, 'challenges.json'));
const challenges = JSON.parse(challengesData);

const shopData = fs.readFileSync(path.join(__dirname, 'shop.json'));
const shop = JSON.parse(shopData);

app.get('/api/challenges', (req, res) => {
  res.json(challenges);
});

app.get('/api/shop', (req, res) => {
  res.json(shop);
});

app.listen(PORT, () => {
  console.log(`🍿 Server is running → http://localhost:${PORT}`);
});


