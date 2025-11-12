import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.route('/')
    .get(async (req, res) => {
        try {
            res.send('<h1>Connections Page</h1><p>Work in progress</p>');
        } catch (e) {
            console.error(e);
            res.status(500).send('Internal server error');
        }
    });


export default router;