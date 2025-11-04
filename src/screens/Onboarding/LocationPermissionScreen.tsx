/**
 * Location Permission Screen
 * Explains why we need location permission and requests it
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {Button} from '@components/common';
import {PermissionService} from '@services';
import {COLORS, FONT_SIZES, SPACING} from '@utils/constants';

type LocationPermissionScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'OnboardingLocation'>;
};

export const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({
  navigation,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnableLocation = async () => {
    try {
      setIsRequesting(true);

      // Request location permission
      const status = await PermissionService.requestLocationAlwaysPermission();

      if (status === 'granted') {
        // Permission granted, move to next screen
        navigation.navigate('OnboardingPhotos');
      } else if (status === 'denied') {
        // Permission denied, show alert
        Alert.alert(
          'Permission Required',
          'Atlas needs "Always Allow" location permission to automatically track your journeys. Please enable it in Settings.',
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
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    // Allow skip but move forward
    navigation.navigate('OnboardingPhotos');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📍</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Track Your Journey</Text>
        <Text style={styles.subtitle}>Atlas needs your location to create your travel map</Text>

        {/* Why we need it */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why we need this:</Text>

          <BulletPoint
            icon="✈️"
            text="Automatically detect flights, drives, and walks"
          />
          <BulletPoint
            icon="🏛️"
            text="Find the places you visit (museums, restaurants, landmarks)"
          />
          <BulletPoint
            icon="🗺️"
            text="Draw your complete journey on the map"
          />
        </View>

        {/* Privacy promise */}
        <View style={styles.privacyBox}>
          <Text style={styles.privacyTitle}>🔒 Your Privacy is Guaranteed</Text>
          <Text style={styles.privacyText}>
            • Your location is stored only on your phone{'\n'}
            • We never sell or share your data{'\n'}
            • You can delete everything anytime{'\n'}
            • Tracking only happens during active trips
          </Text>
        </View>

        {/* Important note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>⚠️ Important</Text>
          <Text style={styles.noteText}>
            Please select "Always Allow" when prompted. This lets Atlas track your journey even
            when the app is closed, so you never miss a moment.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Enable Location Tracking"
          onPress={handleEnableLocation}
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
    backgroundColor: COLORS.primaryLight,
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
    backgroundColor: COLORS.success + '20',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  privacyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.success,
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

export default LocationPermissionScreen;
