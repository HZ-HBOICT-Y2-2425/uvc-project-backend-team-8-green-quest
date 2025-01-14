import express from 'express';
//import cors from 'cors';
import router from './routes/index.js';
//import fs from 'fs';  // Import fs module directly
//import path from 'path';
//import { fileURLToPath } from 'url';

// Resolve __dirname using import.meta.url
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

const app = express();

//app.use(cors());
app.use(router);

// Use path to resolve the path to challenges.json
//const challengesData = fs.readFileSync(path.join(__dirname, 'challenges.json'), 'utf-8');
//const challenges = JSON.parse(challengesData);

app.listen(3012, () => {
    console.log('Server is running on http://localhost:3012');
});


