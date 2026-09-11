import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {getDestination} from '../../data/destinations';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DestinationDetail'>;

export default function DestinationDetailScreen({navigation, route}: Props) {
  const destination = getDestination(route.params.destinationId);

  if (!destination) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Destination not found.</Text>
      </View>
    );
  }

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
    fontSize: FONT_SIZES.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  meta: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
    backgroundColor: COLORS.parchment,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  description: {
    color: COLORS.textPrimary,
    lineHeight: 24,
    fontSize: FONT_SIZES.md,
  },
  section: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stop: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  stopDay: {
    width: 56,
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  stopBody: {flex: 1},
  stopTitle: {fontWeight: '600', color: COLORS.textPrimary},
  stopNotes: {marginTop: 2, color: COLORS.textSecondary, fontSize: FONT_SIZES.sm},
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  ctaText: {color: COLORS.textInverse, fontWeight: '700'},
});
