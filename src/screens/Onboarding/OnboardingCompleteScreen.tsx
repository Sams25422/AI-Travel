/**
 * Onboarding Complete Screen
 * Congratulates user and navigates to main app
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {Button} from '@components/common';
import {useApp} from '@contexts';
import {COLORS, FONT_SIZES, SPACING} from '@utils/constants';

type OnboardingCompleteScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'OnboardingComplete'>;
};

export const OnboardingCompleteScreen: React.FC<OnboardingCompleteScreenProps> = ({
  navigation,
}) => {
  const {completeOnboarding} = useApp();

  const handleGetStarted = async () => {
    // Mark onboarding as complete
    await completeOnboarding();

    // Navigation will automatically update via AppContext
    // The AppNavigator listens to isOnboardingComplete
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✅</Text>
        </View>

        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>Atlas is ready to capture your adventures</Text>

        {/* Next steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>What happens next:</Text>

          <StepItem
            number="1"
            title="Start a Trip"
            description="When you're ready to travel, tap 'New Trip' on the home screen"
          />

          <StepItem
            number="2"
            title="Live Your Journey"
            description="Atlas runs in the background - just enjoy your trip!"
          />

          <StepItem
            number="3"
            title="Review Your Journal"
            description="Check your timeline anytime to see the magic happening"
          />

          <StepItem
            number="4"
            title="Order Your Book"
            description="When your trip is done, create a beautiful printed memory book"
          />
        </View>

        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
          <Text style={styles.tipsText}>
            • Keep your phone charged during travel{'\n'}
            • Atlas uses minimal battery when you're not moving{'\n'}
            • You can manually add or edit steps anytime{'\n'}
            • Your data is only on your phone - private and secure
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Start Using Atlas"
          onPress={handleGetStarted}
          size="large"
          fullWidth
        />
      </View>
    </View>
  );
};

const StepItem: React.FC<{number: string; title: string; description: string}> = ({
  number,
  title,
  description,
}) => (
  <View style={styles.stepItem}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.success + '30',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.xxl,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  stepsContainer: {
    marginBottom: SPACING.lg,
  },
  stepsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  tipsBox: {
    backgroundColor: COLORS.primaryLight + '30',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
  },
  tipsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  tipsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
});

export default OnboardingCompleteScreen;
