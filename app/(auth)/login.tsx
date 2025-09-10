import React, { useState } from 'react';
import { View, TextInput, Text, AccessibilityInfo } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../src/components/ui/Button';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const [submitted, setSubmitted] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (_data: FormValues) => {
    setSubmitted(true);
    AccessibilityInfo.announceForAccessibility('Login enviado');
  };

  return (
    <View style={{ padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700' }}>
        Entrar
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            accessibilityLabel="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            placeholder="email@exemplo.com"
            style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 12 }}
          />
        )}
      />
      {errors.email && (
        <Text accessibilityLiveRegion="polite" style={{ color: '#B00020', marginTop: 4 }}>
          {errors.email.message}
        </Text>
      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            accessibilityLabel="Senha"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            placeholder="********"
            style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 12 }}
          />
        )}
      />
      {errors.password && (
        <Text accessibilityLiveRegion="polite" style={{ color: '#B00020', marginTop: 4 }}>
          {errors.password.message}
        </Text>
      )}

      <Button
        label="Entrar"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={{ marginTop: 16 }}
      />
      {submitted && <Text style={{ marginTop: 12 }}>Enviado</Text>}
    </View>
  );
}
