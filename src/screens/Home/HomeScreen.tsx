import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainTabParamList, RootStackParamList} from '../../navigation/types';
import {useApp} from '../../context/AppContext';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';
import {formatDate} from '../../utils/helpers';
import {
  DESTINATIONS,
  REGIONS,
  parseAskAtlas,
} from '../../data/destinations';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({navigation}: Props) {
  const {trips, activeTrip, startTrip, runDemoTrip, completeTrip, createPlan} =
    useApp();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ask, setAsk] = useState('');
  const [region, setRegion] = useState<(typeof REGIONS)[number]>('All');

  const featured = DESTINATIONS[0];
  const filtered = useMemo(
    () =>
      region === 'All'
        ? DESTINATIONS
        : DESTINATIONS.filter(d => d.region === region),
    [region],
  );

  const planned = trips.filter(t => t.status === 'planned');
  const journaled = trips.filter(t => t.status !== 'planned');

  const onAsk = () => {
    const {destination, nights} = parseAskAtlas(ask);
    if (!destination) {
      setMessage('Try “3 nights in Tokyo” or pick a destination below.');
      return;
    }
    navigation.navigate('PlanTrip', {
      destinationId: destination.id,
      nights: nights ?? destination.nights,
      askQuery: ask,
    });
  };

  const onDemo = async () => {
    setBusy(true);
    setMessage('Simulating a Paris weekend…');
    try {
      const trip = await runDemoTrip();
      setMessage('Demo journal ready');
      navigation.navigate('TripTimeline', {tripId: trip.id});
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onStartLive = async () => {
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

  const quickPlan = async (destinationId: string) => {
    setBusy(true);
    try {
      const trip = await createPlan({destinationId});
      navigation.navigate('Itinerary', {tripId: trip.id});
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.brand}>Atlas</Text>
        <Text style={styles.heroTitle}>Plan the journey.{'\n'}Keep the story.</Text>
        <Text style={styles.heroSub}>
          Discover a destination, sketch an itinerary, then let Atlas journal the trip for you.
        </Text>

        <View style={styles.askRow}>
          <TextInput
            style={styles.askInput}
            placeholder="Ask Atlas for… 3 nights in Marrakech"
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={ask}
            onChangeText={setAsk}
            onSubmitEditing={onAsk}
            returnKeyType="search"
          />
          <Pressable style={styles.askBtn} onPress={onAsk}>
            <Text style={styles.askBtnText}>Go</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.regionRow}>
        {REGIONS.map(r => (
          <Pressable
            key={r}
            style={[styles.regionChip, region === r && styles.regionChipActive]}
            onPress={() => setRegion(r)}>
            <Text
              style={[
                styles.regionText,
                region === r && styles.regionTextActive,
              ]}>
              {r}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        style={styles.featured}
        onPress={() =>
          navigation.navigate('DestinationDetail', {destinationId: featured.id})
        }>
        <Image source={{uri: featured.imageUri}} style={styles.featuredImage} />
        <View style={styles.featuredScrim} />
        <View style={styles.featuredBody}>
          <Text style={styles.featuredEyebrow}>Featured</Text>
          <Text style={styles.featuredTitle}>
            {featured.name}, {featured.country}
          </Text>
          <Text style={styles.featuredTag}>{featured.tagline}</Text>
          <Text style={styles.featuredMeta}>
            {featured.nights} nights · from ${featured.priceFrom}
          </Text>
        </View>
      </Pressable>

      <Text style={styles.sectionTitle}>Just for you</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardRow}>
        {filtered.map(d => (
          <Pressable
            key={d.id}
            style={styles.destCard}
            onPress={() =>
              navigation.navigate('DestinationDetail', {destinationId: d.id})
            }>
            <Image source={{uri: d.imageUri}} style={styles.destImage} />
            <View style={styles.destScrim} />
            <Text style={styles.destName}>{d.name}</Text>
            <Text style={styles.destMeta}>
              {d.nights}n · {d.country}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('PlanTrip', {})}
          disabled={busy}>
          <Text style={styles.primaryText}>Plan a trip</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={onDemo} disabled={busy}>
          <Text style={styles.secondaryText}>Run Paris journal demo</Text>
        </Pressable>
        <Pressable style={styles.ghostBtn} onPress={onStartLive} disabled={busy}>
          <Text style={styles.ghostText}>Start live tracking</Text>
        </Pressable>
        {activeTrip ? (
          <Pressable style={styles.accentBtn} onPress={onComplete} disabled={busy}>
            <Text style={styles.primaryText}>Complete & curate journal</Text>
          </Pressable>
        ) : null}
      </View>

      {busy ? (
        <ActivityIndicator color={COLORS.primary} style={{marginVertical: SPACING.md}} />
      ) : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {planned.length ? (
        <>
          <Text style={styles.sectionTitle}>Upcoming plans</Text>
          {planned.slice(0, 3).map(t => (
            <Pressable
              key={t.id}
              style={styles.listChip}
              onPress={() => navigation.navigate('Itinerary', {tripId: t.id})}>
              <Text style={styles.listChipText}>
                {t.name} · {formatDate(t.startDate)}
              </Text>
            </Pressable>
          ))}
        </>
      ) : null}

      {journaled.length ? (
        <>
          <Text style={styles.sectionTitle}>Recent journals</Text>
          {journaled.slice(0, 3).map(t => (
            <Pressable
              key={t.id}
              style={styles.listChip}
              onPress={() => navigation.navigate('TripTimeline', {tripId: t.id})}>
              <Text style={styles.listChipText}>
                {t.name} · {t.countries?.[0] || t.status} · {formatDate(t.startDate)}
              </Text>
            </Pressable>
          ))}
        </>
      ) : null}

      <Pressable
        style={styles.quickLink}
        onPress={() => quickPlan(featured.id)}
        disabled={busy}>
        <Text style={styles.quickLinkText}>
          One-tap plan: {featured.name} template →
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {paddingBottom: SPACING.xxl},
  hero: {
    backgroundColor: COLORS.hero,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  brand: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 1,
  },
  heroTitle: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textInverse,
    lineHeight: 38,
  },
  heroSub: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 22,
    maxWidth: 340,
  },
  askRow: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingLeft: SPACING.md,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  askInput: {
    flex: 1,
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    paddingVertical: SPACING.sm,
  },
  askBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  askBtnText: {color: COLORS.hero, fontWeight: '700'},
  regionRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  regionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    marginRight: SPACING.sm,
  },
  regionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  regionText: {color: COLORS.textSecondary, fontWeight: '600', fontSize: FONT_SIZES.sm},
  regionTextActive: {color: COLORS.textInverse},
  featured: {
    marginHorizontal: SPACING.lg,
    height: 220,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  featuredImage: {...StyleSheet.absoluteFillObject, width: '100%', height: '100%'},
  featuredScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,47,38,0.35)',
  },
  featuredBody: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  featuredEyebrow: {
    color: COLORS.gold,
    fontWeight: '700',
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    marginTop: 4,
  },
  featuredTag: {color: 'rgba(255,255,255,0.85)', marginTop: 4},
  featuredMeta: {color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: FONT_SIZES.sm},
  sectionTitle: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardRow: {paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg},
  destCard: {
    width: 160,
    height: 200,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  destImage: {...StyleSheet.absoluteFillObject, width: '100%', height: '100%'},
  destScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,15,14,0.25)',
  },
  destName: {
    position: 'absolute',
    left: SPACING.md,
    bottom: 28,
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  destMeta: {
    position: 'absolute',
    left: SPACING.md,
    bottom: SPACING.sm,
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZES.xs,
  },
  actions: {paddingHorizontal: SPACING.lg, marginBottom: SPACING.md},
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
  ghostBtn: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  accentBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  primaryText: {color: COLORS.textInverse, fontWeight: '600', fontSize: FONT_SIZES.md},
  secondaryText: {color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZES.md},
  ghostText: {color: COLORS.textSecondary, fontWeight: '600'},
  message: {
    color: COLORS.accent,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  listChip: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.parchment,
    borderRadius: RADIUS.md,
  },
  listChipText: {color: COLORS.textPrimary, fontSize: FONT_SIZES.sm},
  quickLink: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  quickLinkText: {color: COLORS.primary, fontWeight: '600'},
});
