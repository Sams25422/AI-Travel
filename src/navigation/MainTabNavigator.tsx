/**
 * Main Tab Navigator
 * Bottom tab navigation for main app screens
 */

import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeScreen} from '../screens/Home';
import {COLORS} from '@utils/constants';
import {LoadingSpinner} from '@components/common';

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
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Journeys',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="TripList"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Active Trip',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>✈️</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Placeholder component for unimplemented tabs
const PlaceholderScreen: React.FC = () => {
  return <LoadingSpinner message="Coming soon..." />;
};

export default MainTabNavigator;
