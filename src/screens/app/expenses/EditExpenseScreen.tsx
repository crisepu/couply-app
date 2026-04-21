import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, HelperText, Switch, Appbar, Divider } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { expensesApi } from '@/api/endpoints/expenses';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '@/theme';
import type { ExpensesStackParamList } from '@/types';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'EditExpense'>;

const CATEGORIES = [
  'rent', 'groceries', 'utilities', 'transport', 'dining',
  'entertainment', 'health', 'travel', 'shopping', 'education',
  'subscriptions', 'other',
] as const;

interface FormData {
  amount: string;
  category: string;
  description: string;
  pct1: string;
  pct2: string;
}

export default function EditExpenseScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { user, couple, partner } = useAuthStore();
  const partnerLabel = partner?.name ?? partner?.email ?? t('expenses.paidByPartner');
  const { expense } = route.params;

  const isOwner = expense.created_by === user?.id;
  const partnerId = couple
    ? couple.user1_id === user?.id ? couple.user2_id! : couple.user1_id
    : '';

  const [type, setType] = useState<'shared' | 'personal'>(expense.type);
  const [paidByMe, setPaidByMe] = useState(expense.paid_by === user?.id);
  const [customSplit, setCustomSplit] = useState(
    expense.split_override_user1 != null && expense.split_override_user2 != null
  );
  const [date, setDate] = useState(new Date(expense.expense_date + 'T00:00:00'));
  const [showPicker, setShowPicker] = useState(false);
  const [datePickerKey, setDatePickerKey] = useState(0);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      amount: String(parseFloat(String(expense.amount))),
      category: expense.category,
      description: expense.description ?? '',
      pct1: expense.split_override_user1 != null ? String(expense.split_override_user1) : '',
      pct2: expense.split_override_user2 != null ? String(expense.split_override_user2) : '',
    },
  });

  const selectedCategory = watch('category');

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) {
      setDate(selected);
      setDatePickerKey((k) => k + 1);
    }
  };

  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const handleDelete = () => {
    Alert.alert(
      t('expenses.delete'),
      t('expenses.deleteConfirm'),
      [
        { text: t('common.back'), style: 'cancel' },
        {
          text: t('expenses.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await expensesApi.delete(expense.id);
              navigation.goBack();
            } catch {
              setServerError(t('errors.networkError'));
            }
          },
        },
      ]
    );
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) return;

    if (customSplit && type === 'shared') {
      const n1 = parseFloat(data.pct1);
      const n2 = parseFloat(data.pct2);
      if (isNaN(n1) || isNaN(n2) || Math.abs(n1 + n2 - 100) > 0.01) {
        setServerError(t('couple.percentagesError'));
        return;
      }
    }

    try {
      await expensesApi.update(expense.id, {
        type,
        amount,
        category: data.category,
        description: data.description || undefined,
        expense_date: formatDate(date),
        paid_by: type === 'personal' ? user!.id : (paidByMe ? user!.id : partnerId),
        ...(customSplit && type === 'shared'
          ? { split_override_user1: parseFloat(data.pct1), split_override_user2: parseFloat(data.pct2) }
          : { split_override_user1: undefined, split_override_user2: undefined }),
      });
      navigation.goBack();
    } catch {
      setServerError(t('errors.networkError'));
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar} elevated={false}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={Colors.text} />
        <Appbar.Content
          title={t('expenses.title')}
          titleStyle={styles.appbarTitle}
        />
        {isOwner && (
          <Appbar.Action icon="delete-outline" onPress={handleDelete} iconColor={Colors.error} />
        )}
      </Appbar.Header>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {!isOwner && (
            <View style={styles.readOnlyBanner}>
              <Text style={styles.readOnlyText}>{t('expenses.editNotAllowed')}</Text>
            </View>
          )}

          {/* Type toggle */}
          <View style={[styles.toggleRow, !isOwner && styles.disabled]}>
            <TouchableOpacity
              style={[styles.toggleBtn, type === 'shared' && styles.toggleBtnActive]}
              onPress={() => isOwner && setType('shared')}
            >
              <Text style={[styles.toggleLabel, type === 'shared' && styles.toggleLabelActive]}>
                {t('expenses.shared')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, type === 'personal' && styles.toggleBtnActive]}
              onPress={() => isOwner && setType('personal')}
            >
              <Text style={[styles.toggleLabel, type === 'personal' && styles.toggleLabelActive]}>
                {t('expenses.personal')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <Controller
            control={control}
            name="amount"
            rules={{ required: t('errors.required') }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('expenses.amount')}
                mode="outlined"
                keyboardType="numeric"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={!!errors.amount}
                style={styles.input}
                disabled={!isOwner}
              />
            )}
          />
          {errors.amount && <HelperText type="error">{errors.amount.message}</HelperText>}

          {/* Category */}
          <Controller
            control={control}
            name="category"
            rules={{ required: t('errors.required') }}
            render={() => (
              <TouchableOpacity
                style={[styles.pickerBtn, !isOwner && styles.disabled]}
                onPress={() => isOwner && setCategoryModalVisible(true)}
              >
                <Text style={styles.pickerLabel}>
                  {selectedCategory
                    ? t(`categories.${selectedCategory}` as Parameters<typeof t>[0])
                    : t('expenses.category')}
                </Text>
                {isOwner && <Text style={styles.pickerChevron}>›</Text>}
              </TouchableOpacity>
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('expenses.description')}
                mode="outlined"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                style={styles.input}
                disabled={!isOwner}
              />
            )}
          />

          {/* Date */}
          <TouchableOpacity
            style={[styles.pickerBtn, !isOwner && styles.disabled]}
            onPress={() => isOwner && setShowPicker(true)}
          >
            <Text style={styles.pickerLabel}>{t('expenses.date')}: {formatDate(date)}</Text>
            {isOwner && <Text style={styles.pickerChevron}>›</Text>}
          </TouchableOpacity>
          {Platform.OS === 'ios' ? (
            <View style={[styles.pickerBtn, !isOwner && styles.disabled]}>
              <Text style={styles.pickerLabel}>{t('expenses.date')}</Text>
              <DateTimePicker
                key={datePickerKey}
                value={date}
                mode="date"
                display="compact"
                onChange={isOwner ? onDateChange : () => {}}
                maximumDate={new Date()}
                accentColor={Colors.primary}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.pickerBtn, !isOwner && styles.disabled]}
                onPress={() => isOwner && setShowPicker(true)}
              >
                <Text style={styles.pickerLabel}>{t('expenses.date')}: {formatDate(date)}</Text>
                {isOwner && <Text style={styles.pickerChevron}>›</Text>}
              </TouchableOpacity>
              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </>
          )}

          {/* Paid by — shared only */}
          {type === 'shared' && (
            <>
              <Text style={styles.fieldLabel}>{t('expenses.paidBy')}</Text>
              <View style={[styles.toggleRow, !isOwner && styles.disabled]}>
                <TouchableOpacity
                  style={[styles.toggleBtn, paidByMe && styles.toggleBtnActive]}
                  onPress={() => isOwner && setPaidByMe(true)}
                >
                  <Text style={[styles.toggleLabel, paidByMe && styles.toggleLabelActive]}>
                    {t('expenses.paidByMe')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, !paidByMe && styles.toggleBtnActive]}
                  onPress={() => isOwner && setPaidByMe(false)}
                >
                  <Text style={[styles.toggleLabel, !paidByMe && styles.toggleLabelActive]}>
                    {partnerLabel}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t('expenses.customSplit')}</Text>
                <Switch
                  value={customSplit}
                  onValueChange={isOwner ? setCustomSplit : undefined}
                  color={Colors.primary}
                  disabled={!isOwner}
                />
              </View>

              {customSplit && (
                <View style={styles.splitInputs}>
                  <Controller
                    control={control}
                    name="pct1"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label={t('couple.percentageUser1')}
                        mode="outlined"
                        keyboardType="numeric"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        style={[styles.input, styles.halfInput]}
                        disabled={!isOwner}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="pct2"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        label={t('couple.percentageUser2')}
                        mode="outlined"
                        keyboardType="numeric"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        style={[styles.input, styles.halfInput]}
                        disabled={!isOwner}
                      />
                    )}
                  />
                </View>
              )}
            </>
          )}

          {serverError && <HelperText type="error">{serverError}</HelperText>}

          {isOwner && (
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.submitButton}
              labelStyle={styles.submitLabel}
              contentStyle={styles.buttonContent}
            >
              {t('expenses.save')}
            </Button>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('expenses.category')}</Text>
            <Divider />
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setValue('category', item, { shouldValidate: true });
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedCategory === item && styles.modalItemTextActive,
                  ]}>
                    {t(`categories.${item}` as Parameters<typeof t>[0])}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <Button onPress={() => setCategoryModalVisible(false)} textColor={Colors.textMuted}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  appbar: { backgroundColor: Colors.background },
  appbarTitle: { fontFamily: FontFamily.display, fontSize: FontSize.xl, color: Colors.text },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, gap: Spacing.sm },
  readOnlyBanner: {
    backgroundColor: '#FFF3CD',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  readOnlyText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: '#856404',
  },
  disabled: { opacity: 0.6 },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  toggleLabelActive: { color: Colors.white },
  input: { backgroundColor: Colors.surface },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  pickerLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  pickerChevron: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.lg,
    color: Colors.textMuted,
  },
  fieldLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  switchLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.base,
    color: Colors.text,
    flex: 1,
  },
  splitInputs: { flexDirection: 'row', gap: Spacing.sm },
  halfInput: { flex: 1 },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  submitLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base, color: Colors.white },
  buttonContent: { paddingVertical: Spacing.xs },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    maxHeight: '70%',
  },
  modalTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.base,
    color: Colors.text,
    textAlign: 'center',
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  modalItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  modalItemText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  modalItemTextActive: {
    color: Colors.primary,
    fontFamily: FontFamily.bodyBold,
  },
});
