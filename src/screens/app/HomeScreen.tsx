import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Appbar, Button, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { balanceApi } from '@/api/endpoints/balance';
import { expensesApi } from '@/api/endpoints/expenses';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { BalanceResponse, Expense, MainTabParamList } from '@/types';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

function ExpenseRow({ expense, userId }: { expense: Expense; userId: string }) {
  const { t } = useTranslation();
  const paidByLabel = expense.paid_by === userId
    ? t('expenses.paidByYou')
    : t('expenses.paidByPartnerLabel');

  return (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemCategory}>
          {t(`categories.${expense.category}` as Parameters<typeof t>[0])}
        </Text>
        {expense.description ? (
          <Text style={styles.itemDescription} numberOfLines={1}>{expense.description}</Text>
        ) : null}
        <Text style={styles.itemMeta}>{expense.expense_date}  ·  {paidByLabel}</Text>
      </View>
      <Text style={styles.itemAmount}>
        ${parseFloat(String(expense.amount)).toFixed(2)}
      </Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user, couple } = useAuthStore();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [balRes, expRes] = await Promise.all([
        balanceApi.get(),
        expensesApi.list({ type: 'shared' }),
      ]);
      setBalance(balRes.data);
      setRecentExpenses(expRes.data.slice(0, 5));
    } catch {
      // keep previous state on error
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData().finally(() => setLoading(false));
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const splitLabel = {
    equal: t('home.splitEqual'),
    custom: t('home.splitCustom'),
    auto: t('home.splitAuto'),
  }[couple?.split_mode ?? 'equal'];

  let balanceLabel = t('home.settledUp');
  let balanceAmount = 0;
  let amountColor = Colors.primary;
  let isSettled = true;

  if (balance) {
    balanceAmount = parseFloat(String(balance.balance));
    isSettled = !balance.debtor || balanceAmount < 0.01;
    if (!isSettled) {
      if (balance.debtor === user?.id) {
        balanceLabel = t('home.youOwe');
        amountColor = Colors.accent;
      } else {
        balanceLabel = t('home.partnerOwes');
        amountColor = Colors.primary;
      }
    }
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.Content title={t('tabs.home')} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
          {/* Balance card */}
          <View style={[styles.card, isSettled ? styles.cardSettled : styles.cardOwed]}>
            <Text style={[styles.balanceLabel, { color: isSettled ? Colors.primary : amountColor }]}>
              {balanceLabel}
            </Text>
            {!isSettled && (
              <Text style={[styles.balanceAmount, { color: amountColor }]}>
                ${balanceAmount.toFixed(2)}
              </Text>
            )}
            <Text style={styles.splitMode}>{splitLabel}</Text>
          </View>

          {/* Recent expenses */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.recentExpenses')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
                <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
              </TouchableOpacity>
            </View>
            {recentExpenses.length === 0 ? (
              <Text style={styles.emptyText}>{t('home.noExpenses')}</Text>
            ) : (
              recentExpenses.map((e) => (
                <ExpenseRow key={e.id} expense={e} userId={user?.id ?? ''} />
              ))
            )}
          </View>

          {/* Quick add */}
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Expenses', { screen: 'AddExpense' } as any)}
            style={styles.addButton}
            labelStyle={styles.addButtonLabel}
            contentStyle={styles.addButtonContent}
          >
            {t('home.addExpense')}
          </Button>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  appbar: { backgroundColor: Colors.background },
  appbarTitle: { fontFamily: FontFamily.display, fontSize: FontSize.xl, color: Colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardSettled: { backgroundColor: Colors.surface },
  cardOwed: { backgroundColor: Colors.surface },
  balanceLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  balanceAmount: {
    fontFamily: FontFamily.display,
    fontSize: 40,
    textAlign: 'center',
  },
  splitMode: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  section: { gap: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seeAll: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    paddingVertical: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  itemLeft: { flex: 1, gap: Spacing.xs },
  itemCategory: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base, color: Colors.text },
  itemDescription: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.sm, color: Colors.textMuted },
  itemMeta: { fontFamily: FontFamily.bodyRegular, fontSize: FontSize.xs, color: Colors.textMuted },
  itemAmount: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.base,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  addButtonLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base, color: Colors.white },
  addButtonContent: { paddingVertical: Spacing.xs },
});
