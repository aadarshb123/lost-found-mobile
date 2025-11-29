import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * WebView-based ad component that works in Expo Go
 * 
 * NOTE: This is a workaround. For production, use react-native-google-mobile-ads
 * with a development build for better performance and AdMob policy compliance.
 * 
 * You can use Google AdSense or AdMob web ads here.
 * Replace the HTML content with your actual ad code from AdMob/AdSense.
 */
export default function WebViewAd({ adUnitId, width = '100%', height = 50 }) {
  // Example AdSense/AdMob web ad HTML
  // Replace this with your actual ad code from Google AdSense or AdMob
  const adHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          background: transparent;
        }
        .ad-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      </style>
    </head>
    <body>
      <div class="ad-container">
        <!-- Replace this with your AdSense/AdMob web ad code -->
        <div style="width: 320px; height: 50px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #666; font-size: 12px;">
          Ad Placeholder<br/>
          (Replace with AdSense/AdMob code)
        </div>
      </div>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        source={{ html: adHTML }}
        style={styles.webview}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // Prevent navigation when clicking ads
        onShouldStartLoadWithRequest={(request) => {
          // Allow navigation to ad URLs
          return true;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: 'transparent',
  },
});

