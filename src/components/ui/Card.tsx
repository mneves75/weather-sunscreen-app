import React, { PropsWithChildren, memo } from 'react';
import { View, ViewStyle } from 'react-native';

type Props = PropsWithChildren<{ style?: ViewStyle }>;

function Card({ children, style }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          padding: 16,
        },
        style,
      ]}
      accessibilityRole="summary"
    >
      {children}
    </View>
  );
}

export default memo(Card);
