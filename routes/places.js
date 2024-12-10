import express from 'express';
import { searchPlaces } from '../servisces/searchPlaces.js';

const router = express.Router();
let results = null;

router.get('/', async (req, res) => {
    try {
        const { category, lat, lng, radius } = req.query;
        console.log("###", category, lat, lng, radius)
        if (results === null) {
            results = await searchPlaces(category, lat, lng, radius);
        }

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;