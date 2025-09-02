import React from 'react';
import { Platform } from 'react-native';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { WeatherScreen } from './screens/WeatherScreen';
import { UVIndexScreen } from './screens/UVIndexScreen';
import { ForecastScreen } from './screens/ForecastScreen';
import { SunscreenTrackerScreen } from './screens/SunscreenTrackerScreen';
import { ProfileScreen } from './screens/ProfileScreen';

import { WeatherIcon } from '../components/icons/WeatherIcon';
import { UVIcon } from '../components/icons/UVIcon';
import { ForecastIcon } from '../components/icons/ForecastIcon';
import { SunscreenIcon } from '../components/icons/SunscreenIcon';
import { ProfileIcon } from '../components/icons/ProfileIcon';
import { WeatherHomeIOS26 } from '../screens/WeatherHomeIOS26';
import { IconGallery } from '../components/icons/__dev__/IconGallery';

const isIOS26 = Platform.OS === 'ios' && parseFloat(String(Platform.Version)) >= 26;

const TabNavigator = createBottomTabNavigator({
  screens: {
    Weather: {
      screen: isIOS26 ? (WeatherHomeIOS26 as any) : WeatherScreen,
      options: {
        title: 'Weather',
        tabBarIcon: ({ color, size }) => <WeatherIcon size={size} color={color} />,
      },
    },
    UVIndex: {
      screen: UVIndexScreen,
      options: {
        title: 'UV Index',
        tabBarIcon: ({ color, size }) => <UVIcon size={size} color={color} />,
      },
    },
    Forecast: {
      screen: ForecastScreen,
      options: {
        title: 'Forecast',
        tabBarIcon: ({ color, size }) => <ForecastIcon size={size} color={color} />,
      },
    },
    Tracker: {
      screen: SunscreenTrackerScreen,
      options: {
        title: 'Tracker',
        tabBarIcon: ({ color, size }) => <SunscreenIcon size={size} color={color} />,
      },
    },
    Profile: {
      screen: ProfileScreen,
      options: {
        title: 'Profile',
        tabBarIcon: ({ color, size }) => <ProfileIcon size={size} color={color} />,
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
    ...(typeof __DEV__ !== 'undefined' && __DEV__
      ? {
          IconGallery: {
            screen: IconGallery,
            options: { title: 'Icon Gallery' },
          },
        }
      : {}),
  },
});

export const Navigation = createStaticNavigation(RootStack);
