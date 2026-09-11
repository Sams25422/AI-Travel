import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, FlatList, Pressable} from 'react-native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../../navigation/types';
import type {Trip} from '../../models';
import {useApp} from '../../context/AppContext';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';
import {formatDate} from '../../utils/helpers';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Trips'>,
  NativeStackScreenProps<RootStackParamList>
>;

type Filter = 'all' | 'planned' | 'active' | 'completed';

export default function TripListScreen({navigation}: Props) {
  const {trips, deleteTrip} = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const data = useMemo(() => {
    if (filter === 'all') return trips;
    if (filter === 'active') {
      return trips.filter(t => t.status === 'active' || t.status === 'paused');
    }
    return trips.filter(t => t.status === filter);
  }, [filter, trips]);

  const openTrip = (trip: Trip) => {
    if (trip.status === 'planned') {
      navigation.navigate('Itinerary', {tripId: trip.id});
    } else {
      navigation.navigate('TripTimeline', {tripId: trip.id});
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My trips</Text>
      <Text style={styles.subtitle}>Plans ahead. Journals after.</Text>

      <View style={styles.filters}>
        {(['all', 'planned', 'active', 'completed'] as Filter[]).map(f => (
          <Pressable
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}>
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No trips here yet. Plan one from Discover, or run the Paris demo.
          </Text>
        }
        renderItem={({item}) => (
          <Pressable style={styles.card} onPress={() => openTrip(item)}>
            <View style={styles.cardTop}>
              <Text style={styles.name}>{item.name}</Text>
              <Text
                style={[
                  styles.badge,
                  item.status === 'planned' && styles.badgePlanned,
                  item.status === 'active' && styles.badgeActive,
                  item.status === 'completed' && styles.badgeDone,
                ]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.meta}>
              {formatDate(item.startDate)}
              {item.destinationName
                ? ` · ${item.destinationName}`
                : item.countries?.length
                  ? ` · ${item.countries.join(', ')}`
                  : ''}
            </Text>
            <Text style={styles.steps}>
              {item.status === 'planned'
                ? `${item.plannedNights ?? '—'} nights planned`
                : `${item.totalSteps} journal steps`}
            </Text>
            <Pressable
              onPress={() => deleteTrip(item.id)}
              hitSlop={8}
              style={styles.delete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
      />

      <Pressable
        style={styles.planBtn}
        onPress={() => navigation.navigate('PlanTrip', {})}>
        <Text style={styles.planBtnText}>Plan a new trip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg},
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: 4,
  },
  filters: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md},
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
    fontSize: FONT_SIZES.sm,
  },
  filterTextActive: {color: COLORS.textInverse},
  list: {paddingBottom: 100},
  empty: {color: COLORS.textSecondary, marginTop: SPACING.xl, lineHeight: 22},
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 56,
  },
  name: {fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textPrimary, flex: 1},
  badge: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.parchment,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  badgePlanned: {color: COLORS.primary, backgroundColor: '#DCE8E2'},
  badgeActive: {color: COLORS.accent, backgroundColor: '#F5E4DA'},
  badgeDone: {color: COLORS.success, backgroundColor: '#DCEBDF'},
  meta: {color: COLORS.textSecondary, marginTop: 6},
  steps: {color: COLORS.primary, marginTop: 6, fontWeight: '500'},
  delete: {position: 'absolute', right: SPACING.md, top: SPACING.md},
  deleteText: {color: COLORS.error, fontSize: FONT_SIZES.sm},
  planBtn: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  planBtnText: {color: COLORS.textInverse, fontWeight: '700', fontSize: FONT_SIZES.md},
});
