import express from 'express';
import {Feedback} from '../models/database.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// הגדרות Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// ניתוב לקבלת משוב
router.post('/', async (req, res) => {
  const { feedback } = req.body;
  const userName = req.user.userName;

  if (!feedback) return res.status(400).json({ error: 'Feedback is required' });

  try {
    // שמירת המשוב ב-DB
    const newFeedback = new Feedback({ userName, feedback });
    await newFeedback.save();

    // שליחת האימייל
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // כתובת האימייל שאליו יישלח המשוב
      subject: 'Feedback Received',
      text: `User: ${userName}\nFeedback: ${feedback}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

export default router;
