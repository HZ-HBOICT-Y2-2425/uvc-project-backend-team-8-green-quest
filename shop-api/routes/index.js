import express from 'express';
import { getAllItems, searchByName } from '../controller/itemController.js';

const router = express.Router();

// Route for getting all items
router.get('/', getAllItems);

// route for getting item by the title
router.get('/:name', searchByName);

export default router;
