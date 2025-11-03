/**
 * App Navigator
 * Root navigation structure for Atlas
 */

import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {settingsStorage} from '@utils/storage';
import {SCREEN_NAMES} from '@utils/constants';

// Navigation type definitions
export type RootStackParamList = {
  // Onboarding
  OnboardingWelcome: undefined;
  OnboardingLocation: undefined;
  OnboardingPhotos: undefined;
  OnboardingComplete: undefined;

  // Main App
  MainTabs: undefined;
  Home: undefined;
  TripTimeline: {tripId: string};
  StepDetail: {stepId: string; tripId: string};
  StepEdit: {stepId?: string; tripId: string};

  // Settings
  Settings: undefined;
  Permissions: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * App Navigator Component
 */
export const AppNavigator: React.FC = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const completed = await settingsStorage.isOnboardingCompleted();
    setIsOnboardingComplete(completed);
  };

  // Loading state
  if (isOnboardingComplete === null) {
    return null; // TODO: Add splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isOnboardingComplete ? 'MainTabs' : 'OnboardingWelcome'}
        screenOptions={{
          headerShown: false,
        }}>
        {!isOnboardingComplete ? (
          // Onboarding Stack
          <>
            <Stack.Screen name="OnboardingWelcome" component={PlaceholderScreen} />
            <Stack.Screen name="OnboardingLocation" component={PlaceholderScreen} />
            <Stack.Screen name="OnboardingPhotos" component={PlaceholderScreen} />
            <Stack.Screen name="OnboardingComplete" component={PlaceholderScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="MainTabs" component={PlaceholderScreen} />
            <Stack.Screen name="TripTimeline" component={PlaceholderScreen} />
            <Stack.Screen name="StepDetail" component={PlaceholderScreen} />
            <Stack.Screen name="StepEdit" component={PlaceholderScreen} />
            <Stack.Screen name="Settings" component={PlaceholderScreen} />
            <Stack.Screen name="Permissions" component={PlaceholderScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Placeholder component for screens
const PlaceholderScreen: React.FC = () => {
  return null; // Will be replaced with actual screens
};

export default AppNavigator;
