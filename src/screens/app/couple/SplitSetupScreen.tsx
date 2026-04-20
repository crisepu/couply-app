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
import { coupleApi } from '@/api/endpoints/couple';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';

type SplitMode = 'equal' | 'custom' | 'auto';

export default function SplitSetupScreen() {
  const { t } = useTranslation();
  const { setCouple } = useAuthStore();
  const [selected, setSelected] = useState<SplitMode>('equal');
  const [pct1, setPct1] = useState('');
  const [pct2, setPct2] = useState('');
  const [salary, setSalary] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setValidationError(null);
    setServerError(null);

    if (selected === 'custom') {
      const n1 = parseFloat(pct1);
      const n2 = parseFloat(pct2);
      if (isNaN(n1) || isNaN(n2) || Math.abs(n1 + n2 - 100) > 0.01) {
        setValidationError(t('couple.percentagesError'));
        return;
      }
    }

    setLoading(true);
    try {
      if (selected === 'auto') {
        await authApi.updateMe({ salary: parseFloat(salary) });
      }

      const payload =
        selected === 'custom'
          ? { split_mode: selected, percentage_user1: parseFloat(pct1), percentage_user2: parseFloat(pct2) }
          : { split_mode: selected };

      const { data: updated } = await coupleApi.updateSplit(payload);
      setCouple(updated);
    } catch {
      setServerError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const options: { mode: SplitMode; label: string; desc: string }[] = [
    { mode: 'equal', label: t('couple.splitEqual'), desc: t('couple.splitEqualDesc') },
    { mode: 'custom', label: t('couple.splitCustom'), desc: t('couple.splitCustomDesc') },
    { mode: 'auto', label: t('couple.splitAuto'), desc: t('couple.splitAutoDesc') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('couple.splitTitle')}</Text>

          {options.map(({ mode, label, desc }) => (
            <TouchableOpacity
              key={mode}
              style={[styles.optionCard, selected === mode && styles.optionCardSelected]}
              onPress={() => { setSelected(mode); setValidationError(null); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, selected === mode && styles.optionLabelSelected]}>
                {label}
              </Text>
              <Text style={styles.optionDesc}>{desc}</Text>
            </TouchableOpacity>
          ))}

          {selected === 'custom' && (
            <View style={styles.extraInputs}>
              <TextInput
                label={t('couple.percentageUser1')}
                mode="outlined"
                keyboardType="numeric"
                value={pct1}
                onChangeText={setPct1}
                style={styles.input}
                testID="input-pct1"
              />
              <TextInput
                label={t('couple.percentageUser2')}
                mode="outlined"
                keyboardType="numeric"
                value={pct2}
                onChangeText={setPct2}
                style={styles.input}
                testID="input-pct2"
              />
            </View>
          )}

          {selected === 'auto' && (
            <View style={styles.extraInputs}>
              <TextInput
                label={t('couple.salaryLabel')}
                mode="outlined"
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                style={styles.input}
                testID="input-salary"
              />
            </View>
          )}

          {validationError && (
            <HelperText type="error">{validationError}</HelperText>
          )}
          {serverError && (
            <HelperText type="error">{serverError}</HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleConfirm}
            loading={loading}
            disabled={loading}
            style={styles.confirmButton}
            labelStyle={styles.confirmLabel}
            contentStyle={styles.buttonContent}
          >
            {t('couple.splitConfirm')}
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
  optionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EDF4F0',
  },
  optionLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  optionLabelSelected: {
    color: Colors.primary,
  },
  optionDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  extraInputs: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  input: { backgroundColor: Colors.surface },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  confirmLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  buttonContent: { paddingVertical: Spacing.xs },
});
