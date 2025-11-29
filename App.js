import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Try to import AdMob, but handle gracefully if not available (e.g., in Expo Go)
let mobileAds;
try {
  mobileAds = require('react-native-google-mobile-ads').default;
} catch (error) {
  console.warn('AdMob module not available. Make sure you are using a development build, not Expo Go.');
  mobileAds = null;
}

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import CreateAccountScreen from './src/screens/CreateAccountScreen';
import MapScreen from './src/screens/MapScreen';
import ReportLostScreen from './src/screens/ReportLostScreen';
import ReportFoundScreen from './src/screens/ReportFoundScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Initialize AdMob SDK if available
    if (mobileAds) {
      mobileAds()
        .initialize()
        .then(adapterStatuses => {
          console.log('AdMob initialized', adapterStatuses);
        })
        .catch(error => {
          console.error('AdMob initialization error:', error);
        });
    }
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#003057', // GT Navy
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Lost & Found',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Sign In',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccountScreen}
          options={{
            title: 'Create Account',
          }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: 'Found Items',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ReportLost"
          component={ReportLostScreen}
          options={{
            title: 'Report Lost Item',
          }}
        />
        <Stack.Screen
          name="ReportFound"
          component={ReportFoundScreen}
          options={{
            title: 'Report Found Item',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}