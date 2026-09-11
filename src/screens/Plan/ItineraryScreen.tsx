import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import type {ItineraryItem, Trip} from '../../models';
import {useApp} from '../../context/AppContext';
import PlanService from '../../services/PlanService';
import TripService from '../../services/TripService';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';
import {formatDate, formatTime} from '../../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'Itinerary'>;

export default function ItineraryScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const {
    getItinerary,
    addItineraryItem,
    removeItineraryItem,
    startPlannedTrip,
  } = useApp();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setTrip(await TripService.getTrip(tripId));
    setItems(await getItinerary(tripId));
  }, [getItinerary, tripId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const grouped = PlanService.groupByDay(items);
  const days = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  const onAdd = async () => {
    if (!newTitle.trim()) return;
    const dayIndex = days.length ? days[days.length - 1] : 0;
    await addItineraryItem({
      tripId,
      title: newTitle.trim(),
      dayIndex,
      notes: 'Added while planning',
    });
    setNewTitle('');
    await load();
  };

  const onStart = async () => {
    setBusy(true);
    setMessage('');
    try {
      await startPlannedTrip(tripId);
      setMessage('Trip is live — Atlas is journaling.');
      navigation.replace('TripTimeline', {tripId});
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{trip?.name || 'Itinerary'}</Text>
      <Text style={styles.meta}>
        {trip?.destinationName || trip?.countries?.[0] || 'Custom plan'}
        {trip?.plannedNights ? ` · ${trip.plannedNights} nights` : ''}
        {trip?.startDate ? ` · starts ${formatDate(trip.startDate)}` : ''}
      </Text>
      <Text style={styles.status}>{trip?.status || '…'}</Text>

      {days.length === 0 ? (
        <Text style={styles.empty}>
          No stops yet. Add one below or re-seed from a destination.
        </Text>
      ) : (
        days.map(day => (
          <View key={day} style={styles.dayBlock}>
            <Text style={styles.dayTitle}>Day {day + 1}</Text>
            {grouped[day].map(item => (
              <View key={item.id} style={styles.item}>
                <View style={styles.itemRail}>
                  <View style={styles.dot} />
                  <View style={styles.line} />
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.itemTime}>
                    {formatTime(item.startTime)}
                    {item.endTime ? ` – ${formatTime(item.endTime)}` : ''}
                  </Text>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.notes ? (
                    <Text style={styles.itemNotes}>{item.notes}</Text>
                  ) : null}
                  <Text style={styles.itemType}>{item.type}</Text>
                  <Pressable
                    onPress={async () => {
                      await removeItineraryItem(item.id);
                      await load();
                    }}
                    hitSlop={8}>
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ))
      )}

      <Text style={styles.label}>Add a stop</Text>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Coffee walk, museum, dinner…"
          placeholderTextColor={COLORS.textDisabled}
        />
        <Pressable style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {trip?.status === 'planned' || trip?.status === 'paused' ? (
        <Pressable style={styles.cta} onPress={onStart} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={COLORS.textInverse} />
          ) : (
            <Text style={styles.ctaText}>Start trip · begin journaling</Text>
          )}
        </Pressable>
      ) : (
        <Pressable
          style={styles.secondary}
          onPress={() => navigation.navigate('TripTimeline', {tripId})}>
          <Text style={styles.secondaryText}>Open journal timeline</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: SPACING.lg, paddingBottom: SPACING.xxl},
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  meta: {marginTop: 4, color: COLORS.textSecondary},
  status: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.parchment,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONT_SIZES.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  empty: {marginTop: SPACING.xl, color: COLORS.textSecondary},
  dayBlock: {marginTop: SPACING.lg},
  dayTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  item: {flexDirection: 'row', marginBottom: SPACING.md},
  itemRail: {width: 16, alignItems: 'center'},
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginTop: 6,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.gray200,
    marginTop: 4,
  },
  itemBody: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  itemTime: {color: COLORS.accent, fontSize: FONT_SIZES.xs, fontWeight: '700'},
  itemTitle: {
    marginTop: 4,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  itemNotes: {marginTop: 4, color: COLORS.textSecondary, fontSize: FONT_SIZES.sm},
  itemType: {
    marginTop: 6,
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  remove: {marginTop: 8, color: COLORS.error, fontSize: FONT_SIZES.sm},
  label: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addRow: {flexDirection: 'row', gap: SPACING.sm},
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  addBtnText: {color: COLORS.textInverse, fontWeight: '700'},
  message: {marginTop: SPACING.md, color: COLORS.accent},
  cta: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  ctaText: {color: COLORS.textInverse, fontWeight: '700', fontSize: FONT_SIZES.md},
  secondary: {
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  secondaryText: {color: COLORS.primary, fontWeight: '700'},
});
