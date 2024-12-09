import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import bodyParser from 'body-parser';
import fs from 'fs';  // Import fs module directly
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(router);
app.use(bodyParser.json());

app.listen(3013, () => {
    console.log('Server is running on http://localhost:3013');
});


