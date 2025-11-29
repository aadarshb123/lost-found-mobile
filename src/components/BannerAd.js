import React from 'react';
import { View, StyleSheet } from 'react-native';
import WebViewAd from './WebViewAd';

// Try to import AdMob components, but handle gracefully if not available
let GoogleBannerAd, BannerAdSize, TestIds;
try {
  const adsModule = require('react-native-google-mobile-ads');
  GoogleBannerAd = adsModule.BannerAd;
  BannerAdSize = adsModule.BannerAdSize;
  TestIds = adsModule.TestIds;
} catch (error) {
  console.warn('AdMob native module not available. Using WebView fallback for Expo Go.');
  GoogleBannerAd = null;
  BannerAdSize = null;
  TestIds = null;
}

// Test ad unit IDs (replace with your actual ad unit IDs when ready)
const adUnitId = __DEV__ 
  ? (TestIds?.BANNER || 'test-banner-id') // Use test ID in development
  : 'ca-app-pub-3940256099942544/6300978111'; // Replace with your actual ad unit ID

export default function BannerAd({ position = 'bottom', useWebViewFallback = true }) {
  // If AdMob native module is available, use it (better performance)
  if (GoogleBannerAd) {
    return (
      <View style={styles.container}>
        <GoogleBannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    );
  }

  // Fallback to WebView ads for Expo Go (works but not ideal)
  if (useWebViewFallback) {
    return (
      <View style={styles.container}>
        <WebViewAd adUnitId={adUnitId} height={50} />
      </View>
    );
  }

  // If no fallback, return null
  return null;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
});

