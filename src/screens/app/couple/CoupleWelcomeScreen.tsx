import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { AppStackParamList } from '@/types';

type Props = NativeStackScreenProps<AppStackParamList, 'CoupleWelcome'>;

export default function CoupleWelcomeScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>{t('couple.welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('couple.welcomeSubtitle')}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('CreateCouple')}
          style={styles.primaryButton}
          labelStyle={styles.primaryButtonLabel}
          contentStyle={styles.buttonContent}
        >
          {t('couple.createButton')}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('JoinCouple')}
          style={styles.secondaryButton}
          labelStyle={styles.secondaryButtonLabel}
          contentStyle={styles.buttonContent}
        >
          {t('couple.joinButton')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    color: Colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.lg,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  primaryButtonLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  secondaryButton: {
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  secondaryButtonLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.primary,
  },
  buttonContent: {
    paddingVertical: Spacing.xs,
  },
});
