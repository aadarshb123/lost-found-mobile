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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { categories, gtBuildings } from '../data/mockItems';

export default function ReportFoundScreen({ navigation }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(gtBuildings[0]);
  const [photo, setPhoto] = useState(null);

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

  const handleSubmit = () => {
    if (!itemName.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in item name and description');
      return;
    }

    // In a real app, this would:
    // 1. Save to Firestore
    // 2. Trigger Cloud Function to check for matches
    // 3. Send notifications to matched users

    // For prototype, show success message
    Alert.alert(
      'Found Item Reported',
      `Thank you! We've logged this ${itemName}. If it matches a lost item report, we'll notify the owner automatically.`,
      [
        {
          text: 'View on Map',
          onPress: () => navigation.navigate('Map'),
        },
        {
          text: 'Report Another',
          onPress: () => {
            // Clear form
            setItemName('');
            setDescription('');
            setPhoto(null);
          },
        },
        {
          text: 'Done',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Report Found Item</Text>
          <Text style={styles.subtitle}>
            Help return a lost item to its owner
          </Text>
        </View>

        <View style={styles.form}>
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
            placeholder="Describe the item in detail (color, brand, distinguishing marks...)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Found At *</Text>
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
              {photo ? '✓ Photo Added' : '📷 Add Photo'}
            </Text>
          </TouchableOpacity>
          {photo && (
            <Text style={styles.photoNote}>
              Photo attached (not shown in prototype)
            </Text>
          )}
          <Text style={styles.helpText}>
            💡 Adding a photo helps owners identify their item
          </Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Found Item Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
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
  },
  form: {
    marginBottom: 24,
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
    height: 50,
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
  helpText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
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
