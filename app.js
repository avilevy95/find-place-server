import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import placesRoutes from './routes/places.js';
import authRoutes from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';
import categoriesRoutes from './routes/categories.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// התחברות ל-MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// בדיקת שרת
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// מסלולים
app.use('/places',authenticateToken, placesRoutes);
app.use('/auth', authRoutes);
app.use('/categories', authenticateToken, categoriesRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
