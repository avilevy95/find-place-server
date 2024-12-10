import axios from 'axios';

const API_KEY = 'AIzaSyC0wAww8dhfXJ2STRxznVnEk57qy81uX-U';

export const searchPlaces = async (category, lat, lng, radius) => {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  try {
    const response = await axios.post(url, 
      {
        textQuery: category,
        languageCode: "iw",
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius[1]
          },
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.primaryTypeDisplayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.rating,places.googleMapsUri,places.websiteUri,places.priceLevel,places.regularOpeningHours,places.photos',
        }
      }
    );

    return response.data.places;
  } catch (error) {
    console.error(error);
    return [];
  }
};