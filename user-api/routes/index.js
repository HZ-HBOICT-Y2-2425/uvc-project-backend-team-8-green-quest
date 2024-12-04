import express from 'express';
import { getAllUsers } from '../controller/userController.js';

const router = express.Router();

// Route for getting all items
router.get('/', getAllUsers);

export default router;
