import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
//import fs from 'fs';  // Import fs module directly
//import path from 'path';
//import { fileURLToPath } from 'url';

const app = express();

app.use(cors());
app.use(router);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


