import React, { memo, useMemo } from 'react';
import { View, ViewStyle } from 'react-native';

type Props = { style?: ViewStyle };

function Skeleton({ style }: Props) {
  const bg = useMemo(() => ({ backgroundColor: '#E5E7EB' }), []);
  return (
    <View style={[{ height: 16, borderRadius: 8 }, bg, style]} accessibilityLabel="skeleton" />
  );
}

export default memo(Skeleton);
