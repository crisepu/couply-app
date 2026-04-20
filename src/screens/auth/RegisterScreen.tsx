import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { firebaseAuth } from '@/lib/firebase';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { AuthStackParamList } from '@/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export default function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
      await updateProfile(credential.user, { displayName: data.name });
      const token = await credential.user.getIdToken(true);
      useAuthStore.setState({ token });
      const { data: user } = await authApi.register();
      setAuth(user, token);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr?.code?.startsWith('auth/')) {
        setServerError(t('errors.registerFailed'));
      } else {
        setServerError(t('errors.networkError'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('register.title')}</Text>

          <Controller
            control={control}
            name="name"
            rules={{ required: t('errors.required') }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('register.name')}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="name"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={!!errors.name}
                style={styles.input}
              />
            )}
          />
          {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}

          <Controller
            control={control}
            name="email"
            rules={{
              required: t('errors.required'),
              pattern: { value: /\S+@\S+\.\S+/, message: t('errors.invalidEmail') },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('register.email')}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={!!errors.email}
                style={styles.input}
              />
            )}
          />
          {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}

          <Controller
            control={control}
            name="password"
            rules={{
              required: t('errors.required'),
              minLength: { value: 6, message: t('errors.passwordMin') },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('register.password')}
                mode="outlined"
                secureTextEntry
                autoComplete="new-password"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={!!errors.password}
                style={styles.input}
              />
            )}
          />
          {errors.password && <HelperText type="error">{errors.password.message}</HelperText>}

          {serverError && (
            <HelperText type="error" style={styles.serverError}>
              {serverError}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            labelStyle={styles.submitLabel}
            contentStyle={styles.buttonContent}
          >
            {t('register.submit')}
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('register.hasAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>{t('register.login')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  input: { backgroundColor: Colors.surface },
  serverError: { marginTop: Spacing.xs },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  submitLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  buttonContent: { paddingVertical: Spacing.xs },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  footerLink: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
});
