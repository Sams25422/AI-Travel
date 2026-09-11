import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import * as Print from 'expo-print';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import type {Step, Trip} from '../../models';
import BookService from '../../services/BookService';
import TripService from '../../services/TripService';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';
import {formatDate} from '../../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'BookPreview'>;

export default function BookPreviewScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [html, setHtml] = useState('');
  const [pages, setPages] = useState(0);
  const [price, setPrice] = useState(0);
  const [printing, setPrinting] = useState(false);
  const {width} = useWindowDimensions();

  useEffect(() => {
    (async () => {
      const t = await TripService.getTrip(tripId);
      const s = await TripService.getSteps(tripId);
      setTrip(t);
      setSteps(s);
      setHtml(await BookService.buildPreviewHtml(tripId));
      const p = BookService.estimatePages(s.length);
      setPages(p);
      setPrice(BookService.calculatePrice('hardcover', '8x10', p));
      if (t) navigation.setOptions({title: `${t.name} book`});
    })();
  }, [navigation, tripId]);

  const onPrint = async () => {
    if (!html) return;
    setPrinting(true);
    try {
      await Print.printAsync({html});
    } catch {
      // User cancelled or platform unsupported — ignore
    } finally {
      setPrinting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          padding: SPACING.lg,
          maxWidth: Math.min(720, width),
          paddingBottom: SPACING.xxl,
        }}>
        <Text style={styles.brand}>Atlas press</Text>
        <Text style={styles.tripName}>{trip?.name || 'Your journey'}</Text>
        <Text style={styles.badge}>Hardcover · 8×10 · {pages} pages</Text>
        <Text style={styles.price}>${(price / 100).toFixed(2)}</Text>
        <Text style={styles.subtitle}>
          {trip?.startDate ? formatDate(trip.startDate) : ''}
          {trip?.endDate ? ` – ${formatDate(trip.endDate)}` : ''}
          {steps.length ? ` · ${steps.length} moments` : ''}
        </Text>

        {steps.length === 0 ? (
          <View style={styles.page}>
            <Text style={styles.pageNotes}>
              No steps yet — complete a trip or add journal entries first.
            </Text>
          </View>
        ) : (
          steps.map((step, i) => (
            <View key={step.id} style={styles.page}>
              <Text style={styles.pageNum}>Page {i + 1}</Text>
              <Text style={styles.pageTitle}>{step.name}</Text>
              <Text style={styles.pageMeta}>
                {step.type.toUpperCase()} · {formatDate(step.startTime)}
              </Text>
              {step.photos[0]?.uri ? (
                <Image source={{uri: step.photos[0].uri}} style={styles.pageImage} />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>No photo</Text>
                </View>
              )}
              <Text style={styles.pageNotes}>
                {step.notes || 'A moment from the journey.'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.secondary} onPress={onPrint} disabled={printing || !html}>
          {printing ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.secondaryText}>Print / share layout</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.cta}
          onPress={() => navigation.navigate('Checkout', {tripId})}>
          <Text style={styles.ctaText}>Continue to checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  brand: {
    color: COLORS.accent,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.xs,
  },
  tripName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  badge: {color: COLORS.accent, fontWeight: '600', marginBottom: SPACING.xs},
  price: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {color: COLORS.textSecondary, marginBottom: SPACING.lg},
  page: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  pageNum: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1,
    fontWeight: '700',
  },
  pageTitle: {
    marginTop: 6,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pageMeta: {color: COLORS.textSecondary, fontSize: FONT_SIZES.sm, marginTop: 4},
  pageImage: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.parchment,
  },
  placeholder: {
    height: 140,
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.parchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {color: COLORS.textDisabled},
  pageNotes: {marginTop: SPACING.md, color: COLORS.textPrimary, lineHeight: 22},
  footer: {padding: SPACING.lg, gap: SPACING.sm},
  secondary: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  secondaryText: {color: COLORS.primary, fontWeight: '700'},
  cta: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  ctaText: {color: COLORS.textInverse, fontWeight: '700', fontSize: FONT_SIZES.md},
});
