// models/database.js
// מכיל את הסכמות (Schemas) והמודלים (Models) של Mongoose

import mongoose from 'mongoose';

// ============== User Schema ==============
const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  isAdmin: { type: Boolean, default: false },
  refreshToken: { type: String },
  preferences: {
    vegetarian: { type: Boolean, default: false },
    kosher: { type: Boolean, default: false },
    categories: [{ type: String }],
  },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }],
});

// Middleware לוודא שחובה לפחות שדה אחד (password או googleId)
userSchema.pre('save', function (next) {
  if (!this.password && !this.googleId) {
    const error = new Error('User must have either a password or Google ID for authentication');
    next(error);
  } else {
    next();
  }
});


// ============== Place Schema (מורחב) ==============
//
// הערה:
// הגדרנו userCategories כמערך של String לשמירת קטגוריות שהגיעו ממשתמשים שונים (עברית, אנגלית וכו'),
// והוספנו googleCategory עבור הקטגוריה שמגיעה מגוגל (למשל "restaurant", "cafe" וכו').
const placeSchema = new mongoose.Schema({
  place_id: { type: String, required: true },  // מזהה המקום כפי שמגיע מגוגל (place.id)
  
  name: { type: String },              // למשל displayName?.text
  googleCategory: { type: String },    // place.primaryType (לדוגמה "restaurant")
  userCategories: [{ type: String }],  // כל הקטגוריות שהגיעו ממשתמשים

  formattedAddress: { type: String },
  rating: { type: Number },
  googleMapsUri: { type: String },
  websiteUri: { type: String },
  priceLevel: { type: String },        // PRICE_LEVEL_INEXPENSIVE וכו'
  
  nationalPhoneNumber: { type: String },
  internationalPhoneNumber: { type: String },
  
  regularOpeningHours: { type: Object },
  currentOpeningHours: { type: Object },

  dineIn: { type: Boolean, default: false },
  delivery: { type: Boolean, default: false },
  takeout: { type: Boolean, default: false },
  liveMusic: { type: Boolean, default: false },
  servesVegetarianFood: { type: Boolean, default: false },

  location: {
    type: { type: String, default: 'Point', enum: ['Point'] },
    coordinates: { type: [Number], index: '2dsphere' }, // [lng, lat]
  },

  photos: [
    {
      name: { type: String },
      widthPx: { type: Number },
      heightPx: { type: Number },
      authorAttributions: { type: Array },
      flagContentUri: { type: String },
      googleMapsUri: { type: String },
    },
  ],

  updated_at: { type: Date, default: Date.now },
  source: { type: String },
});





// ============== Category Schema ==============

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  searchTerms: [{ type: String }],      
});


// ============== History Schema ==============
const historySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  place_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  visit_date: { type: Date, default: Date.now },
  rating: { type: Number },
  review: { type: String },
});


// ============== Metadata Schema ==============

const metadataSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // מזהה ייחודי, למשל 'categories'
  version: { type: String, required: true }, // גרסה נוכחית
});


// ============== Feedback Schema ==============

const feedbackSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  feedback: { type: String, required: true },
  screenshot: { type: Buffer, default: null }, 
  createdAt: { type: Date, default: Date.now },
});


export const Feedback = mongoose.model('Feedback', feedbackSchema);
export const Metadata = mongoose.model('Metadata', metadataSchema);
export const User = mongoose.model('User', userSchema);
export const Place = mongoose.model('Place', placeSchema);
export const Category = mongoose.model('Category', categorySchema);
export const History = mongoose.model('History', historySchema);
