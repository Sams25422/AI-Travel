import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '../theme';
import type {MainTabParamList} from './types';
import HomeScreen from '../screens/Home/HomeScreen';
import TripListScreen from '../screens/Home/TripListScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({label, focused}: {label: string; focused: boolean}) {
  return (
    <Text style={{fontSize: 16, opacity: focused ? 1 : 0.45}}>{label}</Text>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.gray200,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({focused}) => <TabIcon label="🗺️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Trips"
        component={TripListScreen}
        options={{
          tabBarLabel: 'Trips',
          tabBarIcon: ({focused}) => <TabIcon label="📓" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({focused}) => <TabIcon label="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
