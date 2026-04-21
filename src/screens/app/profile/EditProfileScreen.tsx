import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, TextInput, Button, HelperText, Appbar, ActivityIndicator } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { ProfileStackParamList } from '@/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

interface FormValues {
  name: string;
  salary: string;
}

export default function EditProfileScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user, couple, token, setAuth } = useAuthStore();
  const [salaryLoading, setSalaryLoading] = useState(couple?.split_mode === 'auto');
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { name: user?.name ?? '', salary: '' },
  });

  useEffect(() => {
    if (couple?.split_mode !== 'auto') return;
    authApi.getMySalary()
      .then(({ data }) => {
        if (data.salary != null) setValue('salary', String(data.salary));
      })
      .catch(() => {})
      .finally(() => setSalaryLoading(false));
  }, []);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const payload: { name?: string; salary?: number } = { name: values.name };
      if (couple?.split_mode === 'auto' && values.salary) {
        payload.salary = parseFloat(values.salary);
      }
      await authApi.updateMe(payload);
      setAuth({ ...user!, name: values.name }, token!);
      navigation.goBack();
    } catch {
      setServerError(t('errors.networkError'));
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={Colors.text} />
        <Appbar.Content title={t('profile.editProfile')} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="name"
            rules={{ required: t('errors.required') }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('profile.name')}
                mode="outlined"
                value={value}
                onChangeText={onChange}
                style={styles.input}
                error={!!errors.name}
              />
            )}
          />
          {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}

          {couple?.split_mode === 'auto' && (
            salaryLoading ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : (
              <>
                <Controller
                  control={control}
                  name="salary"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label={t('profile.salary')}
                      mode="outlined"
                      keyboardType="numeric"
                      value={value}
                      onChangeText={onChange}
                      style={styles.input}
                    />
                  )}
                />
                <HelperText type="info" style={styles.warning}>
                  {t('profile.salaryWarning')}
                </HelperText>
              </>
            )
          )}

          {serverError && <HelperText type="error">{serverError}</HelperText>}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.saveButton}
            labelStyle={styles.saveLabel}
            contentStyle={styles.buttonContent}
          >
            {t('profile.saveChanges')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  appbar: { backgroundColor: Colors.background },
  appbarTitle: { fontFamily: FontFamily.display, fontSize: FontSize.xl, color: Colors.text },
  flex: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 40 },
  input: { backgroundColor: Colors.surface },
  loader: { marginVertical: Spacing.md },
  warning: { color: Colors.textMuted },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  saveLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base, color: Colors.white },
  buttonContent: { paddingVertical: Spacing.xs },
});
