import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/theme';
import type { RootStackParamList, AuthStackParamList, AppStackParamList } from '@/types';

import WelcomeScreen from '@/screens/auth/WelcomeScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import HomeScreen from '@/screens/app/HomeScreen';
import CoupleWelcomeScreen from '@/screens/app/couple/CoupleWelcomeScreen';
import CreateCoupleScreen from '@/screens/app/couple/CreateCoupleScreen';
import JoinCoupleScreen from '@/screens/app/couple/JoinCoupleScreen';
import SplitSetupScreen from '@/screens/app/couple/SplitSetupScreen';
import PartnerSplitReviewScreen from '@/screens/app/couple/PartnerSplitReviewScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const AppStackNav = createNativeStackNavigator<AppStackParamList>();

function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    </AuthStackNav.Navigator>
  );
}

function AppStack() {
  const coupleSetupComplete = useAuthStore((s) => s.coupleSetupComplete);

  return (
    <AppStackNav.Navigator screenOptions={{ headerShown: false }}>
      {coupleSetupComplete ? (
        <AppStackNav.Screen name="Home" component={HomeScreen} />
      ) : (
        <>
          <AppStackNav.Screen name="CoupleWelcome" component={CoupleWelcomeScreen} />
          <AppStackNav.Screen name="CreateCouple" component={CreateCoupleScreen} />
          <AppStackNav.Screen name="JoinCouple" component={JoinCoupleScreen} />
          <AppStackNav.Screen name="SplitSetup" component={SplitSetupScreen} />
          <AppStackNav.Screen name="PartnerSplitReview" component={PartnerSplitReviewScreen} />
        </>
      )}
    </AppStackNav.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {isAuthenticated ? (
          <RootStack.Screen name="App" component={AppStack} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
