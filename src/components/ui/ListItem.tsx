import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

function ListItem({ title, subtitle, onPress }: Props) {
  const content = (
    <View style={{ paddingVertical: 14, gap: 2 }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{title}</Text>
      {subtitle ? <Text style={{ color: '#64748B' }}>{subtitle}</Text> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ paddingVertical: 10, opacity: pressed ? 0.8 : 1 })}
    >
      {content}
    </Pressable>
  );
}

export default memo(ListItem);
