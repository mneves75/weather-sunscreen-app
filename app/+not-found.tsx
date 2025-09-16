import React from 'react';
import { Link, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function NotFound() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Página não encontrada
      </Text>
      <Text style={styles.body}>
        A rota acessada não existe ou foi movida. Use os atalhos abaixo para continuar navegando.
      </Text>
      <Link href="/" asChild>
        <Text accessibilityRole="link" style={styles.link}>
          Voltar para início
        </Text>
      </Link>
      <Text
        onPress={() => router.back()}
        accessibilityRole="button"
        style={[styles.link, styles.back]}
      >
        Voltar
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 320,
  },
  link: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  back: {
    textDecorationLine: 'underline',
  },
});
