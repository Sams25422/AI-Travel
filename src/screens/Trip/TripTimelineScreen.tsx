/**
 * Trip Timeline Screen
 * Shows the chronological timeline of steps for a trip
 * Map at top, scrollable steps below
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {Trip, Step} from '@models';
import {TripService} from '@services';
import {COLORS, FONT_SIZES, SPACING} from '@utils/constants';
import {formatDate, formatTime} from '@utils/helpers';

type TripTimelineScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'TripTimeline'>;
  route: RouteProp<RootStackParamList, 'TripTimeline'>;
};

export const TripTimelineScreen: React.FC<TripTimelineScreenProps> = ({navigation, route}) => {
  const {tripId} = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const tripData = await TripService.getTrip(tripId);
      setTrip(tripData);

      // TODO: Load steps from backend/storage
      setSteps([]);
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!trip) return;

    try {
      await TripService.completeTrip(trip.id);
      navigation.goBack();
    } catch (error) {
      console.error('Error completing trip:', error);
    }
  };

  const handleAddStep = () => {
    navigation.navigate('StepEdit', {tripId});
  };

  if (loading || !trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.tripName}>{trip.name}</Text>
        {trip.status === 'active' && (
          <TouchableOpacity onPress={handleCompleteTrip}>
            <Text style={styles.completeButton}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Map placeholder */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapPlaceholder}>Trip Map (Mapbox integration pending)</Text>
      </View>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Journey Timeline</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddStep}>
            <Text style={styles.addButtonText}>+ Add Step</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.stepsScroll} contentContainerStyle={styles.stepsContent}>
          {steps.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No steps yet</Text>
              <Text style={styles.emptySubtext}>
                Your journey will automatically appear here as you travel
              </Text>
            </View>
          ) : (
            steps.map(step => (
              <View key={step.id} style={styles.stepCard}>
                <Text style={styles.stepType}>{step.type}</Text>
                <Text style={styles.stepName}>{step.name}</Text>
                <Text style={styles.stepTime}>{formatTime(step.startTime)}</Text>
                {step.notes && <Text style={styles.stepNotes}>{step.notes}</Text>}
                <Text style={styles.stepPhotos}>{step.photos.length} photos</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  tripName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  completeButton: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    fontWeight: '600',
  },
  mapContainer: {
    height: 250,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  mapPlaceholder: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  timelineTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  stepsScroll: {
    flex: 1,
  },
  stepsContent: {
    padding: SPACING.md,
  },
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  stepType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  stepName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  stepTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  stepNotes: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  stepPhotos: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    padding: SPACING.lg,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
});

export default TripTimelineScreen;
