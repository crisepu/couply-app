import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Button, TextInput, HelperText, Appbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { authApi } from '@/api/endpoints/auth';
import { usersApi } from '@/api/endpoints/users';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { AppStackParamList } from '@/types';

type Props = NativeStackScreenProps<AppStackParamList, 'PartnerSplitReview'>;

export default function PartnerSplitReviewScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { couple, clearCouple, setCoupleSetupComplete, setPartner } = useAuthStore();
  const [salary, setSalary] = useState('');
  const [salaryError, setSalaryError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDecline = () => {
    clearCouple();
    navigation.goBack();
  };

  const handleAccept = async () => {
    setSalaryError(null);
    setServerError(null);

    if (couple?.split_mode === 'auto') {
      const val = parseFloat(salary);
      if (!salary || isNaN(val) || val <= 0) {
        setSalaryError(t('errors.required'));
        return;
      }
      setLoading(true);
      try {
        await authApi.updateMe({ salary: val });
      } catch {
        setServerError(t('errors.networkError'));
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    try {
      const { data: partnerData } = await usersApi.getById(couple!.user1_id);
      setPartner(partnerData);
    } catch {}
    setCoupleSetupComplete(true);
  };

  const splitMode = couple?.split_mode ?? 'equal';

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.BackAction onPress={handleDecline} color={Colors.text} />
      </Appbar.Header>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t('partnerReview.title')}</Text>

          <View style={styles.proposalCard}>
            {splitMode === 'equal' && (
              <Text style={styles.proposalMessage}>{t('partnerReview.equalMessage')}</Text>
            )}

            {splitMode === 'custom' && (
              <>
                <Text style={styles.proposalMessage}>{t('partnerReview.customMessage')}</Text>
                <View style={styles.percentageRow}>
                  <Text style={styles.percentageLabel}>{t('partnerReview.partnerPercentage')}</Text>
                  <Text style={styles.percentageValue}>{couple?.percentage_user1 ?? 0}%</Text>
                </View>
                <View style={styles.percentageRow}>
                  <Text style={styles.percentageLabel}>{t('partnerReview.yourPercentage')}</Text>
                  <Text style={styles.percentageValue}>{couple?.percentage_user2 ?? 0}%</Text>
                </View>
              </>
            )}

            {splitMode === 'auto' && (
              <Text style={styles.proposalMessage}>{t('partnerReview.autoMessage')}</Text>
            )}
          </View>

          {splitMode === 'auto' && (
            <View style={styles.salaryInput}>
              <TextInput
                label={t('partnerReview.salaryLabel')}
                mode="outlined"
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
                style={styles.input}
              />
              {salaryError && <HelperText type="error">{salaryError}</HelperText>}
            </View>
          )}

          {serverError && <HelperText type="error">{serverError}</HelperText>}

          <Button
            mode="contained"
            onPress={handleAccept}
            loading={loading}
            disabled={loading}
            style={styles.acceptButton}
            labelStyle={styles.acceptLabel}
            contentStyle={styles.buttonContent}
          >
            {t('partnerReview.accept')}
          </Button>

          <Button
            mode="outlined"
            onPress={handleDecline}
            disabled={loading}
            style={styles.declineButton}
            labelStyle={styles.declineLabel}
            contentStyle={styles.buttonContent}
          >
            {t('partnerReview.reject')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  appbar: { backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  proposalCard: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  proposalMessage: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  percentageLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  percentageValue: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  salaryInput: { gap: Spacing.xs },
  input: { backgroundColor: Colors.surface },
  acceptButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  acceptLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  declineButton: {
    borderColor: Colors.accent,
    borderRadius: BorderRadius.md,
  },
  declineLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.accent,
  },
  buttonContent: { paddingVertical: Spacing.xs },
});
