import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Appbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing } from '@/theme';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, clearAuth, clearCouple } = useAuthStore();

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    clearCouple();
    clearAuth();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.Content title={t('profile.title')} titleStyle={styles.appbarTitle} />
      </Appbar.Header>
      <View style={styles.content}>
        <Text style={styles.name}>{user?.name ?? user?.email}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={Colors.accent}
        >
          {t('common.logout')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  appbar: { backgroundColor: Colors.background },
  appbarTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  name: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    color: Colors.text,
  },
  email: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
  logoutButton: {
    borderColor: Colors.accent,
    marginTop: Spacing.lg,
  },
});
