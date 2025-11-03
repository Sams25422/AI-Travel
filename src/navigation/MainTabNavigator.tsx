/**
 * Main Tab Navigator
 * Bottom tab navigation for main app screens
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SCREEN_NAMES, COLORS} from '@utils/constants';

export type MainTabParamList = {
  Home: undefined;
  TripList: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main Tab Navigator Component
 */
export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray200,
          borderTopWidth: 1,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Map',
          // TODO: Add icon
        }}
      />
      <Tab.Screen
        name="TripList"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Trips',
          // TODO: Add icon
        }}
      />
      <Tab.Screen
        name="Settings"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Settings',
          // TODO: Add icon
        }}
      />
    </Tab.Navigator>
  );
};

// Placeholder component
const PlaceholderScreen: React.FC = () => {
  return null;
};

export default MainTabNavigator;
