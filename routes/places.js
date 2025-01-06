// routes/places.js
// ניהול הנתיב /places, ביצוע חיפוש ושמירת תוצאות ממאגר המידע או API

import express from 'express';
import { searchPlaces } from '../services/searchPlaces.js';
import { Place } from '../models/database.js';

const router = express.Router();

// פונקציה למצוא מקומות בקרבת lat,lng, עם קטגוריה מסוימת (במקרה זה userCategories)
async function findNearbyPlaces(category, lat, lng, radius) {
  const now = new Date();
  const cutoffTime = new Date(now - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  // אפשר גם לחפש לפי googleCategory במקום userCategories, תלוי בלוגיקה
  return Place.find({
    userCategories: category,         // מחפשים מקומות שמערך userCategories כולל את המחרוזת הזו
   // updated_at: { $gte: cutoffTime },
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [ lng, lat ],  // (longitude, latitude)
        },
        $maxDistance: radius,         // ברירת מחדל: מטרים, ודא ש-radius מתאים
      },
    },
  });
}

// נתיב GET /places
// ציפייה לפרמטרים: ?category=...&lat=...&lng=...&radius=...
router.get('/', async (req, res) => {
  try {
    console.log("req: >>", req.query)
    const { category, lat, lng, radius } = req.query;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radNum = 5000;//parseInt(radius, 10); // במטרים או בקילומטרים, תלוי בהחלטה שלך

   // console.log('Query Params:', { category, lat: latNum, lng: lngNum, radius: radNum });

    // קודם כל מחפשים במאגר
    const existingPlaces = await findNearbyPlaces(category, latNum, lngNum, radNum);
   // console.log('Existing Places:', existingPlaces.length);

    if (existingPlaces.length > 0) {
      console.log(">>> existingPlaces: ",existingPlaces.length)
      return res.json(existingPlaces);
    }

    // אם לא קיים במאגר, שולפים מגוגל
    const apiResults = await searchPlaces(category, lat, lng, radius);
    console.log('@@@ API Results:', apiResults.length);

    if (!apiResults || apiResults.length === 0) {
      return res.status(404).json({ message: 'No places found from API' });
    }

    // הכנת פעולות bulkWrite
    const operations = apiResults
      .filter((place) => place.id && place.location && place.location.latitude && place.location.longitude)
      .map((place) => {
        return {
          updateOne: {
            filter: { place_id: place.id },
            update: {
              $set: {
                place_id: place.id,
                name: place.displayName?.text || '',            // השם בעברית
                googleCategory: place.primaryType || '',        // למשל "restaurant"
                formattedAddress: place.formattedAddress || '',
                rating: place.rating || null,
                googleMapsUri: place.googleMapsUri || '',
                websiteUri: place.websiteUri || '',
                priceLevel: place.priceLevel || '',
                nationalPhoneNumber: place.nationalPhoneNumber || '',
                internationalPhoneNumber: place.internationalPhoneNumber || '',
                regularOpeningHours: place.regularOpeningHours || {},
                currentOpeningHours: place.currentOpeningHours || {},

                dineIn: !!place.dineIn,
                delivery: !!place.delivery,
                takeout: !!place.takeout,
                liveMusic: !!place.liveMusic,
                servesVegetarianFood: !!place.servesVegetarianFood,

                location: {
                  type: 'Point',
                  coordinates: [place.location.longitude, place.location.latitude], 
                },

                photos: (place.photos || []).map((p) => ({
                  name: p.name,
                  widthPx: p.widthPx,
                  heightPx: p.heightPx,
                  authorAttributions: p.authorAttributions,
                  flagContentUri: p.flagContentUri,
                  googleMapsUri: p.googleMapsUri,
                })),

                updated_at: new Date(),
                source: 'Google',
              },
              // $addToSet מוסיף את הקטגוריה שחיפשנו למערך userCategories, ללא כפילות
              $addToSet: { userCategories: category },
            },
            upsert: true,
          },
        };
      });

    const bulkResult = await Place.bulkWrite(operations);
    console.log('Bulk Write Result:', bulkResult);

    // שליפת המסמכים שוב לאחר העדכון
    const savedPlaces = await findNearbyPlaces(category, latNum, lngNum, radNum);
    console.log('Saved Places (after bulk):', savedPlaces);

    res.json(savedPlaces);
  } catch (err) {
    console.error('Error fetching or saving places:', err);
    res.status(500).send('Server Error');
  }
});

export default router;
