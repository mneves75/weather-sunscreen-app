/**
 * Skin type selector component
 */

import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';
import { SkinType } from '@/src/types';
import { getSkinTypeLabel } from '@/src/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SkinTypeSelectorProps {
  value: SkinType;
  onChange: (skinType: SkinType) => void;
  locale?: string;
}

const skinTypes: SkinType[] = ['very-fair', 'fair', 'medium', 'olive', 'brown', 'black'];

export const SkinTypeSelector = React.memo<SkinTypeSelectorProps>(({ 
  value, 
  onChange,
  locale = 'en',
}) => {
  const colors = useColors();
  const { t } = useTranslation();
  
  return (
    <View style={styles.container}>
      <Text variant="body1" style={[styles.label, { color: colors.onSurface }]}>
        {t('skinTypeSelector.label', 'Skin Type')}
      </Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {skinTypes.map((skinType) => {
          const isSelected = value === skinType;
          
          return (
            <TouchableOpacity
              key={skinType}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceVariant,
                  borderColor: isSelected ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => onChange(skinType)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={getSkinTypeLabel(skinType, locale)}
            >
              <Text
                variant="body2"
                style={{
                  color: isSelected ? colors.onPrimaryContainer : colors.onSurfaceVariant,
                }}
              >
                {getSkinTypeLabel(skinType, locale)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

SkinTypeSelector.displayName = 'SkinTypeSelector';

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    paddingHorizontal: 4,
  },
  optionsContainer: {
    gap: 8,
    paddingHorizontal: 4,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
});
