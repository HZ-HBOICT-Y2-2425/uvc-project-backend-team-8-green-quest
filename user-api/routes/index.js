import express from 'express';
import { getAllUsers, purchaseItem } from '../controller/userController.js';
import { login } from '../controller/userController.js';

const router = express.Router();

// Route to get all users
router.get('/', getAllUsers);

// Route to purchase an item
router.post('/purchase', purchaseItem);

router.post('/login', login);

export default router;
