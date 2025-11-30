import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { categories, gtBuildings } from '../data/mockItems';
import ApiService from '../services/api';
import { sendFoundItemConfirmation, sendMatchNotification } from '../services/emailService';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ReportFoundScreen({ navigation }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(gtBuildings[0]);
  const [photo, setPhoto] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  // Send in-app notification
  const sendInAppNotification = async () => {
    const hasPermission = await requestNotificationPermissions();

    if (hasPermission) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Match Found!',
          body: `Someone reported finding: ${itemName || 'an item'}`,
          data: { itemName, category, location },
        },
        trigger: null, // Show immediately
      });
    }
  };

  // DEMO: Send test notification (email + in-app)
  const handleSendDemoNotification = async () => {
    if (!itemName.trim()) {
      Alert.alert('Enter Item Details', 'Please fill in at least the item name to send a demo notification');
      return;
    }

    if (!userEmail.trim()) {
      Alert.alert('Enter Email', 'Please enter your email to receive the demo notification');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send in-app notification
      await sendInAppNotification();

      // Send email notification
      const emailResult = await sendMatchNotification({
        userEmail: userEmail,
        userName: userName || 'User',
        itemName: itemName,
        itemDescription: description || 'No description provided',
        category: category,
        location: location,
      });

      setIsSubmitting(false);

      if (emailResult.success) {
        Alert.alert(
          '🎉 Demo Notification Sent!',
          `Notification sent to:\n📧 Email: ${userEmail}\n📱 In-app: Check your notifications\n\nThis demonstrates how users will be notified when a matching item is found!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '📱 In-App Notification Sent!',
          'Email notification failed, but in-app notification was sent. Check your notification tray!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to send demo notification');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!itemName.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in item name and description');
      return;
    }

    if (!userEmail.trim() || !userName.trim()) {
      Alert.alert('Missing Information', 'Please provide your name and email');
      return;
    }

    if (!userEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photo if exists
      let photoUrl = null;
      if (photo) {
        try {
          photoUrl = await ApiService.uploadImage(photo);
        } catch (error) {
          console.warn('Failed to upload image, proceeding without photo:', error);
          // Continue without photo if upload fails
        }
      }

      // Get location coordinates
      const coordinates = ApiService.getBuildingCoordinates(location);

      // Prepare item data
      const itemData = {
        userId: 'u12345', // TODO: Replace with actual user ID from auth
        title: itemName,
        category: category,
        description: description,
        location: {
          building: location,
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        photoUrl: photoUrl,
        reporterEmail: userEmail,
        reporterName: userName,
      };

      // Submit to backend
      const response = await ApiService.reportFoundItem(itemData);

      // Send confirmation email in parallel
      sendFoundItemConfirmation({
        userEmail: userEmail,
        userName: userName,
        itemName: itemName,
        itemDescription: description,
        category: category,
        location: location,
      }).catch(err => console.warn('Email confirmation failed:', err));

      setIsSubmitting(false);

      // Check if there are matches
      const hasMatches = response.matches && response.matches.length > 0;

      // Show success message
      Alert.alert(
        'Found Item Reported',
        hasMatches
          ? `Thank you! We found ${response.matches.length} potential match(es) for this ${itemName}. We've notified the owner(s) automatically.\n\nItem ID: ${response.itemId}`
          : `Thank you! We've logged this ${itemName}. If it matches a lost item report in the future, we'll notify the owner automatically.\n\nItem ID: ${response.itemId}`,
        [
          {
            text: 'View on Map',
            onPress: () => {
              resetForm();
              navigation.navigate('Map');
            },
          },
          {
            text: 'Report Another',
            onPress: () => {
              resetForm();
            },
          },
          {
            text: 'Done',
            onPress: () => {
              resetForm();
              navigation.navigate('Map');
            },
          },
        ]
      );
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert(
        'Submission Failed',
        `Failed to report found item: ${error.message}. Please try again.`,
        [{ text: 'OK' }]
      );
    }
  };

  const resetForm = () => {
    setItemName('');
    setDescription('');
    setPhoto(null);
    setUserEmail('');
    setUserName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Report Found Item</Text>
          <Text style={styles.subtitle}>
            Help return lost items to their owners. We'll notify you if someone claims it.
          </Text>
        </View>

        <View style={styles.form}>
          {/* User Information */}
          <Text style={styles.sectionTitle}>📧 Your Contact Information</Text>
          
          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="John Smith"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Your Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            value={userEmail}
            onChangeText={setUserEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text style={styles.infoNote}>
            💡 We'll notify you if the owner claims this item
          </Text>

          {/* Item Information */}
          <Text style={styles.sectionTitle}>🎯 Item Details</Text>

          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Black BuzzCard, Blue Water Bottle"
            value={itemName}
            onChangeText={setItemName}
          />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the item in detail to help the owner identify it..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Found Location *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={location}
              onValueChange={setLocation}
              style={styles.picker}
            >
              {gtBuildings.map((building) => (
                <Picker.Item key={building} label={building} value={building} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Photo (Recommended)</Text>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Text style={styles.photoButtonText}>
              {photo ? 'Photo Added' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
          {photo && (
            <Text style={styles.photoNote}>Photo attached (not shown in prototype)</Text>
          )}
        </View>

        {/* DEMO: Test Notification Button */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>🧪 Demo Notification System</Text>
          <Text style={styles.demoText}>
            Test how users will be notified when items match! This sends both an email and in-app notification.
          </Text>
          <TouchableOpacity
            style={[styles.demoButton, isSubmitting && styles.demoButtonDisabled]}
            onPress={handleSendDemoNotification}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.demoButtonText}>📬 Send Demo Notification</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Found Item Report</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003057',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#003057',
    marginTop: 24,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003057',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 200,
  },
  photoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#B3A369',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#B3A369',
    fontSize: 16,
    fontWeight: '600',
  },
  photoNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoNote: {
    fontSize: 13,
    color: '#666',
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    lineHeight: 18,
  },
  demoSection: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 16,
    lineHeight: 20,
  },
  demoButton: {
    backgroundColor: '#ffc107',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonDisabled: {
    opacity: 0.6,
  },
  demoButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#B3A369',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});