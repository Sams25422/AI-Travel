/**
 * Photo Permission Screen
 * Explains why we need photo library access and requests it
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {Button} from '@components/common';
import {PermissionService} from '@services';
import {COLORS, FONT_SIZES, SPACING} from '@utils/constants';

type PhotoPermissionScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'OnboardingPhotos'>;
};

export const PhotoPermissionScreen: React.FC<PhotoPermissionScreenProps> = ({navigation}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnablePhotos = async () => {
    try {
      setIsRequesting(true);

      // Request photo library permission
      const status = await PermissionService.requestPhotoLibraryPermission();

      if (status === 'granted') {
        // Permission granted, complete onboarding
        navigation.navigate('OnboardingComplete');
      } else if (status === 'denied') {
        // Permission denied, show alert
        Alert.alert(
          'Permission Required',
          'Atlas needs "Full Access" to your photo library to create your journal. Please enable it in Settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Open Settings',
              onPress: () => PermissionService.openSettings(),
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error requesting photo permission:', error);
      Alert.alert('Error', 'Failed to request photo permission. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    // Allow skip but move forward
    navigation.navigate('OnboardingComplete');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📸</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Find Your Best Moments</Text>
        <Text style={styles.subtitle}>
          Let Atlas automatically select your best photos for your journal
        </Text>

        {/* Why we need it */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What we do:</Text>

          <BulletPoint
            icon="🤖"
            text="Scan your photos to find travel moments"
          />
          <BulletPoint
            icon="✨"
            text="Filter out screenshots, receipts, and blurry photos"
          />
          <BulletPoint
            icon="⭐"
            text="Select the best quality photos for each location"
          />
          <BulletPoint
            icon="📍"
            text="Match photos to the places you visited"
          />
        </View>

        {/* Privacy promise */}
        <View style={styles.privacyBox}>
          <Text style={styles.privacyTitle}>🔒 Your Photos Stay Private</Text>
          <Text style={styles.privacyText}>
            • All photo analysis happens ON YOUR PHONE{'\n'}
            • We NEVER upload or see your photos{'\n'}
            • Only photo metadata (not images) is stored{'\n'}
            • You have complete control - add or remove any photo
          </Text>
        </View>

        {/* Important note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>⚠️ Important</Text>
          <Text style={styles.noteText}>
            Please select "Full Access" (not "Select Photos"). This allows Atlas to
            automatically find all your travel photos as you take them.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Enable Photo Access"
          onPress={handleEnablePhotos}
          size="large"
          fullWidth
          loading={isRequesting}
        />
        <Button
          title="I'll do this later"
          onPress={handleSkip}
          variant="outline"
          size="medium"
          fullWidth
          style={styles.skipButton}
        />
      </View>
    </View>
  );
};

const BulletPoint: React.FC<{icon: string; text: string}> = ({icon, text}) => (
  <View style={styles.bulletPoint}>
    <Text style={styles.bulletIcon}>{icon}</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
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
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bulletIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  privacyBox: {
    backgroundColor: COLORS.info + '20',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.info,
  },
  privacyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.info,
    marginBottom: SPACING.sm,
  },
  privacyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  noteBox: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  noteTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: SPACING.sm,
  },
  noteText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  skipButton: {
    marginTop: SPACING.md,
  },
});

export default PhotoPermissionScreen;
