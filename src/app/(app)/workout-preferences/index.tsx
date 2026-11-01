import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

import { useExpertData } from '@/hooks/use-expert';

// ─── Cyber Dark Renk Paleti ───
const colors = {
  background: '#080B14',
  cardBg: '#101524',
  cardBgInner: '#0C101C',
  itemBg: '#121829',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  // Mor / Neon Violet
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleBg: 'rgba(139, 92, 246, 0.14)',
  purpleBorder: 'rgba(139, 92, 246, 0.35)',

  // Cyan
  cyan: '#38BDF8',
  cyanLight: '#7DD3FC',
  cyanBg: 'rgba(56, 189, 248, 0.12)',
  cyanBorder: 'rgba(56, 189, 248, 0.35)',

  // Emerald / Yeşil
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.14)',
  emeraldBorder: 'rgba(16, 185, 129, 0.35)',

  // Amber / Turuncu
  amber: '#F59E0B',
  amberBg: 'rgba(245, 158, 11, 0.14)',
  amberBorder: 'rgba(245, 158, 11, 0.35)',
};

// ─── İkonlar (bug-report.tsx standardı) ───
function BackIcon({ color = '#F8FAFC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function ChevronRightIcon({ color = colors.textDim, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </Svg>
  );
}

function BuildingIcon({ color = colors.cyan, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 21h18M3 7v14M21 7v14M9 21V11M15 21V11M9 7h6M12 3l9 4H3l9-4z"
      />
    </Svg>
  );
}

function DumbbellIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"
      />
    </Svg>
  );
}

function SlidersIcon({ color = colors.amber, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"
      />
    </Svg>
  );
}

function TargetIcon({ color = colors.emeraldLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function InfoIcon({ color = colors.purpleLight, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01" />
    </Svg>
  );
}

// ─── Menü Kart Elemanı (Profile Tarzı) ───
interface CategoryItemProps {
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: 'purple' | 'cyan' | 'emerald' | 'amber';
  optionalBadge?: boolean;
  onPress: () => void;
  isLast?: boolean;
}

function CategoryItem({
  icon,
  iconBg,
  iconBorder,
  title,
  subtitle,
  badge,
  badgeColor = 'purple',
  optionalBadge = false,
  onPress,
  isLast = false,
}: CategoryItemProps) {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'cyan':
        return { bg: colors.cyanBg, border: colors.cyanBorder, text: colors.cyanLight };
      case 'emerald':
        return { bg: colors.emeraldBg, border: colors.emeraldBorder, text: colors.emeraldLight };
      case 'amber':
        return { bg: colors.amberBg, border: colors.amberBorder, text: colors.amber };
      default:
        return { bg: colors.purpleBg, border: colors.purpleBorder, text: colors.purpleLight };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <TouchableOpacity
      style={[styles.itemContainer, !isLast && styles.itemBorderBottom]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: iconBg, borderColor: iconBorder }]}>
          {icon}
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {title}
            </Text>
            {optionalBadge && (
              <View style={styles.optionalBadge}>
                <Text style={styles.optionalBadgeText}>İsteğe Bağlı</Text>
              </View>
            )}
          </View>
          <Text style={styles.itemSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        {badge ? (
          <View
            style={[
              styles.countBadge,
              { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border },
            ]}
          >
            <Text style={[styles.countBadgeText, { color: badgeStyle.text }]}>{badge}</Text>
          </View>
        ) : null}
        <ChevronRightIcon size={18} color={colors.textDim} />
      </View>
    </TouchableOpacity>
  );
}

export default function WorkoutPreferencesScreen() {
  const router = useRouter();
  const { expertData, isLoading, isRefetching, refetch } = useExpertData();

  const gyms = expertData?.gyms || [];
  const defaultGym = gyms.find((g) => g.is_default);
  const preferredExerciseIds = expertData?.preferred_exercise_ids || [];
  const avoidExerciseIds = expertData?.avoid_exercise_ids || [];
  const preferredEquipment = expertData?.preferred_equipment || [];
  const targetMuscles = expertData?.target_muscles?.priority_muscles || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Üst Başlık Barı (bug-report.tsx standardı) */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={12}
        >
          <BackIcon size={22} color="#F8FAFC" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Antrenman Tercihleri</Text>

        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={colors.purple}
            colors={[colors.purple]}
          />
        }
      >
        {/* Bilgilendirme Notu */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconWrapper}>
            <InfoIcon size={20} color={colors.purpleLight} />
          </View>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoTitle}>Kişiselleştirilmiş Antrenman Motoru</Text>
            <Text style={styles.infoSubtitle}>
              Uzman sistemi, programını oluştururken bu kaynakları kullanır. Ekipman, makine ve hareket
              seçimleri <Text style={styles.highlightText}>isteğe bağlıdır</Text>.
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingText}>Tercihler yükleniyor...</Text>
          </View>
        ) : (
          /* Profil Sayfası Tarzı Kart Listesi */
          <View style={styles.groupCard}>
            {/* 1. Kayıtlı Salonlar */}
            <CategoryItem
              icon={<BuildingIcon size={20} color={colors.cyan} />}
              iconBg={colors.cyanBg}
              iconBorder={colors.cyanBorder}
              title="Kayıtlı Salonlar"
              subtitle={
                gyms.length > 0
                  ? `Varsayılan: ${defaultGym?.name || 'Seçilmedi'} (${gyms.length} salon)`
                  : 'Henüz salon eklenmedi'
              }
              badge={gyms.length > 0 ? `${gyms.length} Salon` : undefined}
              badgeColor="cyan"
              onPress={() => router.push('/(app)/workout-preferences/gyms' as any)}
            />

            {/* 2. Tercih Edilen Hareketler (İsteğe Bağlı) */}
            <CategoryItem
              icon={<DumbbellIcon size={20} color={colors.purpleLight} />}
              iconBg={colors.purpleBg}
              iconBorder={colors.purpleBorder}
              title="Tercih Edilen Hareketler"
              subtitle={
                preferredExerciseIds.length > 0 || avoidExerciseIds.length > 0
                  ? `${preferredExerciseIds.length} tercih · ${avoidExerciseIds.length} önerilmesin`
                  : 'Öncelikli veya önerilmeyen egzersizler'
              }
              badge={
                preferredExerciseIds.length > 0
                  ? `${preferredExerciseIds.length} Seçildi`
                  : undefined
              }
              badgeColor="purple"
              optionalBadge
              onPress={() => router.push('/(app)/workout-preferences/exercises' as any)}
            />

            {/* 3. Tercih Edilen Ekipmanlar ve Makineler (İsteğe Bağlı) */}
            <CategoryItem
              icon={<SlidersIcon size={20} color={colors.amber} />}
              iconBg={colors.amberBg}
              iconBorder={colors.amberBorder}
              title="Ekipmanlar ve Makineler"
              subtitle={
                preferredEquipment.length > 0
                  ? `${preferredEquipment.length} özel ekipman seçili`
                  : defaultGym
                  ? `Varsayılan salon (${defaultGym.name}) temel alınıyor`
                  : 'Tüm ekipmanlar kullanılabilir'
              }
              badge={
                preferredEquipment.length > 0 ? `${preferredEquipment.length} Özel` : undefined
              }
              badgeColor="amber"
              optionalBadge
              onPress={() => router.push('/(app)/workout-preferences/equipment' as any)}
            />

            {/* 4. Öncelikli Hedef Kaslar */}
            <CategoryItem
              icon={<TargetIcon size={20} color={colors.emeraldLight} />}
              iconBg={colors.emeraldBg}
              iconBorder={colors.emeraldBorder}
              title="Öncelikli Hedef Kaslar"
              subtitle={
                targetMuscles.length > 0
                  ? targetMuscles.join(', ')
                  : 'Maksimum 3 odak kas grubu seç'
              }
              badge={`${targetMuscles.length}/3`}
              badgeColor="emerald"
              isLast
              onPress={() => router.push('/(app)/workout-preferences/goals' as any)}
            />
          </View>
        )}

        {/* Alt Açıklama Kutusu */}
        <View style={styles.footerTipCard}>
          <Text style={styles.footerTipTitle}>Nasıl Çalışır?</Text>
          <Text style={styles.footerTipText}>
            • <Text style={styles.footerTipBold}>Kayıtlı Salonlar:</Text> Farklı antrenman mekanlarını
            ekipman listesiyle kaydedip tek tıkla varsayılan yapabilirsin.
          </Text>
          <Text style={styles.footerTipText}>
            • <Text style={styles.footerTipBold}>Hareket Tercihleri:</Text> Sevdiğin hareketleri önceliklendir,
            yapmak istemediklerini &quot;Önerme&quot; olarak işaretle.
          </Text>
          <Text style={styles.footerTipText}>
            • <Text style={styles.footerTipBold}>Ekipman Tercihleri:</Text> Salonundaki veya evindeki özel makineleri
            seçtiğinde sistem sadece o olanakları içeren varyasyonları kurgular.
          </Text>
          <Text style={styles.footerTipText}>
            • <Text style={styles.footerTipBold}>Hedef Kaslar:</Text> Belirlediğin en fazla 3 kas grubu
            programında öncelikli set hacmine kavuşur.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  headerRightSpace: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoTextWrapper: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  infoSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  highlightText: {
    color: colors.amber,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  groupCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  optionalBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optionalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.amber,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footerTipCard: {
    backgroundColor: 'rgba(16, 21, 36, 0.6)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    gap: 8,
  },
  footerTipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  footerTipText: {
    fontSize: 12,
    color: colors.textDim,
    lineHeight: 18,
  },
  footerTipBold: {
    color: colors.textMuted,
    fontWeight: '600',
  },
});
