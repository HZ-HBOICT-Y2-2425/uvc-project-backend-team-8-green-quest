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

export async function searchByName(req, res) {
    try {
        const keyword = String(req.params.name).toLowerCase(); 
        const itemsData = await readChallengesFile();
        console.log('Raw shop data: ', itemsData);
        // check if the data from the json file is done fetching
        if (itemsData && itemsData.shop && itemsData.shop.sections) {
            let foundItem = null;

            // Loop through the sections (trees, bushes, flowers)
            for (const section in itemsData.shop.sections) {
                if (itemsData.shop.sections.hasOwnProperty(section)) {
                    // Find the item in the current section
                    foundItem = itemsData.shop.sections[section].find(item => item.name.toLowerCase() === keyword);
                    // if the item s found then break the loop
                    if (foundItem) {
                        break;
                    }
                }
            }

            if (foundItem) {
                res.status(200).json(foundItem);
            } else {
                res.status(404).send({ error: 'The item was not found' });
            }
        } else {
            res.status(500).send({ error: 'The shop data is in an unexpected format' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch challenge' });
    }
}
