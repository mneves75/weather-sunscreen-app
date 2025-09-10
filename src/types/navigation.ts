import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  HomeTabs: undefined;
  IconGallery?: undefined;
};

export type TabParamList = {
  Weather: undefined;
  UVIndex: undefined;
  Forecast: undefined;
  Tracker: undefined;
  Profile: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type TabNavigationProp = BottomTabNavigationProp<TabParamList>;
