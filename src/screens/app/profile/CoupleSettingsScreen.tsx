import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, HelperText, Appbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { coupleApi } from '@/api/endpoints/couple';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { ProfileStackParamList } from '@/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CoupleSettings'>;
type SplitMode = 'equal' | 'custom' | 'auto';

export default function CoupleSettingsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { couple, setCouple } = useAuthStore();

  const [selected, setSelected] = useState<SplitMode>(couple?.split_mode ?? 'equal');
  const [pct1, setPct1] = useState(couple?.percentage_user1 != null ? String(couple.percentage_user1) : '');
  const [pct2, setPct2] = useState(couple?.percentage_user2 != null ? String(couple.percentage_user2) : '');
  const [salary, setSalary] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.getMySalary()
      .then(({ data }) => { if (data.salary != null) setSalary(String(data.salary)); })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
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

      const { data } = await coupleApi.updateSplit(payload);
      setCouple(data);
      navigation.goBack();
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
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={Colors.text} />
        <Appbar.Content title={t('profile.coupleSettings')} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
              />
              <TextInput
                label={t('couple.percentageUser2')}
                mode="outlined"
                keyboardType="numeric"
                value={pct2}
                onChangeText={setPct2}
                style={styles.input}
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
              />
            </View>
          )}

          {validationError && <HelperText type="error">{validationError}</HelperText>}
          {serverError && <HelperText type="error">{serverError}</HelperText>}

          <HelperText type="info" style={styles.infoText}>
            {t('profile.settingsInfo')}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
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
  scroll: {
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
    paddingBottom: 40,
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
  optionLabelSelected: { color: Colors.primary },
  optionDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  extraInputs: { gap: Spacing.sm, marginTop: Spacing.xs },
  input: { backgroundColor: Colors.surface },
  infoText: { color: Colors.textMuted },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  saveLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base, color: Colors.white },
  buttonContent: { paddingVertical: Spacing.xs },
});
