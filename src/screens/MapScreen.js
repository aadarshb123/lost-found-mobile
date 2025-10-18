import React, { useState } from 'react';
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
} from 'react-native';
import { mockFoundItems, categories } from '../data/mockItems';

// Simple mock map using an image and positioned markers
export default function MapScreen({ navigation }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredItems =
    activeFilter === 'All'
      ? mockFoundItems
      : mockFoundItems.filter((item) => item.category === activeFilter);

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

  const formatTimeAgo = (timestamp) => {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (hours < 1) return 'Less than 1 hour ago';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  };

  // Map markers as overlays (simplified positioning)
  // In real app, these would be calculated from lat/lng
  const getMarkerPosition = (item) => {
    const positions = {
      'Student Center': { top: '50%', left: '45%' },
      'Klaus Building': { top: '35%', left: '55%' },
      'Library West': { top: '45%', left: '50%' },
      'Library East': { top: '45%', left: '52%' },
      'CRC': { top: '60%', left: '30%' },
      'Van Leer': { top: '40%', left: '52%' },
      'Clough Commons': { top: '42%', left: '55%' },
      'Howey Building': { top: '38%', left: '48%' },
      'Tech Square Parking': { top: '25%', left: '60%' },
    };
    return positions[item.location] || { top: '50%', left: '50%' };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Found Items Map</Text>
        <Text style={styles.headerSubtitle}>
          {filteredItems.length} items found on campus
        </Text>
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
            All ({mockFoundItems.length})
          </Text>
        </TouchableOpacity>

        {categories.map((category) => {
          const count = mockFoundItems.filter((item) => item.category === category)
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

      {/* Mock Map with Markers */}
      <View style={styles.mapContainer}>
        {/* Background - mock campus map */}
        <View style={styles.mockMap}>
          <Text style={styles.mapPlaceholder}>🏛️ Georgia Tech Campus</Text>
          <Text style={styles.mapNote}>(Interactive map - tap markers below)</Text>
        </View>

        {/* Item markers overlaid */}
        {filteredItems.map((item) => {
          const position = getMarkerPosition(item);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.marker,
                {
                  top: position.top,
                  left: position.left,
                  backgroundColor: getCategoryColor(item.category),
                },
              ]}
              onPress={() => setSelectedItem(item)}
            >
              <Text style={styles.markerText}>📍</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Items List (alternative to map for easy testing) */}
      <View style={styles.listSection}>
        <Text style={styles.listTitle}>📋 Found Items List</Text>
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
                <Text style={styles.listItemName}>{item.name}</Text>
                <Text style={styles.listItemLocation}>
                  📍 {item.location} • {formatTimeAgo(item.timestamp)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReportLost')}
        >
          <Text style={styles.actionButtonText}>📢 Report Lost</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReportFound')}
        >
          <Text style={styles.actionButtonText}>🎯 Report Found</Text>
        </TouchableOpacity>
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
                      📍 {selectedItem.location}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reported:</Text>
                    <Text style={styles.detailValue}>
                      🕐 {formatTimeAgo(selectedItem.timestamp)}
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
  mockMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f0e8',
  },
  mapPlaceholder: {
    fontSize: 24,
    color: '#003057',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mapNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    fontSize: 20,
  },
  listSection: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003057',
    padding: 16,
    paddingBottom: 8,
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
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003057',
    marginBottom: 4,
  },
  listItemLocation: {
    fontSize: 13,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  actionButton: {
    backgroundColor: '#B3A369',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
