/**
 * Home Screen - Main world map view
 * Shows scratch map of countries visited and list of trips
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {Trip} from '@models';
import {TripService} from '@services';
import {COLORS, FONT_SIZES, SPACING} from '@utils/constants';
import {formatDate} from '@utils/helpers';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const allTrips = await TripService.getAllTrips();
      setTrips(allTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async () => {
    try {
      const trip = await TripService.createTrip('New Trip', true);
      navigation.navigate('TripTimeline', {tripId: trip.id});
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  const handleTripPress = (trip: Trip) => {
    navigation.navigate('TripTimeline', {tripId: trip.id});
  };

  const renderTrip = ({item}: {item: Trip}) => (
    <TouchableOpacity style={styles.tripCard} onPress={() => handleTripPress(item)}>
      <View style={styles.tripInfo}>
        <Text style={styles.tripName}>{item.name}</Text>
        <Text style={styles.tripDate}>{formatDate(item.startDate)}</Text>
        <Text style={styles.tripStatus}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Map placeholder */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapPlaceholder}>World Map (Mapbox integration pending)</Text>
      </View>

      {/* Trips list */}
      <View style={styles.listContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Trips</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateTrip}>
            <Text style={styles.createButtonText}>+ New Trip</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading trips...</Text>
        ) : trips.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No trips yet</Text>
            <Text style={styles.emptySubtext}>Start your first journey</Text>
          </View>
        ) : (
          <FlatList
            data={trips}
            renderItem={renderTrip}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    height: '40%',
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  mapPlaceholder: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.md,
  },
  tripCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  tripInfo: {
    gap: SPACING.xs,
  },
  tripName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  tripDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tripStatus: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  loadingText: {
    padding: SPACING.lg,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
