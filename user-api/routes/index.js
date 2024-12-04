import express from 'express';
import { getAllUsers, getDailyChallenges, completeChallenge } from '../controller/userController.js';

const router = express.Router();

// Route for getting all items
router.get('/', getAllUsers);

router.get('/getDailyChallenges', getDailyChallenges);

router.post('/completeChallenge', completeChallenge);

export default router;
