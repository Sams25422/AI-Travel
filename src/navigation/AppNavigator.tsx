/**
 * App Navigator
 * Root navigation structure for Atlas
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useApp} from '@contexts';
import {LoadingSpinner} from '@components/common';

// Import Screens
import {
  WelcomeScreen,
  LocationPermissionScreen,
  PhotoPermissionScreen,
  OnboardingCompleteScreen,
} from '../screens/Onboarding';
import {HomeScreen} from '../screens/Home';
import {TripTimelineScreen} from '../screens/Trip';
import MainTabNavigator from './MainTabNavigator';

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
  const {isOnboardingComplete, isLoading} = useApp();

  // Show loading while checking onboarding status
  if (isLoading) {
    return <LoadingSpinner message="Loading Atlas..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isOnboardingComplete ? 'MainTabs' : 'OnboardingWelcome'}
        screenOptions={{
          headerShown: false,
          cardStyle: {backgroundColor: 'white'},
        }}>
        {!isOnboardingComplete ? (
          // Onboarding Stack
          <>
            <Stack.Screen name="OnboardingWelcome" component={WelcomeScreen} />
            <Stack.Screen name="OnboardingLocation" component={LocationPermissionScreen} />
            <Stack.Screen name="OnboardingPhotos" component={PhotoPermissionScreen} />
            <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="TripTimeline" component={TripTimelineScreen} />
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

// Temporary placeholder for unimplemented screens
const PlaceholderScreen: React.FC = () => {
  return <LoadingSpinner message="Screen coming soon..." />;
};

export default AppNavigator;
