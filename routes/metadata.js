// routes/metadata.js
import express from 'express';
import { Metadata } from '../models/database.js';

const router = express.Router();

router.get('/versions', async (req, res) => {
  try {
    const versions = await Metadata.find();
    const versionMap = versions.reduce((map, item) => {
      map[item.key] = item.version;
      return map;
    }, {});
    res.json(versionMap);
  } catch (err) {
    console.error('Error fetching versions:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
