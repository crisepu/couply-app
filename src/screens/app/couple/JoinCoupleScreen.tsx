import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { coupleApi } from '@/api/endpoints/couple';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { AppStackParamList } from '@/types';

type Props = NativeStackScreenProps<AppStackParamList, 'JoinCouple'>;

interface JoinFormData {
  invite_code: string;
}

export default function JoinCoupleScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user, token, setCouple, setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinFormData>({ defaultValues: { invite_code: '' } });

  const onSubmit = async (data: JoinFormData) => {
    setServerError(null);
    try {
      const { data: couple } = await coupleApi.join(data.invite_code.trim());
      setCouple(couple);
      if (user && token) {
        setAuth({ ...user, couple_id: couple.id }, token);
      }
      navigation.navigate('SplitSetup');
    } catch {
      setServerError(t('couple.joinFailed'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('couple.joinTitle')}</Text>

          <Controller
            control={control}
            name="invite_code"
            rules={{ required: t('errors.required') }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('couple.inviteCodeLabel')}
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={!!errors.invite_code}
                style={styles.input}
              />
            )}
          />
          {errors.invite_code && (
            <HelperText type="error">{errors.invite_code.message}</HelperText>
          )}

          {serverError && (
            <HelperText type="error" style={styles.serverError}>{serverError}</HelperText>
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
            {t('couple.joinSubmit')}
          </Button>
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
});
