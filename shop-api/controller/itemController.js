import { promises as fs } from 'fs';  // Use this for async operations like readFile
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const challengesFilePath = path.join(__dirname, '../shop.json');

export async function readChallengesFile() {
    try {
        const data = await fs.readFile(challengesFilePath, 'utf-8');
        return JSON.parse(data); 
    } catch (error) {
        console.error('Error reading the challenges file:', error);
        throw error;
    }
}

export async function getAllItems(req, res) {
    try {
        const challenges = await readChallengesFile();
        res.status(200).send(challenges);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch challenges' });
    }
}