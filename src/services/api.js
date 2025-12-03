// API service for communicating with the backend
import { Platform } from 'react-native';

const getDevApiUrl = () => {
  // iOS Simulator can use localhost
  if (Platform.OS === 'ios') {
    return 'https://lost-and-found-backend-swart.vercel.app/api';
  }
  // Android Emulator needs 10.0.2.2 instead of localhost
  if (Platform.OS === 'android') {
    return 'https://lost-and-found-backend-swart.vercel.app/api';
  }
  // Fallback
  return 'https://lost-and-found-backend-swart.vercel.app/api';
};

const API_BASE_URL = __DEV__
  ? getDevApiUrl()
  : 'https://example-prod-api.com/api';

class ApiService {
  /**
   * Report a lost item
   * @param {Object} itemData - The lost item data
   * @param {string} itemData.userId - User ID
   * @param {string} itemData.title - Item name/title
   * @param {string} itemData.category - Item category
   * @param {string} itemData.description - Item description
   * @param {Object} itemData.location - Location object with building, lat, lng
   * @param {string} itemData.photoUrl - Photo URL (optional)
   * @returns {Promise<Object>} Response with itemId and status
   */
  async reportLostItem(itemData) {
    try {
      const response = await fetch(`${API_BASE_URL}/items/lost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to report lost item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error reporting lost item:', error);
      throw error;
    }
  }

  /**
   * Report a found item
   * @param {Object} itemData - The found item data
   * @param {string} itemData.userId - User ID
   * @param {string} itemData.title - Item name/title
   * @param {string} itemData.category - Item category
   * @param {string} itemData.description - Item description
   * @param {Object} itemData.location - Location object with building, lat, lng
   * @param {string} itemData.photoUrl - Photo URL (optional)
   * @returns {Promise<Object>} Response with itemId, status, and matches
   */
  async reportFoundItem(itemData) {
    try {
      const response = await fetch(`${API_BASE_URL}/items/found`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to report found item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error reporting found item:', error);
      throw error;
    }
  }

  /**
   * Upload image to the backend
   * @param {string} imageUri - Local image URI
   * @returns {Promise<string>} Photo URL from backend storage
   */
  async uploadImage(imageUri) {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      });

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.photoUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Get location coordinates for a building
   * Helper function to map building names to coordinates
   * In production, this could be replaced with a proper geocoding API
   */
  getBuildingCoordinates(buildingName) {
    // GT Campus coordinates mapping
    const buildingCoords = {
      'Clough 320': { lat: 33.7765, lng: -84.3988 },
      'Student Center': { lat: 33.7738, lng: -84.3980 },
      'Library': { lat: 33.7747, lng: -84.3966 },
      'Klaus': { lat: 33.7770, lng: -84.3958 },
      'Van Leer': { lat: 33.7766, lng: -84.3966 },
      'Howey Physics': { lat: 33.7773, lng: -84.3986 },
      'CRC': { lat: 33.7757, lng: -84.4040 },
      'Tech Square': { lat: 33.7773, lng: -84.3890 },
    };

    return buildingCoords[buildingName] || { lat: 33.7756, lng: -84.3963 }; // Default to GT center
  }
}

export default new ApiService();
