import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import { categories } from '../data/mockItems';
import ApiService from '../services/api';

// Helper to get correct API URL for platform
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }
  return 'http://localhost:8000/api';
};

// Georgia Tech campus center coordinates
const GT_CENTER = {
  latitude: 33.7756,
  longitude: -84.3963,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

// Helper function to get category colors
const getCategoryColor = (category) => {
  const colors = {
    BuzzCard: '#B3A369',
    Electronics: '#4A90E2',
    'Water Bottle': '#7ED321',
    Clothing: '#BD10E0',
    Bag: '#F5A623',
    Keys: '#D0021B',
    Books: '#8B572A',
    Other: '#9013FE',
  };
  return colors[category] || '#003057';
};

// Generate Leaflet map HTML
const generateMapHTML = (items) => {
  const markers = items.map((item) => {
    const color = getCategoryColor(item.category);
    const label = item.itemType === 'lost' ? 'L' : 'F';
    return `
      L.marker([${item.lat}, ${item.lng}], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="font-size: 12px; color: white; font-weight: bold;">${label}</span></div>',
          iconSize: [30, 30]
        })
      })
      .addTo(map)
      .bindPopup('<b>${item.name.replace(/'/g, "\\'")}</b><br>${item.location}<br><small>${item.category}</small>')
      .on('click', function() {
        window.ReactNativeWebView.postMessage('${item.id}');
      });
    `;
  }).join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .custom-marker { background: transparent; border: none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${GT_CENTER.latitude}, ${GT_CENTER.longitude}], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        ${markers}
      </script>
    </body>
    </html>
  `;
};

export default function MapScreen({ navigation }) {
  const mapRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Fetch ALL items (both lost and found) from backend
  const fetchAllItems = async () => {
    try {
      setError(null);
      const apiUrl = getApiUrl();

      // Fetch both lost and found items in parallel
      const [foundResponse, lostResponse] = await Promise.all([
        fetch(`${apiUrl}/items/found/all`),
        fetch(`${apiUrl}/items/lost/all`)
      ]);

      if (!foundResponse.ok || !lostResponse.ok) {
        throw new Error('Failed to fetch items');
      }

      const foundData = await foundResponse.json();
      const lostData = await lostResponse.json();

      // Combine and map both types
      const allItems = [
        ...foundData.items.map(item => ({
          id: item.itemId,
          name: item.title,
          category: item.category,
          location: item.location.building,
          description: item.description,
          timestamp: new Date(item.createdAt).getTime(),
          lat: item.location.lat,
          lng: item.location.lng,
          photoUrl: item.photoUrl,
          itemType: 'found', // Track type for styling
        })),
        ...lostData.items.map(item => ({
          id: item.itemId,
          name: item.title,
          category: item.category,
          location: item.location.building,
          description: item.description,
          timestamp: new Date(item.createdAt).getTime(),
          lat: item.location.lat,
          lng: item.location.lng,
          photoUrl: item.photoUrl,
          itemType: 'lost', // Track type for styling
        }))
      ];

      // Sort by timestamp (newest first)
      allItems.sort((a, b) => b.timestamp - a.timestamp);
      setItems(allItems);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message);
      setItems([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load items on mount
  useEffect(() => {
    fetchAllItems();
  }, []);

  // Refresh when screen comes into focus (after reporting item)
  useFocusEffect(
    React.useCallback(() => {
      fetchAllItems();
    }, [])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchAllItems();
  };

  const filteredItems =
    activeFilter === 'All'
      ? items
      : items.filter((item) => item.category === activeFilter);

  const formatTimeAgo = (timestamp) => {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (hours < 1) return 'Less than 1 hour ago';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  };

  // Show loading indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B3A369" />
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Count items by type
  const lostCount = items.filter(item => item.itemType === 'lost').length;
  const foundCount = items.filter(item => item.itemType === 'found').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lost & Found Map</Text>
        <Text style={styles.headerSubtitle}>
          {lostCount} lost • {foundCount} found • {filteredItems.length} showing
        </Text>
        {error && (
          <Text style={styles.errorText}>
            Warning: {error} - Showing cached data
          </Text>
        )}
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'All' && styles.filterButtonActive,
          ]}
          onPress={() => setActiveFilter('All')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'All' && styles.filterTextActive,
            ]}
          >
            All ({items.length})
          </Text>
        </TouchableOpacity>

        {categories.map((category) => {
          const count = items.filter((item) => item.category === category)
            .length;
          if (count === 0) return null;

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                activeFilter === category && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(category)}
            >
              <View style={styles.filterButtonContent}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: getCategoryColor(category) },
                  ]}
                />
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === category && styles.filterTextActive,
                  ]}
                >
                  {category} ({count})
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Map View - Simple Leaflet Map */}
      <View style={styles.mapContainer}>
        <WebView
          style={styles.map}
          originWhitelist={['*']}
          source={{ html: generateMapHTML(filteredItems) }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(event) => {
            const itemId = event.nativeEvent.data;
            const item = filteredItems.find(i => i.id === itemId);
            if (item) {
              setSelectedItem(item);
            }
          }}
        />
        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ff6b6b' }]} />
            <Text style={styles.legendText}>Lost Items</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4caf50' }]} />
            <Text style={styles.legendText}>Found Items</Text>
          </View>
        </View>
      </View>

      {/* Items List */}
      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>All Items</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ReportLost')}
            >
              <Text style={styles.quickActionText}>Report Lost</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ReportFound')}
            >
              <Text style={styles.quickActionText}>Report Found</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setSelectedItem(item)}
            >
              <View
                style={[
                  styles.listItemDot,
                  { backgroundColor: getCategoryColor(item.category) },
                ]}
              />
              <View style={styles.listItemContent}>
                <View style={styles.listItemHeader}>
                  <Text style={styles.listItemName}>{item.name}</Text>
                  <View style={[
                    styles.typeBadge,
                    item.itemType === 'lost' ? styles.lostBadge : styles.foundBadge
                  ]}>
                    <Text style={styles.typeBadgeText}>
                      {item.itemType === 'lost' ? 'Lost' : 'Found'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.listItemLocation}>
                  {item.location} • {formatTimeAgo(item.timestamp)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#B3A369"
              colors={['#B3A369']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>No items to display</Text>
              <Text style={styles.emptyListSubtext}>Try changing the filter or report an item</Text>
            </View>
          }
        />
      </View>

      {/* Item Detail Modal */}
      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedItem && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTop}>
                    <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                    <TouchableOpacity onPress={() => setSelectedItem(null)}>
                      <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor: getCategoryColor(selectedItem.category),
                      },
                    ]}
                  >
                    <Text style={styles.categoryBadgeText}>
                      {selectedItem.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailValue}>
                      {selectedItem.description}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>
                      {selectedItem.location}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reported:</Text>
                    <Text style={styles.detailValue}>
                      {formatTimeAgo(selectedItem.timestamp)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => {
                      setSelectedItem(null);
                      alert(
                        'In the full app, this would let you contact the finder or front desk to claim the item.'
                      );
                    }}
                  >
                    <Text style={styles.claimButtonText}>This is Mine!</Text>
                  </TouchableOpacity>
                  <Text style={styles.claimNote}>
                    You'll need to verify ownership to claim this item
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#003057',
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B3A369',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#003057',
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  mapContainer: {
    height: 250,
    backgroundColor: '#e8f4f8',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  mapLegend: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#fff',
  },
  legendText: {
    fontSize: 11,
    color: '#003057',
    fontWeight: '600',
  },
  // Fallback map styles (for Expo Go)
  fallbackMap: {
    flex: 1,
    backgroundColor: '#e8f4f8',
    paddingVertical: 16,
  },
  fallbackMapHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  fallbackMapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003057',
    marginBottom: 4,
  },
  fallbackMapSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  fallbackNote: {
    fontSize: 12,
    color: '#B3A369',
    fontStyle: 'italic',
  },
  itemsPreview: {
    paddingLeft: 16,
  },
  itemsPreviewContent: {
    paddingRight: 16,
  },
  previewCard: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  previewEmoji: {
    fontSize: 16,
    color: '#fff',
  },
  previewName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#003057',
    marginBottom: 4,
  },
  previewLocation: {
    fontSize: 11,
    color: '#666',
  },
  moreItemsCard: {
    width: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B3A369',
  },
  moreItemsLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  fallbackLegend: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listSection: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003057',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: '#B3A369',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptyListSubtext: {
    fontSize: 13,
    color: '#999',
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003057',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  lostBadge: {
    backgroundColor: '#ffebee',
  },
  foundBadge: {
    backgroundColor: '#e8f5e9',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listItemLocation: {
    fontSize: 13,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003057',
    flex: 1,
  },
  closeButton: {
    fontSize: 28,
    color: '#999',
    fontWeight: '300',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#003057',
    lineHeight: 22,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  claimButton: {
    backgroundColor: '#B3A369',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  claimNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
  },
});
