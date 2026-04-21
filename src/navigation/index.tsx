import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/theme';
import type {
  RootStackParamList,
  AuthStackParamList,
  AppStackParamList,
  MainTabParamList,
  ExpensesStackParamList,
} from '@/types';
import { useTranslation } from 'react-i18next';
import { usersApi } from '@/api/endpoints/users';

import WelcomeScreen from '@/screens/auth/WelcomeScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import HomeScreen from '@/screens/app/HomeScreen';
import ProfileScreen from '@/screens/app/ProfileScreen';
import CoupleWelcomeScreen from '@/screens/app/couple/CoupleWelcomeScreen';
import CreateCoupleScreen from '@/screens/app/couple/CreateCoupleScreen';
import JoinCoupleScreen from '@/screens/app/couple/JoinCoupleScreen';
import SplitSetupScreen from '@/screens/app/couple/SplitSetupScreen';
import PartnerSplitReviewScreen from '@/screens/app/couple/PartnerSplitReviewScreen';
import ExpensesListScreen from '@/screens/app/expenses/ExpensesListScreen';
import AddExpenseScreen from '@/screens/app/expenses/AddExpenseScreen';
import EditExpenseScreen from '@/screens/app/expenses/EditExpenseScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const AppStackNav = createNativeStackNavigator<AppStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ExpensesStackNav = createNativeStackNavigator<ExpensesStackParamList>();

function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    </AuthStackNav.Navigator>
  );
}

function ExpensesStack() {
  return (
    <ExpensesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ExpensesStackNav.Screen name="ExpensesList" component={ExpensesListScreen} />
      <ExpensesStackNav.Screen name="AddExpense" component={AddExpenseScreen} />
      <ExpensesStackNav.Screen name="EditExpense" component={EditExpenseScreen} />
    </ExpensesStackNav.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.background },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse-outline';
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t('tabs.home') }}
      />
      <MainTab.Screen
        name="Expenses"
        component={ExpensesStack}
        options={{ tabBarLabel: t('tabs.expenses') }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t('tabs.profile') }}
      />
    </MainTab.Navigator>
  );
}

function AppStack() {
  const { couple, user, partner, setPartner, coupleSetupComplete } = useAuthStore();

  useEffect(() => {
    if (!coupleSetupComplete || !couple || !user || partner) return;
    const partnerId = couple.user1_id === user.id ? couple.user2_id : couple.user1_id;
    if (!partnerId) return;
    usersApi.getById(partnerId).then(({ data }) => setPartner(data)).catch(() => {});
  }, []);

  return (
    <AppStackNav.Navigator screenOptions={{ headerShown: false }}>
      {coupleSetupComplete ? (
        <AppStackNav.Screen name="MainTabs" component={MainTabs} />
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
