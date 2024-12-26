// routes/categories.js
import express from 'express';
import { Category, Metadata } from '../models/database.js';
import { updateVersion } from '../utils/versionHelper.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const clientVersion = req.headers['version'];
  
    try {
      const metadata = await Metadata.findOne({ key: 'categories' });
      const currentVersion = metadata?.version || 'v1.0';
  
      if (clientVersion === currentVersion) {
        return res.status(204).send(); // אין צורך בעדכון
      }
  
      const categories = await Category.find({}, 'name');
      res.json({ version: currentVersion, categories });
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
router.post('/', async (req, res) => {
  try {
    const { name, searchTerms } = req.body;

    const category = new Category({ name, searchTerms });
    await category.save();

    await updateVersion('categories'); 
    res.status(201).json({ message: 'Category added' });
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
