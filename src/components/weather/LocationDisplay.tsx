/**
 * Location display component with coordinates
 */

import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { Location } from '@/src/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface LocationDisplayProps {
  location: Location;
  onPress?: () => void;
  showCoordinates?: boolean;
}

export const LocationDisplay = React.memo<LocationDisplayProps>(({ 
  location, 
  onPress,
  showCoordinates = false,
}) => {
  const colors = useColors();
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      style={[styles.container, { backgroundColor: colors.surfaceVariant }]}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`Location: ${location.city}${location.country ? `, ${location.country}` : ''}`}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📍</Text>
      </View>
      
      <View style={styles.textContainer}>
        <Text variant="body1" style={{ color: colors.onSurface }}>
          {location.city || 'Unknown Location'}
        </Text>
        
        {location.country && (
          <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
            {location.country}
          </Text>
        )}
        
        {showCoordinates && (
          <Text variant="caption" style={{ color: colors.onSurfaceVariant }}>
            {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      
      {onPress && (
        <Text style={styles.chevron}>›</Text>
      )}
    </Container>
  );
});

LocationDisplay.displayName = 'LocationDisplay';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  chevron: {
    fontSize: 24,
    opacity: 0.5,
  },
});

