import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/theme';
import { LiquidGlassWrapper } from '../glass/LiquidGlassWrapper';

interface QuickActionsGridProps {
  onWeatherPress: () => void;
  onUVPress: () => void;
  onForecastPress: () => void;
  onSettingsPress: () => void;
  style?: ViewStyle;
}

function QuickActionsGrid({
  onWeatherPress,
  onUVPress,
  onForecastPress,
  onSettingsPress,
  style,
}: QuickActionsGridProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <LiquidGlassWrapper variant="thin" style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          <View style={styles.row}>
            <ActionButton
              title="Weather Details"
              subtitle="Current conditions"
              icon="🌤️"
              onPress={onWeatherPress}
              colors={colors}
              style={styles.button}
            />
            <ActionButton
              title="UV Safety"
              subtitle="Sun protection"
              icon="☀️"
              onPress={onUVPress}
              colors={colors}
              style={styles.rightButton}
            />
          </View>

          <View style={styles.row}>
            <ActionButton
              title="7-Day Forecast"
              subtitle="Weather ahead"
              icon="📊"
              onPress={onForecastPress}
              colors={colors}
              style={styles.button}
            />
            <ActionButton
              title="Settings"
              subtitle="Preferences"
              icon="⚙️"
              onPress={onSettingsPress}
              colors={colors}
              style={styles.rightButton}
            />
          </View>
        </View>
      </View>
    </LiquidGlassWrapper>
  );
}

interface ActionButtonProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  colors: any;
  style?: ViewStyle;
}

const ActionButton = memo(function ActionButton({
  title,
  subtitle,
  icon,
  onPress,
  colors,
  style,
}: ActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? colors.surface + '80' : colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
        },
        buttonStyles.container,
        style,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${subtitle}`}
    >
      <Text style={buttonStyles.icon}>{icon}</Text>
      <View style={buttonStyles.textContainer}>
        <Text style={[buttonStyles.title, { color: colors.primary }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[buttonStyles.subtitle, { color: colors.secondary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
});

const buttonStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      borderRadius: 16,
    },
    content: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 16,
    },
    grid: {
      gap: 12,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
    },
    rightButton: {
      flex: 1,
      // Additional styling for right buttons if needed
    },
  });

export { QuickActionsGrid };
export default memo(QuickActionsGrid);
