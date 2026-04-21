import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Appbar, FAB, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { expensesApi } from '@/api/endpoints/expenses';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { Expense, ExpensesStackParamList } from '@/types';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'ExpensesList'>;

function formatMonth(yearMonth: string, locale: string): string {
  const date = new Date(yearMonth + '-01');
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

function navigateMonth(yearMonth: string, delta: number): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function ExpensesListScreen({ navigation }: Props) {
  const { t, i18n } = useTranslation();
  const { user, partner } = useAuthStore();
  const partnerLabel = partner?.name ?? partner?.email ?? t('expenses.paidByPartnerLabel');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(currentYearMonth());

  const fetchExpenses = useCallback(async (month: string) => {
    try {
      const { data } = await expensesApi.list({ month });
      setExpenses(data);
    } catch {
      setExpenses([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchExpenses(currentMonth).finally(() => setLoading(false));
    }, [currentMonth])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchExpenses(currentMonth);
    setRefreshing(false);
  }, [currentMonth]);

  const shared = expenses.filter((e) => e.type === 'shared');
  const personal = expenses.filter((e) => e.type === 'personal');

  const renderItem = (expense: Expense) => {
    const isOwner = expense.created_by === user?.id;
    const paidByLabel =
      expense.type === 'shared'
        ? expense.paid_by === user?.id
          ? t('expenses.paidByYou')
          : partnerLabel
        : null;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('EditExpense', { expense })}
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          <Text style={styles.itemCategory}>
            {t(`categories.${expense.category}` as Parameters<typeof t>[0])}
          </Text>
          {expense.description ? (
            <Text style={styles.itemDescription} numberOfLines={1}>
              {expense.description}
            </Text>
          ) : null}
          <Text style={styles.itemMeta}>
            {expense.expense_date}
            {paidByLabel ? `  ·  ${paidByLabel}` : ''}
            {!isOwner && expense.type === 'shared' ? '' : ''}
          </Text>
        </View>
        <Text style={styles.itemAmount}>${parseFloat(String(expense.amount)).toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, items: Expense[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>{t('expenses.noExpenses')}</Text>
      ) : (
        items.map((e) => <View key={e.id}>{renderItem(e)}</View>)
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.Content title={t('expenses.title')} titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => setCurrentMonth((m) => navigateMonth(m, -1))} style={styles.monthArrow}>
          <Text style={styles.monthArrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonth(currentMonth, i18n.language)}</Text>
        <TouchableOpacity onPress={() => setCurrentMonth((m) => navigateMonth(m, 1))} style={styles.monthArrow}>
          <Text style={styles.monthArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          keyExtractor={() => ''}
          ListHeaderComponent={
            <>
              {renderSection(t('expenses.shared'), shared)}
              {renderSection(t('expenses.personal'), personal)}
            </>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        testID="fab-add-expense"
        icon="plus"
        style={styles.fab}
        color={Colors.white}
        onPress={() => navigation.navigate('AddExpense')}
      />
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  monthArrow: { padding: Spacing.sm },
  monthArrowText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.xl,
    color: Colors.primary,
  },
  monthLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 100 },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
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
    marginBottom: Spacing.sm,
  },
  itemLeft: { flex: 1, gap: Spacing.xs },
  itemCategory: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  itemDescription: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  itemMeta: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  itemAmount: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.base,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    backgroundColor: Colors.primary,
  },
});
