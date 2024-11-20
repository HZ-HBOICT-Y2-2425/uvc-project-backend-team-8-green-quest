import express from 'express';
import { getAllChallenges, getChallengeById } from '../challengesController/challengesController.js';  // Import controller methods

const router = express.Router();

// Route for getting all challenges
router.get('/challenges', getAllChallenges);

// Route for getting a specific challenge by ID
router.get('/challenges/:id', getChallengeById);

export default router;
