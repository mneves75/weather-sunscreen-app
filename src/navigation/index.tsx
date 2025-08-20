import React from 'react';
import { Text } from 'react-native';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { WeatherScreen } from './screens/WeatherScreen';
import { UVIndexScreen } from './screens/UVIndexScreen';
import { ForecastScreen } from './screens/ForecastScreen';
import { SunscreenTrackerScreen } from './screens/SunscreenTrackerScreen';

import { WeatherIcon } from '../components/icons/WeatherIcon';
import { UVIcon } from '../components/icons/UVIcon';
import { ForecastIcon } from '../components/icons/ForecastIcon';
import { ProfileIcon } from '../components/icons/ProfileIcon';

const TabNavigator = createBottomTabNavigator({
  screens: {
    Weather: {
      screen: WeatherScreen,
      options: {
        title: 'Weather',
        tabBarIcon: ({ color, size }) => (
          <WeatherIcon size={size} color={color} />
        ),
      },
    },
    UVIndex: {
      screen: UVIndexScreen,
      options: {
        title: 'UV Index',
        tabBarIcon: ({ color, size }) => (
          <UVIcon size={size} color={color} />
        ),
      },
    },
    Forecast: {
      screen: ForecastScreen,
      options: {
        title: 'Forecast',
        tabBarIcon: ({ color, size }) => (
          <ForecastIcon size={size} color={color} />
        ),
      },
    },
    Tracker: {
      screen: SunscreenTrackerScreen,
      options: {
        title: 'Tracker',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>🧴</Text>
        ),
      },
    },
  },
});

const RootStack = createNativeStackNavigator({
  screens: {
    HomeTabs: {
      screen: TabNavigator,
      options: {
        headerShown: false,
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);