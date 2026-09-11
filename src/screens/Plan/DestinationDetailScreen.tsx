import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {getDestination} from '../../data/destinations';
import {getTrendingForDestination} from '../../data/trending';
import AgentService from '../../services/AgentService';
import TravelLinksService from '../../services/TravelLinksService';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DestinationDetail'>;

export default function DestinationDetailScreen({navigation, route}: Props) {
  const destination = getDestination(route.params.destinationId);
  const [weatherLine, setWeatherLine] = useState('Checking forecast…');
  const [weatherBusy, setWeatherBusy] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!destination) return;
      setWeatherBusy(true);
      try {
        const line = await AgentService.weatherBrief(
          destination.center,
          destination.name,
        );
        if (alive) setWeatherLine(line);
      } catch {
        if (alive) setWeatherLine('Forecast unavailable right now.');
      } finally {
        if (alive) setWeatherBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [destination]);

  if (!destination) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Destination not found.</Text>
      </View>
    );
  }

  const trending = getTrendingForDestination(destination.id).slice(0, 3);
  const flightLinks = TravelLinksService.flightSearch({
    destination: destination.name,
  }).slice(0, 2);
  const hotelLinks = TravelLinksService.hotelSearch({
    city: destination.name,
  }).slice(0, 2);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{uri: destination.imageUri}} style={styles.hero} />
        <View style={styles.body}>
          <Text style={styles.country}>
            {destination.country} · {destination.region}
          </Text>
          <Text style={styles.title}>{destination.name}</Text>
          <Text style={styles.tagline}>{destination.tagline}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{destination.nights} nights</Text>
            <Text style={styles.meta}>★ {destination.rating.toFixed(1)}</Text>
            <Text style={styles.meta}>from ${destination.priceFrom}</Text>
          </View>
          <Text style={styles.description}>{destination.description}</Text>

          <View style={styles.weatherCard}>
            <Text style={styles.weatherLabel}>Weather now</Text>
            {weatherBusy ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text style={styles.weatherText}>{weatherLine}</Text>
            )}
          </View>

          <Text style={styles.section}>Trending here</Text>
          {trending.map(item => (
            <View key={item.id} style={styles.trendRow}>
              <Image source={{uri: item.imageUri}} style={styles.trendThumb} />
              <View style={styles.trendBody}>
                <Text style={styles.trendHeat}>Heat {item.heat}</Text>
                <Text style={styles.trendTitle}>{item.title}</Text>
                <Text style={styles.trendBlurb}>{item.blurb}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.section}>Search & book</Text>
          <Text style={styles.sectionHint}>
            Deep-links to trusted partners — no OTA checkout inside Atlas.
          </Text>
          {[...flightLinks, ...hotelLinks].map(link => (
            <Pressable
              key={link.id}
              style={styles.linkRow}
              onPress={() => TravelLinksService.open(link)}>
              <Text style={styles.linkLabel}>{link.label}</Text>
              <Text style={styles.linkSub}>{link.subtitle}</Text>
            </Pressable>
          ))}

          <Pressable
            style={styles.agentBtn}
            onPress={() =>
              navigation.navigate('AgentChat', {
                destinationId: destination.id,
                destinationName: destination.name,
              })
            }>
            <Text style={styles.agentBtnText}>Ask Atlas agent about {destination.name}</Text>
          </Pressable>

          <Text style={styles.section}>Suggested rhythm</Text>
          {destination.template.slice(0, 5).map((stop, i) => (
            <View key={`${stop.title}-${i}`} style={styles.stop}>
              <Text style={styles.stopDay}>Day {stop.dayOffset + 1}</Text>
              <View style={styles.stopBody}>
                <Text style={styles.stopTitle}>{stop.title}</Text>
                <Text style={styles.stopNotes}>{stop.notes}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.price}>${destination.priceFrom}/person</Text>
        </View>
        <Pressable
          style={styles.cta}
          onPress={() =>
            navigation.navigate('PlanTrip', {
              destinationId: destination.id,
              nights: destination.nights,
            })
          }>
          <Text style={styles.ctaText}>Plan this trip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  content: {paddingBottom: 120},
  fallback: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  fallbackText: {color: COLORS.textSecondary},
  hero: {width: '100%', height: 280},
  body: {padding: SPACING.lg},
  country: {
    color: COLORS.gold,
    fontWeight: '700',
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tagline: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  meta: {color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZES.sm},
  description: {
    marginTop: SPACING.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  weatherCard: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.parchment,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  weatherLabel: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  weatherText: {color: COLORS.textPrimary, lineHeight: 20},
  section: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionHint: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  trendRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  trendThumb: {width: 72, height: 72},
  trendBody: {flex: 1, padding: SPACING.sm},
  trendHeat: {color: COLORS.accent, fontSize: FONT_SIZES.xs, fontWeight: '700'},
  trendTitle: {color: COLORS.textPrimary, fontWeight: '700', marginTop: 2},
  trendBlurb: {color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginTop: 2},
  linkRow: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  linkLabel: {color: COLORS.primary, fontWeight: '700'},
  linkSub: {color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginTop: 2},
  agentBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.hero,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  agentBtnText: {color: COLORS.textInverse, fontWeight: '700'},
  stop: {flexDirection: 'row', marginBottom: SPACING.md},
  stopDay: {
    width: 64,
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  stopBody: {flex: 1},
  stopTitle: {color: COLORS.textPrimary, fontWeight: '600'},
  stopNotes: {color: COLORS.textSecondary, marginTop: 2, fontSize: FONT_SIZES.sm},
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  priceLabel: {color: COLORS.textSecondary, fontSize: FONT_SIZES.xs},
  price: {color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.lg},
  cta: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  ctaText: {color: COLORS.textInverse, fontWeight: '700'},
});
