import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useColors } from '../../../context/ThemeContext';
import { ColorScheme } from '../../../types/theme';
import { getAllWeatherCodes } from '../../../utils/weatherCodeMapping';

export function IconGallery() {
  const colors = useColors();
  const styles = createStyles(colors);
  const codes = getAllWeatherCodes();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Weather Icon Gallery (WMO)</Text>
      {codes.map(({ code, info }) => (
        <View key={code} style={styles.row}>
          <Text style={styles.icon}>{info.icon}</Text>
          <Text style={styles.code}>#{code}</Text>
          <Text style={styles.desc}>{info.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    icon: {
      fontSize: 20,
      width: 30,
      textAlign: 'center',
    },
    code: {
      width: 50,
      color: colors.secondary,
      fontFamily: 'monospace',
    },
    desc: {
      flex: 1,
      color: colors.primary,
    },
  });
}

export default IconGallery;
