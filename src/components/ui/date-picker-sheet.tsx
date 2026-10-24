import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { formatTrDate } from '@/lib/rpe';

export type DatePickerSheetProps = {
  visible: boolean;
  value: string; // ISO date "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  onClose: () => void;
};

// Son 14 günü hızlı seçim için listele
function generateRecentDays(): { date: string; label: string }[] {
  const days: { date: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    let label = formatTrDate(iso);
    if (i === 0) label = `Bugün (${label})`;
    else if (i === 1) label = `Dün (${label})`;
    days.push({ date: iso, label });
  }

  return days;
}

export function DatePickerSheet({
  visible,
  value,
  onChange,
  onClose,
}: DatePickerSheetProps) {
  const recentDays = generateRecentDays();
  const [selected, setSelected] = useState(value);

  const handleSelect = (dateStr: string) => {
    setSelected(dateStr);
    onChange(dateStr);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Text style={styles.title}>Tarih Seçin</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.closeText}>Kapat</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.list}>
                {recentDays.map((item) => {
                  const isSelected = item.date === selected || item.date === value;
                  return (
                    <TouchableOpacity
                      key={item.date}
                      style={[styles.dayItem, isSelected && styles.selectedDayItem]}
                      onPress={() => handleSelect(item.date)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.selectedDayText,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected ? (
                        <Text style={styles.checkmark}>✓</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontSize: Typography.heading,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeText: {
    fontSize: Typography.label,
    fontWeight: '600',
    color: AppColors.primary,
  },
  list: {
    paddingHorizontal: Spacing.four,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.backgroundElement,
  },
  selectedDayItem: {
    backgroundColor: AppColors.primaryMuted,
    marginHorizontal: -Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  dayText: {
    fontSize: Typography.body,
    color: Colors.light.text,
  },
  selectedDayText: {
    fontWeight: '700',
    color: AppColors.primary,
  },
  checkmark: {
    fontSize: Typography.heading,
    color: AppColors.primary,
    fontWeight: '700',
  },
});
