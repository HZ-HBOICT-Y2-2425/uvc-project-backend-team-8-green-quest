import express from 'express';
import { getAllChallenges, getChallengeById, complete, status } from '../challengesController/challengesController.js';  // Import controller methods

const router = express.Router();

// Route for getting all challenges
router.get('/', getAllChallenges);

// Route for getting a specific challenge by ID
router.get('/id/:id', getChallengeById);

router.get('/complete/:id', complete);

router.get('/status', status);

export default router;
