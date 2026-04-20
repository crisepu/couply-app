import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { coupleApi } from '@/api/endpoints/couple';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { AppStackParamList, Couple } from '@/types';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateCouple'>;

export default function CreateCoupleScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user, token, couple: storedCouple, setCouple, setAuth } = useAuthStore();
  const [couple, setLocalCouple] = useState<Couple | null>(storedCouple?.user2_id == null ? storedCouple : null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!couple) {
      coupleApi.create()
        .then(({ data }: { data: Couple }) => {
          setLocalCouple(data);
          setCouple(data);
          if (user && token) {
            setAuth({ ...user, couple_id: data.id }, token);
          }
        })
        .catch(() => setError(t('couple.createFailed')));
    }
  }, []);

  useEffect(() => {
    if (!couple) return;

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await coupleApi.get();
        if (data.user2_id != null) {
          clearInterval(intervalRef.current!);
          setCouple(data);
          navigation.navigate('SplitSetup');
        }
      } catch {}
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [couple]);

  const handleCopy = async () => {
    if (!couple) return;
    await Clipboard.setStringAsync(couple.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!couple) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{t('couple.inviteTitle')}</Text>
        <Text style={styles.subtitle}>{t('couple.inviteSubtitle')}</Text>

        <View style={styles.codeBox}>
          <Text style={styles.code}>{couple.invite_code}</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleCopy}
          style={styles.copyButton}
          labelStyle={styles.copyButtonLabel}
          contentStyle={styles.buttonContent}
        >
          {copied ? t('couple.codeCopied') : t('couple.copyCode')}
        </Button>

        <View style={styles.waitingRow}>
          <ActivityIndicator size="small" color={Colors.textMuted} style={styles.waitingSpinner} />
          <Text style={styles.waitingText}>{t('couple.waitingPartner')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  backText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginVertical: Spacing.sm,
  },
  code: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize['2xl'],
    color: Colors.primary,
    letterSpacing: 4,
  },
  copyButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignSelf: 'stretch',
  },
  copyButtonLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  buttonContent: {
    paddingVertical: Spacing.xs,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  waitingSpinner: {
    marginRight: Spacing.xs,
  },
  waitingText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  errorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.base,
    color: Colors.error,
    textAlign: 'center',
  },
});
