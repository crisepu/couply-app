import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Appbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

export default function ProfileScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user, partner, couple, clearAuth, clearCouple } = useAuthStore();

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    clearCouple();
    clearAuth();
  };

  const handleLeaveCouple = () => {
    Alert.alert(t('profile.leaveCouple'), t('profile.leaveCoupleComingSoon'), [{ text: 'OK' }]);
  };

  const splitLabel = {
    equal: t('home.splitEqual'),
    custom: t('home.splitCustom'),
    auto: t('home.splitAuto'),
  }[couple?.split_mode ?? 'equal'];

  const splitDetail =
    couple?.split_mode === 'custom' && couple.percentage_user1 != null && couple.percentage_user2 != null
      ? `${couple.percentage_user1}% / ${couple.percentage_user2}%`
      : null;

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.Content title={t('profile.title')} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* My Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.myProfile')}</Text>
          <View style={styles.card}>
            <Text style={styles.nameText}>{user?.name ?? user?.email}</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.editButton}
              textColor={Colors.primary}
            >
              {t('profile.editProfile')}
            </Button>
          </View>
        </View>

        {/* My Partner */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.myPartner')}</Text>
          <View style={styles.card}>
            <Text style={styles.nameText}>{partner?.name ?? partner?.email ?? '—'}</Text>
            {partner?.email ? (
              <Text style={styles.emailText}>{partner.email}</Text>
            ) : null}
          </View>
        </View>

        {/* Couple Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.coupleSettings')}</Text>
          <View style={styles.card}>
            <Text style={styles.splitLabel}>{splitLabel}</Text>
            {splitDetail ? (
              <Text style={styles.splitDetail}>{splitDetail}</Text>
            ) : null}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('CoupleSettings')}
              style={styles.editButton}
              textColor={Colors.primary}
            >
              {t('profile.editCouple')}
            </Button>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.dangerZone')}</Text>
          <View style={styles.card}>
            <Button
              mode="outlined"
              onPress={handleLeaveCouple}
              style={styles.dangerButton}
              textColor={Colors.accent}
            >
              {t('profile.leaveCouple')}
            </Button>
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.dangerButton}
              textColor={Colors.accent}
            >
              {t('common.logout')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  appbar: { backgroundColor: Colors.background },
  appbarTitle: { fontFamily: FontFamily.display, fontSize: FontSize.xl, color: Colors.text },
  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  nameText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  emailText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  splitLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  splitDetail: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  editButton: {
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  dangerButton: {
    borderColor: Colors.accent,
    borderRadius: BorderRadius.md,
  },
});
