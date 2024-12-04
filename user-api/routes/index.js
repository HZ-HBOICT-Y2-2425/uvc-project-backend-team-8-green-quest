import express from 'express';
import { getAllUsers, getDailyChallenges } from '../controller/userController.js';

const router = express.Router();

// Route for getting all items
router.get('/', getAllUsers);

router.get('/getDailyChallenges', getDailyChallenges);

export default router;
