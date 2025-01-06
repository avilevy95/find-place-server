import express from 'express';
import { Feedback } from '../models/database.js';
import sharp from 'sharp';
import { verifyAdmin } from '../middleware/auth.js';
const router = express.Router();

// ניתוב לקבלת פידבק
router.post('/', async (req, res) => {
  const { feedback, userName, screenshot } = req.body; 

  if (!feedback) return res.status(400).json({ error: 'Feedback is required' });

  try {
    let compressedScreenshot = null;

    if (screenshot) {
      const buffer = Buffer.from(screenshot.split(',')[1], 'base64');
      
      // דחיסת התמונה
      compressedScreenshot = await sharp(buffer)
        .resize(800) 
        .jpeg({ quality: 70 }) 
        .toBuffer();
    }

    const newFeedback = new Feedback({
      userName,
      feedback,
      screenshot: compressedScreenshot, 
      date: new Date(),
    });

    await newFeedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});


router.get('/',verifyAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find(); 
    res.status(200).json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve feedbacks' });
  }
});
