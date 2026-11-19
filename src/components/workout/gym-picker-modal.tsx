import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Radius, Typography } from '@/constants/theme';
import type { Gym } from '@/types/expert';

export type GymPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedGymId?: string | null;
  gyms: Gym[];
  onSelectGym: (gymId: string | null, gymName: string | null) => void;
  onManageGyms?: () => void;
};

export function GymPickerModal({
  visible,
  onClose,
  selectedGymId,
  gyms,
  onSelectGym,
  onManageGyms,
}: GymPickerModalProps) {
  const isNoneSelected = !selectedGymId;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconCircle}>
              <Text style={styles.headerIcon}>📍</Text>
            </View>
            <View style={styles.headerTextGroup}>
              <Text style={styles.title}>Antrenman Salonu Seç</Text>
              <Text style={styles.subtitle}>
                Bu seansı hangi salonda gerçekleştirdiniz?
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Salon Listesi */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollListContent}
            showsVerticalScrollIndicator={false}
          >
            {gyms.map((gym) => {
              const isSelected = selectedGymId === gym.id;
              return (
                <TouchableOpacity
                  key={gym.id}
                  style={[
                    styles.gymItem,
                    isSelected && styles.gymItemSelected,
                  ]}
                  onPress={() => {
                    onSelectGym(gym.id, gym.name);
                    onClose();
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.gymItemLeft}>
                    <Text style={styles.gymItemIcon}>📍</Text>
                    <View style={styles.gymItemNameCol}>
                      <Text
                        style={[
                          styles.gymItemName,
                          isSelected && styles.gymItemNameSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {gym.name}
                      </Text>
                      {gym.is_default && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      isSelected && styles.checkCircleSelected,
                    ]}
                  >
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Diğer / Belirtilmedi Seçeneği */}
            <TouchableOpacity
              style={[
                styles.gymItem,
                isNoneSelected && styles.gymItemSelected,
              ]}
              onPress={() => {
                onSelectGym(null, null);
                onClose();
              }}
              activeOpacity={0.75}
            >
              <View style={styles.gymItemLeft}>
                <Text style={styles.gymItemIcon}>🏢</Text>
                <Text
                  style={[
                    styles.gymItemName,
                    isNoneSelected && styles.gymItemNameSelected,
                  ]}
                >
                  Diğer / Belirtilmedi
                </Text>
              </View>

              <View
                style={[
                  styles.checkCircle,
                  isNoneSelected && styles.checkCircleSelected,
                ]}
              >
                {isNoneSelected && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Alt Aksiyon Butonları */}
          <View style={styles.actions}>
            {onManageGyms && (
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => {
                  onClose();
                  onManageGyms();
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.manageBtnText}>+ Yeni Salon Ekle</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.75}
            >
              <Text style={styles.closeBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0D111E',
    borderRadius: 22,
    borderWidth: 1.8,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 18,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    borderWidth: 1.5,
    borderColor: '#C084FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  scrollList: {
    maxHeight: 260,
  },
  scrollListContent: {
    gap: 8,
    paddingVertical: 2,
  },
  gymItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: '#101524',
    borderRadius: Radius.md,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gymItemSelected: {
    borderColor: '#C084FC',
    backgroundColor: 'rgba(168, 85, 247, 0.14)',
  },
  gymItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  gymItemIcon: {
    fontSize: 16,
  },
  gymItemNameCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gymItemName: {
    fontSize: Typography.label,
    fontWeight: '700',
    color: '#CBD5E1',
    flexShrink: 1,
  },
  gymItemNameSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  defaultBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.45)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D8B4FE',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    borderColor: '#34D399',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  checkMark: {
    fontSize: 12,
    fontWeight: '900',
    color: '#34D399',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  manageBtn: {
    flex: 1.4,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#D8B4FE',
  },
  closeBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
