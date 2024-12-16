import express from 'express';
import * as userController from '../controller/userController.js';

const router = express.Router();

// Route for getting all items
router.get('/', userController.getAllUsers);

router.get('/getDailyChallenges', userController.getDailyChallenges);

router.post('/completeChallenge', userController.completeChallenge);

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/profile', userController.profile);
// Route to purchase an item
router.post('/purchase', userController.purchaseItem);

// Route to get all purchased items
router.get('/userItems', userController.getItemUser);

router.post('/logout', userController.logout);

export default router;