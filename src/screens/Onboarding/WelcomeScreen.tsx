/**
 * Welcome Screen - First onboarding screen
 * Shows value proposition and starts the onboarding flow
 */

import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {Button} from '@components/common';
import {COLORS, FONT_SIZES, SPACING} from '@utils/constants';

type WelcomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'OnboardingWelcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({navigation}) => {
  const handleStart = () => {
    navigation.navigate('OnboardingLocation');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Hero Icon/Illustration Placeholder */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconPlaceholder}>🗺️</Text>
        </View>

        <Text style={styles.title}>Atlas</Text>
        <Text style={styles.subtitle}>The journal that writes itself</Text>

        <View style={styles.features}>
          <FeatureItem
            icon="📍"
            text="Automatically tracks your journey"
          />
          <FeatureItem
            icon="📸"
            text="Curates your best photos"
          />
          <FeatureItem
            icon="📖"
            text="Creates a beautiful memory book"
          />
        </View>

        <Text style={styles.description}>
          Set it and forget it. Live your trip. We'll write the journal. You buy the book.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button title="Get Started" onPress={handleStart} size="large" fullWidth />
        <Text style={styles.privacyNote}>
          🔒 100% private. Your data never leaves your device.
        </Text>
      </View>
    </View>
  );
};

const FeatureItem: React.FC<{icon: string; text: string}> = ({icon, text}) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconPlaceholder: {
    fontSize: 64,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.xl,
  },
  privacyNote: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
