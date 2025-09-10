import React from 'react';
import { View, Text } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
        Modal
      </Text>
      <Text>Conteúdo modal simples</Text>
    </View>
  );
}
