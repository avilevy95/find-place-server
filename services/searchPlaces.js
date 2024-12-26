// searchPlaces.js - External API integration for Google Places

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.GOOGLE_API_URL;
const API_KEY = process.env.GOOGLE_API_KEY;

export const searchPlaces = async (category, lat, lng, radius) => {
 
  try {
    const response = await axios.post(
      API_URL,
      {
        textQuery: category,
        languageCode: 'iw',
        maxResultCount: 100,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask':'*'
            //'places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.rating,places.googleMapsUri,places.websiteUri,places.priceLevel,places.regularOpeningHours,places.photos',
        },
      }
    );

    return response.data.places;
  } catch (error) {
    console.error('Error fetching places from Google API:', error);
    return [];
  }
};