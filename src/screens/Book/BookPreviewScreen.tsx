import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import BookService from '../../services/BookService';
import TripService from '../../services/TripService';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BookPreview'>;

export default function BookPreviewScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const [html, setHtml] = useState('');
  const [pages, setPages] = useState(0);
  const [price, setPrice] = useState(0);
  const {width} = useWindowDimensions();

  useEffect(() => {
    (async () => {
      const trip = await TripService.getTrip(tripId);
      const steps = await TripService.getSteps(tripId);
      setHtml(await BookService.buildPreviewHtml(tripId));
      const p = BookService.estimatePages(steps.length);
      setPages(p);
      setPrice(BookService.calculatePrice('hardcover', '8x10', p));
      if (trip) navigation.setOptions({title: `${trip.name} book`});
    })();
  }, [navigation, tripId]);

  // Lightweight text preview extracted from HTML for native/web without WebView dependency
  const plain = html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{padding: SPACING.lg, maxWidth: Math.min(720, width)}}>
        <Text style={styles.badge}>Hardcover · 8×10 · {pages} pages</Text>
        <Text style={styles.price}>${(price / 100).toFixed(2)}</Text>
        <View style={styles.preview}>
          <Text style={styles.previewText}>{plain || 'Building preview…'}</Text>
        </View>
      </ScrollView>
      <Pressable
        style={styles.cta}
        onPress={() => navigation.navigate('Checkout', {tripId})}>
        <Text style={styles.ctaText}>Continue to checkout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  badge: {color: COLORS.accent, fontWeight: '600', marginBottom: SPACING.xs},
  price: {fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.lg},
  preview: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  previewText: {color: COLORS.textPrimary, lineHeight: 22},
  cta: {
    margin: SPACING.lg,
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  ctaText: {color: COLORS.textInverse, fontWeight: '700', fontSize: FONT_SIZES.md},
});
