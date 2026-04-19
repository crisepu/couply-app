import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { AuthStackParamList } from '@/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>Couply</Text>
        <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          style={styles.primaryButton}
          labelStyle={styles.primaryButtonLabel}
          contentStyle={styles.buttonContent}
        >
          {t('welcome.login')}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
          style={styles.secondaryButton}
          labelStyle={styles.secondaryButtonLabel}
          contentStyle={styles.buttonContent}
        >
          {t('welcome.register')}
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
  },
  logo: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['4xl'],
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  tagline: {
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

