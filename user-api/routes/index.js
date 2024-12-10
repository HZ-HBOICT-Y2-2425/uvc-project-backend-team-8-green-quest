import express from 'express';
import { getAllUsers, purchaseItem, getItemUser } from '../controller/userController.js';

const router = express.Router();

// Route to get all users
router.get('/', getAllUsers);

// Route to purchase an item
router.post('/purchase', purchaseItem);

// Route to get all purchased items
router.get('/userItems', getItemUser);

export default router;
