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
            const recipes = await loadRecipes();
        } catch (e) {
            console.error(e);
            res.status(404).json({ error: 'Not found' });
        }
    });


export default router;