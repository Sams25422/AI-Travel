import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../../navigation/types';
import {useApp} from '../../context/AppContext';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';
import {formatDate} from '../../utils/helpers';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({navigation}: Props) {
  const {trips, activeTrip, startTrip, runDemoTrip, completeTrip} = useApp();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const onDemo = async () => {
    setBusy(true);
    setMessage('Simulating a Paris weekend…');
    try {
      const trip = await runDemoTrip();
      setMessage('Demo trip ready');
      navigation.navigate('TripTimeline', {tripId: trip.id});
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onStart = async () => {
    setBusy(true);
    try {
      const trip = await startTrip(`Trip ${new Date().toLocaleDateString()}`);
      navigation.navigate('TripTimeline', {tripId: trip.id});
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onComplete = async () => {
    if (!activeTrip) return;
    setBusy(true);
    try {
      await completeTrip(activeTrip.id);
      setMessage('Trip completed & journal built');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.brand}>Atlas</Text>
      <Text style={styles.subtitle}>Your world, written for you</Text>

      <View style={styles.mapCard}>
        <Text style={styles.mapTitle}>
          {Platform.OS === 'web' ? 'Demo map · Paris path' : 'Live map'}
        </Text>
        <Text style={styles.mapBody}>
          {activeTrip
            ? `Tracking: ${activeTrip.name}`
            : trips.length
              ? `${trips.length} trip${trips.length === 1 ? '' : 's'} in your journal`
              : 'Start a trip or run the Paris demo to see Atlas work end-to-end.'}
        </Text>
        {trips.slice(0, 5).map(t => (
          <Pressable
            key={t.id}
            style={styles.chip}
            onPress={() => navigation.navigate('TripTimeline', {tripId: t.id})}>
            <Text style={styles.chipText}>
              {t.name} · {t.countries?.[0] || t.status} · {formatDate(t.startDate)}
            </Text>
          </Pressable>
        ))}
      </View>

      {busy ? (
        <ActivityIndicator color={COLORS.primary} style={{marginVertical: SPACING.md}} />
      ) : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable style={styles.primaryBtn} onPress={onDemo} disabled={busy}>
        <Text style={styles.primaryText}>Run Paris demo trip</Text>
      </Pressable>
      <Pressable style={styles.secondaryBtn} onPress={onStart} disabled={busy}>
        <Text style={styles.secondaryText}>Start live trip</Text>
      </Pressable>
      {activeTrip ? (
        <Pressable style={styles.accentBtn} onPress={onComplete} disabled={busy}>
          <Text style={styles.primaryText}>Complete & curate journal</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: SPACING.lg, paddingBottom: SPACING.xxl},
  brand: {fontSize: FONT_SIZES.xxxl, fontWeight: '700', color: COLORS.primary},
  subtitle: {fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.lg},
  mapCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  mapTitle: {fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textPrimary},
  mapBody: {marginTop: SPACING.sm, color: COLORS.textSecondary, lineHeight: 22},
  chip: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.parchment,
    borderRadius: RADIUS.md,
  },
  chipText: {color: COLORS.textPrimary, fontSize: FONT_SIZES.sm},
  message: {color: COLORS.accent, marginBottom: SPACING.sm},
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  secondaryBtn: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  accentBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  primaryText: {color: COLORS.textInverse, fontWeight: '600', fontSize: FONT_SIZES.md},
  secondaryText: {color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZES.md},
});
