import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useColors } from '../../context/ThemeContext';
import { ColorScheme } from '../../types/theme';
import Constants from 'expo-constants';

export function ProfileScreen() {
  const { themeMode, toggleTheme, isDark } = useTheme();
  const colors = useColors();
  const styles = createStyles(colors);
  const navigation = useNavigation<any>();

  const getThemeDisplayName = (mode: string): string => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Unknown';
    }
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.userName}>Weather User</Text>
        <Text style={styles.userEmail}>user@weathersunscreen.app</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
          <Text style={styles.settingLabel}>Theme</Text>
          <Text style={styles.settingValue}>
            {getThemeDisplayName(themeMode)} {isDark ? '🌙' : '☀️'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Temperature Unit</Text>
          <Text style={styles.settingValue}>Celsius</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Skin Type</Text>
          <Text style={styles.settingValue}>Medium</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Text style={styles.settingValue}>On</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Text style={styles.settingValue}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Terms of Service</Text>
          <Text style={styles.settingValue}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.settingValue}>{Constants.expoConfig?.version || '1.0.0'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={[styles.settingItem, styles.signOutButton]}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {__DEV__ && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('IconGallery')}
          >
            <Text style={styles.settingLabel}>Icon Gallery (Dev)</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.temperature,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 32,
      color: '#FFFFFF',
    },
    userName: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      color: colors.secondary,
    },
    section: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.primary,
    },
    settingValue: {
      fontSize: 16,
      color: colors.temperature,
      fontWeight: '500',
    },
    signOutButton: {
      justifyContent: 'center',
      borderBottomWidth: 0,
    },
    signOutText: {
      fontSize: 16,
      color: colors.error,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
}
