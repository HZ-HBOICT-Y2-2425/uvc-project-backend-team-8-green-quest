import { promises as fs } from 'fs';  // Use this for async operations like readFile
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const challengesFilePath = path.join(__dirname, '../challenges.json');

export async function readChallengesFile() {
    try {
        const data = await fs.readFile(challengesFilePath, 'utf-8');
        return JSON.parse(data); 
    } catch (error) {
        console.error('Error reading the challenges file:', error);
        throw error;
    }
}

export async function getAllChallenges(req, res) {
    try {
        const challenges = await readChallengesFile();
        res.status(200).send(challenges);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch challenges' });
    }
}


export async function getChallengeById(req, res) {
    try {
        const id = Number(req.params.id);  

        const challengesData = await readChallengesFile();
        console.log('Raw challenges data:', challengesData);  

        if (Array.isArray(challengesData)) {
            const challenge = challengesData.find(challenge => challenge.id === id);

            if (challenge) {
                res.status(200).json(challenge);  
            } else {
                res.status(404).send({ error: 'Challenge not found' });  
            }
        } else {
            res.status(500).send({ error: 'Challenges data is not in the expected format (array)' });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch challenge' });
    }
}


