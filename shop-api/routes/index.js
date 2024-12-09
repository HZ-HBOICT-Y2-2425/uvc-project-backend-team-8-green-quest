import express from 'express';
import { getAllItems } from '../controller/itemController.js';

const router = express.Router();

// Route for getting all items
router.get('/', getAllItems);

export default router;
