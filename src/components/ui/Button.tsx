import React, { memo } from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

function Button({ label, onPress, disabled, loading, style, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      hitSlop={8}
      style={({ pressed }) => [
        {
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          alignItems: 'center',
          opacity: disabled || loading ? 0.6 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          backgroundColor: '#2563EB',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ fontWeight: '700', color: '#fff' }}>{label}</Text>
      )}
    </Pressable>
  );
}
export default memo(Button);
