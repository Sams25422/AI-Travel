/**
 * Home Screen - Main world map view
 * Shows scratch map of countries visited and list of trips
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TextInput, Alert} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {Trip} from '@models';
import {useTrips} from '@contexts';
import {Card, Button, LoadingSpinner, EmptyState} from '@components/common';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '@utils/constants';
import {formatDate} from '@utils/helpers';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const {trips, activeTrip, isLoading, createTrip, loadTrips} = useTrips();
  const [showNewTripInput, setShowNewTripInput] = useState(false);
  const [newTripName, setNewTripName] = useState('');

  useEffect(() => {
    // Refresh trips when screen comes into focus
    loadTrips();
  }, []);

  const handleCreateTrip = async () => {
    if (!newTripName.trim()) {
      Alert.alert('Required', 'Please enter a trip name');
      return;
    }

    try {
      const trip = await createTrip(newTripName.trim(), true);
      setNewTripName('');
      setShowNewTripInput(false);
      navigation.navigate('TripTimeline', {tripId: trip.id});
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    }
  };

  const handleTripPress = (trip: Trip) => {
    navigation.navigate('TripTimeline', {tripId: trip.id});
  };

  const renderTrip = ({item}: {item: Trip}) => (
    <Card onPress={() => handleTripPress(item)} style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripName}>{item.name}</Text>
        {item.status === 'active' && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        )}
      </View>
      <Text style={styles.tripDate}>{formatDate(item.startDate, 'short')}</Text>
      {item.endDate && (
        <Text style={styles.tripDate}>to {formatDate(item.endDate, 'short')}</Text>
      )}
      <View style={styles.tripStats}>
        <Text style={styles.tripStat}>📍 {item.totalSteps || 0} steps</Text>
        {item.countries && item.countries.length > 0 && (
          <Text style={styles.tripStat}>🌍 {item.countries.length} countries</Text>
        )}
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading your journeys..." />;
  }

  return (
    <View style={styles.container}>
      {/* Map placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapContent}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>World Map</Text>
          <Text style={styles.mapSubtext}>Coming soon with Mapbox integration</Text>
        </View>
      </View>

      {/* Trips list */}
      <View style={styles.listContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Trips</Text>
          {!showNewTripInput && (
            <Button
              title="+ New Trip"
              onPress={() => setShowNewTripInput(true)}
              size="small"
            />
          )}
        </View>

        {showNewTripInput && (
          <View style={styles.newTripContainer}>
            <TextInput
              style={styles.input}
              placeholder="Trip name (e.g., Japan 2025)"
              value={newTripName}
              onChangeText={setNewTripName}
              autoFocus
            />
            <View style={styles.newTripActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowNewTripInput(false);
                  setNewTripName('');
                }}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
              <Button
                title="Create"
                onPress={handleCreateTrip}
                size="small"
                style={styles.actionButton}
              />
            </View>
          </View>
        )}

        {trips.length === 0 ? (
          <EmptyState
            title="No trips yet"
            message="Start your first journey and Atlas will automatically create a beautiful journal as you travel."
            actionLabel="Create Your First Trip"
            onAction={() => setShowNewTripInput(true)}
            icon={<Text style={styles.emptyIcon}>✈️</Text>}
          />
        ) : (
          <FlatList
            data={trips}
            renderItem={renderTrip}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
    height: 200,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  mapContent: {
    alignItems: 'center',
  },
  mapIcon: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  mapText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  mapSubtext: {
    fontSize: FONT_SIZES.sm,
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
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  newTripContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.sm,
  },
  newTripActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 0,
    minWidth: 80,
  },
  listContent: {
    padding: SPACING.md,
  },
  tripCard: {
    marginBottom: SPACING.md,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tripName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  activeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  tripDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  tripStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  tripStat: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyIcon: {
    fontSize: 64,
  },
});

export default HomeScreen;
