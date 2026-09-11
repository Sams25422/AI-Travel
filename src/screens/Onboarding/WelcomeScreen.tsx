import React from 'react';
import {View, Text, StyleSheet, Pressable, Platform} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {OnboardingStackParamList} from '../../navigation/types';
import {COLORS, FONT_SIZES, SPACING, RADIUS} from '../../theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export default function WelcomeScreen({navigation}: Props) {
  const goNext = () => {
    navigation.navigate('LocationPermission');
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.brand} accessibilityRole="header">
          Atlas
        </Text>
        <Text style={styles.tagline}>The journal that writes itself</Text>
        <Text style={styles.body}>
          Live your trip. Atlas quietly tracks the path, curates your best photos
          on-device, and turns the journey into a book you can hold.
        </Text>
      </View>
      <Pressable
        style={({pressed}) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={goNext}
        accessibilityRole="button"
        accessibilityLabel="Get started"
        testID="get-started"
        // @ts-expect-error web cursor
        cursor={Platform.OS === 'web' ? 'pointer' : undefined}>
        <Text style={styles.ctaText}>Get started</Text>
      </Pressable>
      <Text style={styles.privacy}>100% private · photos never leave your phone</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    justifyContent: 'space-between',
  },
  hero: {flex: 1, justifyContent: 'center'},
  brand: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  body: {fontSize: FONT_SIZES.md, lineHeight: 24, color: COLORS.textSecondary},
  cta: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  ctaPressed: {opacity: 0.85},
  ctaText: {color: COLORS.textInverse, fontSize: FONT_SIZES.lg, fontWeight: '600'},
  privacy: {
    textAlign: 'center',
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
});
