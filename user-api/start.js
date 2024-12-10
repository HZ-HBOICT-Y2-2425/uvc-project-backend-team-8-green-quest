import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import bodyParser from 'body-parser';
import fs from 'fs';  // Import fs module directly
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(router);
<<<<<<< HEAD
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

=======
app.use(express.json());
>>>>>>> 8e92c6486ab17c73aa9cf2e524b00e220524e23e

app.listen(3014, () => {
    console.log('Server is running on http://localhost:3014');
});