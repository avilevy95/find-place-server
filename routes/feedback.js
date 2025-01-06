import express from 'express';
import { Feedback } from '../models/database.js';
import sharp from 'sharp';
import multer from 'multer';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

// הגדרת multer לשמירה בזיכרון
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ניתוב להוספת פידבק
router.post('/', upload.array('screenshots'), async (req, res) => {
  const { feedback, userName } = req.body;
  const screenshots = req.files;

  if (!feedback) {
    return res.status(400).json({ error: 'Feedback is required' });
  }

  try {
    const compressedScreenshots = [];

    if (screenshots && screenshots.length > 0) {
      for (const screenshot of screenshots) {
        const compressed = await sharp(screenshot.buffer)
          .resize(800) // שינוי גודל ל־800 פיקסלים
          .jpeg({ quality: 70 }) // דחיסה
          .toBuffer();

        compressedScreenshots.push(compressed);
      }
    }

    const newFeedback = new Feedback({
      userName,
      feedback,
      screenshots: compressedScreenshots, // שמירת התמונות הדחוסות
      date: new Date(),
    });

    await newFeedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// ניתוב לשליפת כל הפידבקים (מנהל בלבד)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find();

    const feedbacksWithImages = feedbacks.map((feedback) => ({
      id: feedback._id,
      userName: feedback.userName,
      feedback: feedback.feedback,
      date: feedback.date,
      screenshots: feedback.screenshots.map((buffer) =>
        `data:image/jpeg;base64,${buffer.toString('base64')}`
      ), // המרה ל-Base64 לשליחה ללקוח
    }));

    res.status(200).json(feedbacksWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve feedbacks' });
  }
});

// ניתוב למחיקת פידבק לפי ID
router.delete('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

export default router;
