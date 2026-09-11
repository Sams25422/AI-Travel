import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {useApp} from '../../context/AppContext';
import {DESTINATIONS, getDestination} from '../../data/destinations';
import type {BudgetLevel, TripStyle} from '../../models';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanTrip'>;

const STYLES: TripStyle[] = ['vacation', 'adventure', 'culture', 'food', 'work'];
const BUDGETS: BudgetLevel[] = ['low', 'mid', 'high'];

export default function PlanTripScreen({navigation, route}: Props) {
  const {createPlan} = useApp();
  const initial = route.params?.destinationId
    ? getDestination(route.params.destinationId)
    : undefined;

  const [destinationId, setDestinationId] = useState(initial?.id ?? DESTINATIONS[0].id);
  const [nights, setNights] = useState(
    route.params?.nights ?? initial?.nights ?? 3,
  );
  const [name, setName] = useState(
    initial ? `Trip to ${initial.name}` : '',
  );
  const [tripStyle, setTripStyle] = useState<TripStyle>(
    initial?.styles[0] ?? 'vacation',
  );
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>('mid');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const destination = useMemo(
    () => getDestination(destinationId),
    [destinationId],
  );

  const onCreate = async () => {
    setBusy(true);
    setError('');
    try {
      const trip = await createPlan({
        destinationId,
        name: name.trim() || undefined,
        nights,
        tripStyle,
        budgetLevel,
        planNotes: route.params?.askQuery,
      });
      navigation.replace('Itinerary', {tripId: trip.id});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Plan your trip</Text>
      <Text style={styles.sub}>
        Sketch the bones now. Atlas will journal the living trip later.
      </Text>

      <Text style={styles.label}>Destination</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {DESTINATIONS.map(d => (
          <Pressable
            key={d.id}
            style={[styles.chip, destinationId === d.id && styles.chipActive]}
            onPress={() => {
              setDestinationId(d.id);
              setNights(d.nights);
              setName(`Trip to ${d.name}`);
              setTripStyle(d.styles[0] ?? 'vacation');
            }}>
            <Text
              style={[
                styles.chipText,
                destinationId === d.id && styles.chipTextActive,
              ]}>
              {d.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {destination ? (
        <Text style={styles.hint}>
          {destination.tagline} · template has {destination.template.length} stops
        </Text>
      ) : null}

      <Text style={styles.label}>Trip name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Trip name"
        placeholderTextColor={COLORS.textDisabled}
      />

      <Text style={styles.label}>Nights</Text>
      <View style={styles.row}>
        {[2, 3, 4, 5, 7].map(n => (
          <Pressable
            key={n}
            style={[styles.chip, nights === n && styles.chipActive]}
            onPress={() => setNights(n)}>
            <Text
              style={[styles.chipText, nights === n && styles.chipTextActive]}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Travel style</Text>
      <View style={styles.wrap}>
        {STYLES.map(s => (
          <Pressable
            key={s}
            style={[styles.chip, tripStyle === s && styles.chipActive]}
            onPress={() => setTripStyle(s)}>
            <Text
              style={[
                styles.chipText,
                tripStyle === s && styles.chipTextActive,
              ]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Budget</Text>
      <View style={styles.row}>
        {BUDGETS.map(b => (
          <Pressable
            key={b}
            style={[styles.chip, budgetLevel === b && styles.chipActive]}
            onPress={() => setBudgetLevel(b)}>
            <Text
              style={[
                styles.chipText,
                budgetLevel === b && styles.chipTextActive,
              ]}>
              {b}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.cta} onPress={onCreate} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={COLORS.textInverse} />
        ) : (
          <Text style={styles.ctaText}>Build itinerary</Text>
        )}
      </Pressable>
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
  sub: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  label: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  hint: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
  },
  row: {flexDirection: 'row', flexWrap: 'wrap'},
  wrap: {flexDirection: 'row', flexWrap: 'wrap'},
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {color: COLORS.textSecondary, fontWeight: '600', textTransform: 'capitalize'},
  chipTextActive: {color: COLORS.textInverse},
  error: {color: COLORS.error, marginTop: SPACING.md},
  cta: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  ctaText: {color: COLORS.textInverse, fontWeight: '700', fontSize: FONT_SIZES.md},
});
