import { promises as fs } from 'fs';


const challenges = JSON.parse(await fs.readFile('challenges.json', 'utf-8'));

export async function getAllChallenges(req, res) {
    try {
        res.status(200).send(challenges.map(challenge => `/challenges/${challenge.id}`));
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch challenges' });
    }
}

export async function getChallengeById(req, res) {
    console.log(req.params);
    let id = Number(req.params.id);
    let challenge = challenges.find(challenge => challenge.id = id);
    if(challenge) {
        res.status(200).send(challenge);
    }else {
        res.status(404).send('I did not found challenge with that id'); 
    }
}

