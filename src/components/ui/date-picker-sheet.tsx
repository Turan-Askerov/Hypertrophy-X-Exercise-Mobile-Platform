import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { formatTrDate } from '@/lib/rpe';

export type DatePickerSheetProps = {
  visible: boolean;
  value: string; // ISO date "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  onClose: () => void;
};

function CloseIcon({ size = 14, color = '#EF4444' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M6 18L18 6M6 6l12 12" />
    </Svg>
  );
}

function CalendarIcon({ size = 18, color = '#C084FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </Svg>
  );
}

// Son 14 günü hızlı seçim için listele
function generateRecentDays(): { date: string; label: string; isToday: boolean; isYesterday: boolean }[] {
  const days: { date: string; label: string; isToday: boolean; isYesterday: boolean }[] = [];
  const now = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const dateFormatted = formatTrDate(iso);
    let label = dateFormatted;
    if (i === 0) label = `Bugün · ${dateFormatted}`;
    else if (i === 1) label = `Dün · ${dateFormatted}`;
    days.push({
      date: iso,
      label,
      isToday: i === 0,
      isYesterday: i === 1,
    });
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
      statusBarTranslucent
    >
      <View style={styles.modalRootContainer}>
        {/* Karartılmış Arka Plan (Dokunulduğunda Kapatır) */}
        <Pressable style={styles.modalBackdropTap} onPress={onClose} />

        {/* Alttan Açılan Modern Cyber Dark Pano */}
        <View style={styles.modalSheet}>
          {/* Üst Tutamaç */}
          <View style={styles.modalHandle} />

          {/* Başlık ve Kırmızı Çarpı Butonu */}
          <View style={styles.modalHeaderRow}>
            <View style={styles.modalHeaderIconWrap}>
              <CalendarIcon size={18} color="#C084FC" />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.modalTitle}>Tarih Seçin</Text>
              <Text style={styles.modalDesc}>Antrenman seansı için tarih belirleyin</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButtonRed}
              onPress={onClose}
              hitSlop={10}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
            >
              <CloseIcon size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Gün Seçenekleri Listesi */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {recentDays.map((item) => {
              const isSelected = item.date === selected || item.date === value;
              return (
                <TouchableOpacity
                  key={item.date}
                  style={[
                    styles.dayItem,
                    isSelected && styles.selectedDayItem,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item.date)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {item.isToday ? (
                      <View style={styles.badgeToday}>
                        <Text style={styles.badgeTodayText}>Bugün</Text>
                      </View>
                    ) : item.isYesterday ? (
                      <View style={styles.badgeYesterday}>
                        <Text style={styles.badgeYesterdayText}>Dün</Text>
                      </View>
                    ) : null}
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>

                  {isSelected ? (
                    <View style={styles.checkmarkBadge}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sonsuz Alt Uzantı Eteği (Pano yukarı çekildiğinde alt sınırın görünmemesini sağlar) */}
          <View style={styles.sheetBottomExtension} pointerEvents="none" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRootContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdropTap: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalSheet: {
    backgroundColor: '#0C101C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
    maxHeight: '70%',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopColor: '#C084FC',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetBottomExtension: {
    position: 'absolute',
    bottom: -1000,
    left: -1.5,
    right: -1.5,
    height: 1000,
    backgroundColor: '#0C101C',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C084FC',
    shadowColor: '#C084FC',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
  modalCloseButtonRed: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  list: {
    maxHeight: 380,
  },
  listContent: {
    gap: 8,
    paddingBottom: 10,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#121829',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedDayItem: {
    borderColor: 'rgba(139, 92, 246, 0.55)',
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  selectedDayText: {
    fontWeight: '800',
    color: '#F8FAFC',
  },
  badgeToday: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  badgeTodayText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
  },
  badgeYesterday: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  badgeYesterdayText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  checkmarkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderWidth: 1,
    borderColor: '#C084FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    color: '#C084FC',
    fontWeight: '900',
  },
});
