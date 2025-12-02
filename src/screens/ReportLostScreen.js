import React, { useState, useEffect } from 'react';
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
import { categories, gtBuildings } from '../data/mockItems';
import ApiService from '../services/api';
import { sendLostItemConfirmation } from '../services/emailService';
import { useUser } from '../context/UserContext';

export default function ReportLostScreen({ navigation }) {
  const { user } = useUser();
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(gtBuildings[0]);
  const [photo, setPhoto] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill user info if logged in
  useEffect(() => {
    if (user) {
      setUserEmail(user.email || '');
      setUserName(user.fullName || '');
    }
  }, [user]);

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

  const handleSubmit = async () => {
    // Validation
    if (!itemName.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in item name and description');
      return;
    }

    if (!userEmail.trim() || !userName.trim()) {
      Alert.alert('Missing Information', 'Please provide your name and email for notifications');
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
      const response = await ApiService.reportLostItem(itemData);

      // Send confirmation email in parallel
      sendLostItemConfirmation({
        userEmail: userEmail,
        userName: userName,
        itemName: itemName,
        itemDescription: description,
        category: category,
        location: location,
      }).catch(err => console.warn('Email confirmation failed:', err));

      setIsSubmitting(false);

      // Show success message
      Alert.alert(
        'Lost Item Reported',
        `We've logged your lost ${itemName}. You'll receive a notification if someone reports finding a matching item.\n\nItem ID: ${response.itemId}`,
        [
          {
            text: 'View Map',
            onPress: () => {
              resetForm();
              navigation.navigate('Map');
            },
          },
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert(
        'Submission Failed',
        `Failed to report lost item: ${error.message}. Please try again.`,
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
          <Text style={styles.title}>Report Lost Item</Text>
          <Text style={styles.subtitle}>
            We'll notify you via email if someone finds something matching your description
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
            💡 We'll send you email alerts when matching items are found
          </Text>

          {/* Item Information */}
          <Text style={styles.sectionTitle}>🔍 Item Details</Text>

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
              mode="dropdown"
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the item in detail (color, brand, distinguishing marks...)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Last Seen Location *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={location}
              onValueChange={setLocation}
              style={styles.picker}
              mode="dropdown"
            >
              {gtBuildings.map((building) => (
                <Picker.Item key={building} label={building} value={building} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Photo (Optional)</Text>
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Text style={styles.photoButtonText}>
              {photo ? 'Photo Added' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
          {photo && (
            <Text style={styles.photoNote}>Photo attached (not shown in prototype)</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Lost Item Report</Text>
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
    height: 200
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