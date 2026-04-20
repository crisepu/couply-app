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
import { signInWithEmailAndPassword } from 'firebase/auth';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { firebaseAuth } from '@/lib/firebase';
import { authApi } from '@/api/endpoints/auth';
import { coupleApi } from '@/api/endpoints/couple';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { AuthStackParamList } from '@/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { setAuth, setCouple } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, data.email, data.password);
      const token = await credential.user.getIdToken();
      useAuthStore.setState({ token });
      const { data: user } = await authApi.getMe();
      setAuth(user, token);
      if (user.couple_id) {
        const { data: couple } = await coupleApi.get();
        setCouple(couple);
      }
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr?.code?.startsWith('auth/')) {
        setServerError(t('errors.loginFailed'));
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
          <Text style={styles.title}>{t('login.title')}</Text>

          <Controller
            control={control}
            name="email"
            rules={{
              required: t('errors.required'),
              pattern: { value: /\S+@\S+\.\S+/, message: t('errors.invalidEmail') },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('login.email')}
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
                label={t('login.password')}
                mode="outlined"
                secureTextEntry
                autoComplete="password"
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
            {t('login.submit')}
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('login.noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>{t('login.register')}</Text>
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
