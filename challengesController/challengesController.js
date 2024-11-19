import { promises as fs } from 'fs';
import path from 'path';

const challengesFilePath = path.join(__dirname, 'challenges.json'); 
async function readChallengesFile() {
    try {
        const data = await fs.readFile(challengesFilePath, 'utf-8');
        return JSON.parse(data); 
    } catch (error) {
        throw new Error('Error reading challenges file');
    }
}

export async function getAllChallenges(req, res) {
    try {
        const challenges = await readChallengesFile();
        const challengeUrls = challenges.map(challenge => `/challenges/${challenge.id}`);
        res.status(200).send(challengeUrls);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch challenges' });
    }
}

export async function getChallengeById(req, res) {
    try {
        const id = Number(req.params.id)
        const challenges = await readChallengesFile();
        const challenge = challenges.find(challenge => challenge.id === id); 
        if (challenge) {
            res.status(200).send(challenge); 
        } else {
            res.status(404).send({ error: 'Challenge not found' }); 
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch challenge' });
    }
}


