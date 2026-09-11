import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useApp} from '../context/AppContext';
import {COLORS} from '../theme';
import type {RootStackParamList, OnboardingStackParamList, MainTabParamList} from './types';

import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import LocationPermissionScreen from '../screens/Onboarding/LocationPermissionScreen';
import PhotoPermissionScreen from '../screens/Onboarding/PhotoPermissionScreen';
import OnboardingDoneScreen from '../screens/Onboarding/OnboardingDoneScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import TripListScreen from '../screens/Home/TripListScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import TripTimelineScreen from '../screens/Trip/TripTimelineScreen';
import StepEditScreen from '../screens/Trip/StepEditScreen';
import BookPreviewScreen from '../screens/Book/BookPreviewScreen';
import CheckoutScreen from '../screens/Book/CheckoutScreen';
import OrderConfirmationScreen from '../screens/Book/OrderConfirmationScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{headerShown: false}}>
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="LocationPermission" component={LocationPermissionScreen} />
      <OnboardingStack.Screen name="PhotoPermission" component={PhotoPermissionScreen} />
      <OnboardingStack.Screen name="OnboardingDone" component={OnboardingDoneScreen} />
    </OnboardingStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {backgroundColor: COLORS.surface, borderTopColor: COLORS.gray200},
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{title: 'Map'}} />
      <Tab.Screen name="Trips" component={TripListScreen} options={{title: 'Trips'}} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{title: 'Settings'}} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const {ready, onboardingComplete} = useApp();

  if (!ready) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background}}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {!onboardingComplete ? (
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} options={{headerShown: false}} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainTabs} options={{headerShown: false}} />
            <RootStack.Screen
              name="TripTimeline"
              component={TripTimelineScreen}
              options={{title: 'Trip', headerTintColor: COLORS.primary}}
            />
            <RootStack.Screen
              name="StepEdit"
              component={StepEditScreen}
              options={{title: 'Edit step', headerTintColor: COLORS.primary}}
            />
            <RootStack.Screen
              name="BookPreview"
              component={BookPreviewScreen}
              options={{title: 'Book preview', headerTintColor: COLORS.primary}}
            />
            <RootStack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{title: 'Checkout', headerTintColor: COLORS.primary}}
            />
            <RootStack.Screen
              name="OrderConfirmation"
              component={OrderConfirmationScreen}
              options={{headerShown: false}}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
