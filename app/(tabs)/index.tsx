import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import Button from '../../src/components/ui/Button';

export default function HomeScreen() {
  const data = useMemo(() => Array.from({ length: 1500 }, (_, i) => `Item ${i + 1}`), []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
        Home
      </Text>
      <Button label="Ação" onPress={() => {}} accessibilityLabel="Executar ação" />
      <FlatList
        accessibilityLabel="Lista de itens"
        data={data}
        keyExtractor={(item) => item}
        initialNumToRender={16}
        windowSize={12}
        removeClippedSubviews
        maxToRenderPerBatch={24}
        updateCellsBatchingPeriod={16}
        getItemLayout={(_, index) => ({ length: 56, offset: 56 * index, index })}
        renderItem={({ item }) => (
          <View style={{ height: 56, justifyContent: 'center' }}>
            <Text>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}
