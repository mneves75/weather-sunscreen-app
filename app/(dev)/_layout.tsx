/**
 * Developer routes layout
 */

import { Stack } from 'expo-router';

export default function DevLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="icon-gallery" options={{ title: 'Icon Gallery' }} />
      <Stack.Screen name="glass-gallery" options={{ title: 'Glass Gallery' }} />
    </Stack>
  );
}
