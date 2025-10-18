import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Branding */}
        <View style={styles.header}>
          <Text style={styles.logo}>🔍</Text>
          <Text style={styles.title}>Lost & Found</Text>
          <Text style={styles.subtitle}>Georgia Tech Lost & Found</Text>
        </View>

        {/* Login Button */}
        <View style={styles.loginSection}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.loginButtonText}>Continue as GT Student</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ReportLost')}
          >
            <Text style={styles.actionIcon}>📢</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Report Lost Item</Text>
              <Text style={styles.actionSubtitle}>
                Lost something? Let us help you find it
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ReportFound')}
          >
            <Text style={styles.actionIcon}>🎯</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Report Found Item</Text>
              <Text style={styles.actionSubtitle}>
                Found something? Help return it to its owner
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Browse Map</Text>
              <Text style={styles.actionSubtitle}>
                See all found items on campus
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003057', // GT Navy
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loginSection: {
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#B3A369', // GT Gold
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginNote: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 8,
  },
  actionsSection: {
    flex: 1,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003057',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003057',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});
