// Expo Router is configured as the app entry in package.json ("main": "expo-router/entry").
// This App.tsx is intentionally a no-op to avoid duplicate provider trees.
// Keeping a minimal export ensures TypeScript can typecheck without pulling in legacy navigation.
export default function App() {
  return null;
}
