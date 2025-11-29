import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  /**
   * Register for push notifications and get the Expo push token
   * @returns {Promise<string|null>} The Expo push token or null if registration failed
   */
  async registerForPushNotificationsAsync() {
    let token = null;

    try {
      // Check if running on a physical device
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#B3A369',
        });
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      // Get the Expo push token
      // For development builds, we need to provide the projectId
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      token = tokenData.data;

      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    return token;
  }

  /**
   * Add a listener for when a notification is received while app is open
   * @param {Function} callback - Function to call when notification is received
   * @returns {Object} Subscription object
   */
  addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add a listener for when a user taps on a notification
   * @param {Function} callback - Function to call when notification is tapped
   * @returns {Object} Subscription object
   */
  addNotificationResponseReceivedListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Get the notification that opened the app (if any)
   * @returns {Promise<Object|null>} The notification response or null
   */
  async getLastNotificationResponseAsync() {
    return await Notifications.getLastNotificationResponseAsync();
  }
}

export default new NotificationService();
