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
  
      const categories = await Category.find({}, 'name').sort({ name: 1 });
      res.json({ version: currentVersion, categories });
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  router.post('/', async (req, res) => {
    try {
      const categories = req.body.categories; // הנח שהלקוח שולח מערך של קטגוריות
  
      if (!Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({ error: 'Invalid input: categories must be a non-empty array' });
      }
  
      const categoryDocuments = categories.map(({ name, searchTerms }) => ({
        name,
        searchTerms,
      }));
  
      await Category.insertMany(categoryDocuments); // הוספת כל הקטגוריות במכה אחת
  
      await updateVersion('categories');
      res.status(201).json({ message: `${categories.length} categories added` });
    } catch (err) {
      console.error('Error adding categories:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

export default router;
