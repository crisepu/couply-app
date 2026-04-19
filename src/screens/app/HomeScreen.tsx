import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing } from '@/theme';

export default function HomeScreen() {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    clearAuth();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, {user?.name ?? user?.email}</Text>
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor={Colors.accent}
      >
        Log out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  text: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  logoutButton: {
    borderColor: Colors.accent,
  },
});
