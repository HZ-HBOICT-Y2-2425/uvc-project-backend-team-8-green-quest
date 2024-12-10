import express from 'express';
import { getAllChallenges, getChallengeById, complete } from '../challengesController/challengesController.js';  // Import controller methods

const router = express.Router();

// Route for getting all challenges
router.get('/', getAllChallenges);

// Route for getting a specific challenge by ID
router.get('/:id', getChallengeById);

router.get('/complete/:id', complete);

export default router;
