import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import type {GeoPoint, Step} from '../models';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../theme';

type Props = {
  path: GeoPoint[];
  steps: Step[];
  height?: number;
};

/** Trip path + step pins. Native uses MapView; web shows a compact coordinate summary. */
export default function TripMap({path, steps, height = 200}: Props) {
  const pins = useMemo(
    () =>
      steps
        .filter(s => s.location)
        .map(s => ({
          id: s.id,
          title: s.name,
          coordinate: s.location,
        })),
    [steps],
  );

  const coordinates = path.length
    ? path
    : pins.map(p => p.coordinate);

  if (coordinates.length === 0) {
    return (
      <View style={[styles.fallback, {height}]}>
        <Text style={styles.fallbackTitle}>Map</Text>
        <Text style={styles.fallbackText}>
          Path appears once tracking records locations.
        </Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    const start = coordinates[0];
    const end = coordinates[coordinates.length - 1];
    return (
      <View style={[styles.fallback, {height}]}>
        <Text style={styles.fallbackTitle}>Route trace</Text>
        <Text style={styles.fallbackText}>
          {coordinates.length} points · {pins.length} stops
        </Text>
        <Text style={styles.coord}>
          Start {start.latitude.toFixed(4)}, {start.longitude.toFixed(4)}
        </Text>
        <Text style={styles.coord}>
          Latest {end.latitude.toFixed(4)}, {end.longitude.toFixed(4)}
        </Text>
        {pins.slice(0, 3).map(p => (
          <Text key={p.id} style={styles.pinLabel} numberOfLines={1}>
            · {p.title}
          </Text>
        ))}
        <Text style={styles.webHint}>Full map renders on iOS / Android.</Text>
      </View>
    );
  }

  // Lazy-require so web bundling does not pull native maps.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Maps = require('react-native-maps');
  const MapView = Maps.default;
  const {Marker, Polyline} = Maps;

  const latitudes = coordinates.map(c => c.latitude);
  const longitudes = coordinates.map(c => c.longitude);
  const region = {
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    latitudeDelta: Math.max(0.04, (Math.max(...latitudes) - Math.min(...latitudes)) * 1.6 || 0.08),
    longitudeDelta: Math.max(0.04, (Math.max(...longitudes) - Math.min(...longitudes)) * 1.6 || 0.08),
  };

  return (
    <View style={[styles.mapWrap, {height}]}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={region}>
        {coordinates.length > 1 ? (
          <Polyline
            coordinates={coordinates}
            strokeColor={COLORS.mapPath}
            strokeWidth={3}
          />
        ) : null}
        {pins.map(p => (
          <Marker
            key={p.id}
            coordinate={p.coordinate}
            title={p.title}
            pinColor={COLORS.mapPin}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  fallback: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.parchment,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  fallbackTitle: {
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  fallbackText: {color: COLORS.textSecondary, fontSize: FONT_SIZES.sm},
  coord: {
    marginTop: 4,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm,
    fontVariant: ['tabular-nums'],
  },
  pinLabel: {marginTop: 2, color: COLORS.accent, fontSize: FONT_SIZES.sm},
  webHint: {
    marginTop: SPACING.sm,
    color: COLORS.textDisabled,
    fontSize: FONT_SIZES.xs,
  },
});
