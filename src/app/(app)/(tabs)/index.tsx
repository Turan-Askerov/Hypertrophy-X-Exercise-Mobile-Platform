import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

import { useAuth } from '@/auth/auth-provider';
import { Radius, Spacing } from '@/constants/theme';
import { useNutrition } from '@/hooks/use-nutrition';
import { useUser } from '@/hooks/use-user';

// ─── SVG İkonları (Cyber Neon Stil) ───
function DumbbellIcon({ size = 18, color = '#C084FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShoeIcon({ size = 18, color = '#38BDF8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 14c0 3 2 5 5 5h11a2 2 0 002-2v-3l-4-4-5-1-4 3H3v2zM6 10l2-4M10 9l1-3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AppleDietIcon({ size = 18, color = '#FB923C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4c.5-1.5 2-2.5 3.5-2.5M12 4C9 4 5 6 5 11c0 5 4 10 7 10s7-5 7-10c0-5-4-7-7-7z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FlameIcon({ size = 16, color = '#FACC15' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c-.5 3-4 5.5-4 9a6 6 0 0012 0c0-4.5-5.5-6.5-6-9z"
        stroke={color}
        strokeWidth={2}
        fill={color}
        fillOpacity={0.2}
      />
    </Svg>
  );
}

function BellIcon({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowRightIcon({ size = 18, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M13 5l7 7-7 7"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BrainAiIcon({ size = 20, color = '#C084FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.5 2A2.5 2.5 0 007 4.5v.1A3.5 3.5 0 004 8c0 1.2.6 2.3 1.5 3A3.5 3.5 0 004 14a3.5 3.5 0 003 3.4v.1a2.5 2.5 0 005 0V2zM14.5 2A2.5 2.5 0 0117 4.5v.1A3.5 3.5 0 0120 8c0 1.2-.6 2.3-1.5 3A3.5 3.5 0 0120 14a3.5 3.5 0 01-3 3.4v.1a2.5 2.5 0 01-5 0V2z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const { user } = useUser();
  const { todayLog } = useNutrition();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // Çarşamba (bugün)

  const username = user?.username || (state.status === 'signedIn' ? state.user.username : 'Sporcu');
  const userInitials = username.slice(0, 2).toUpperCase();

  const daysOfWeek = [
    { label: 'Pzt', date: '02' },
    { label: 'Sal', date: '03' },
    { label: 'Çar', date: '04', isToday: true },
    { label: 'Per', date: '05' },
    { label: 'Cum', date: '06' },
    { label: 'Cmt', date: '07' },
    { label: 'Paz', date: '08' },
  ];

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. ÜST BAŞLIK & PROFİL ÖZETİ ─── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/(tabs)/profile')}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={styles.welcomeSubtitle}>Bugünün İlerlemesi</Text>
            <Text style={styles.userNameText}>Merhaba, {username} 👋</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/(app)/ai-status' as any)}
            >
              <BrainAiIcon size={20} color="#C084FC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/(app)/(tabs)/profile')}
            >
              <BellIcon size={20} color="#FFFFFF" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 2. ZAMAN SEÇİCİ (GÜNLÜK / HAFTALIK / AYLIK) ─── */}
        <View style={styles.timeFilterContainer}>
          <TouchableOpacity
            style={[styles.timeFilterBtn, activeTab === 'daily' && styles.timeFilterBtnActive]}
            onPress={() => setActiveTab('daily')}
            activeOpacity={0.8}
          >
            <Text style={[styles.timeFilterText, activeTab === 'daily' && styles.timeFilterTextActive]}>
              Günlük
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timeFilterBtn, activeTab === 'weekly' && styles.timeFilterBtnActive]}
            onPress={() => setActiveTab('weekly')}
            activeOpacity={0.8}
          >
            <Text style={[styles.timeFilterText, activeTab === 'weekly' && styles.timeFilterTextActive]}>
              Haftalık
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timeFilterBtn, activeTab === 'monthly' && styles.timeFilterBtnActive]}
            onPress={() => setActiveTab('monthly')}
            activeOpacity={0.8}
          >
            <Text style={[styles.timeFilterText, activeTab === 'monthly' && styles.timeFilterTextActive]}>
              Aylık
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── 3. METRİK ÖZET KARTLARI (3'lü Kart Dizisi) ─── */}
        <View style={styles.metricsRow}>
          {/* Antrenman Kartı */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(192, 132, 252, 0.14)' }]}>
                <DumbbellIcon size={16} color="#C084FC" />
              </View>
              <Text style={styles.metricPercent}>40%</Text>
            </View>
            <Text style={styles.metricValue}>2/5</Text>
            <Text style={styles.metricLabel}>Antrenman</Text>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '40%', backgroundColor: '#C084FC' }]} />
            </View>
          </View>

          {/* Adımlar / Aktivite Kartı */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(56, 189, 248, 0.14)' }]}>
                <ShoeIcon size={16} color="#38BDF8" />
              </View>
              <Text style={styles.metricPercent}>65%</Text>
            </View>
            <Text style={styles.metricValue}>6.480</Text>
            <Text style={styles.metricLabel}>Adım</Text>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '65%', backgroundColor: '#38BDF8' }]} />
            </View>
          </View>

          {/* Kalori / Beslenme Kartı */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <View style={[styles.iconPill, { backgroundColor: 'rgba(251, 191, 36, 0.14)' }]}>
                <AppleDietIcon size={16} color="#FBBF24" />
              </View>
              <Text style={styles.metricPercent}>
                {todayLog?.calories ? Math.min(100, Math.round((todayLog.calories / 2600) * 100)) : 0}%
              </Text>
            </View>
            <Text style={styles.metricValue}>
              {todayLog?.calories || 0}
            </Text>
            <Text style={styles.metricLabel}>Kalori (kcal)</Text>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, Math.round(((todayLog?.calories || 0) / 2600) * 100))}%`,
                    backgroundColor: '#FBBF24',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* ─── 4. AKTİVİTE & HEDEF KARTI (Dairesel Gösterge + İlerleme Barları) ─── */}
        <View style={styles.activityCard}>
          <Text style={styles.activityCardTitle}>Aktivite Durumu</Text>
          <View style={styles.activityCardBody}>
            {/* Soldaki Dairesel Halka */}
            <View style={styles.gaugeContainer}>
              <Svg width={110} height={110} viewBox="0 0 100 100">
                <Circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#161E33"
                  strokeWidth="8"
                  fill="transparent"
                />
                <Circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#C084FC"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - 0.68)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </Svg>
              <View style={styles.gaugeCenterText}>
                <Text style={styles.gaugeNumber}>68%</Text>
                <Text style={styles.gaugeSub}>Hedef</Text>
              </View>
            </View>

            {/* Sağdaki İlerleme Barları */}
            <View style={styles.progressRows}>
              <View style={styles.progressItem}>
                <View style={styles.progressItemHeader}>
                  <Text style={styles.progressItemName}>Kalori</Text>
                  <Text style={styles.progressItemVal}>
                    {todayLog?.calories || 0} / 2.600 kcal
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(100, Math.round(((todayLog?.calories || 0) / 2600) * 100))}%`,
                        backgroundColor: '#C084FC',
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressItemHeader}>
                  <Text style={styles.progressItemName}>Antrenman Süresi</Text>
                  <Text style={styles.progressItemVal}>35 / 50 dk</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: '70%', backgroundColor: '#38BDF8' }]} />
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressItemHeader}>
                  <Text style={styles.progressItemName}>Protein Alımı</Text>
                  <Text style={styles.progressItemVal}>
                    {todayLog?.protein || 0} / 160 g
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(100, Math.round(((todayLog?.protein || 0) / 160) * 100))}%`,
                        backgroundColor: '#34D399',
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─── 5. GÜNÜN ANTRENMANI (HERO WORKOUT CARD) ─── */}
        <View style={styles.workoutHeroCard}>
          <View style={styles.workoutHeroTop}>
            <View style={styles.workoutTagPill}>
              <Text style={styles.workoutTagText}>GÜNÜN ANTRENMANI</Text>
            </View>
            <View style={styles.streakSmallChip}>
              <FlameIcon size={14} color="#FACC15" />
              <Text style={styles.streakSmallText}>Seri: 5 Gün</Text>
            </View>
          </View>

          <Text style={styles.workoutHeroTitle}>Göğüs & Omuz Hipertrofisi</Text>

          {/* Hedef Kaslar */}
          <View style={styles.musclesRow}>
            <View style={styles.muscleChip}>
              <Text style={styles.muscleChipText}>✓ Üst Göğüs</Text>
            </View>
            <View style={styles.muscleChip}>
              <Text style={styles.muscleChipText}>✓ Ön Omuz</Text>
            </View>
            <View style={styles.muscleChip}>
              <Text style={styles.muscleChipText}>✓ Triceps</Text>
            </View>
          </View>

          {/* Antrenman Detay Bilgileri */}
          <View style={styles.workoutMetaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Süre</Text>
              <Text style={styles.metaValue}>45 dk</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Zorluk</Text>
              <Text style={styles.metaValue}>Orta Seviye</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Hacim</Text>
              <Text style={styles.metaValue}>4 Egzersiz · 14 Set</Text>
            </View>
          </View>

          {/* Aksiyon Butonu */}
          <TouchableOpacity
            style={styles.startWorkoutBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/(app)/(tabs)/workout')}
          >
            <Text style={styles.startWorkoutBtnText}>Antrenmanı Başlat</Text>
            <ArrowRightIcon size={20} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* ─── 6. HAFTALIK GÜN SEÇİCİ (HAFTALIK ÇİZELGE) ─── */}
        <View style={styles.weekCalendarSection}>
          <Text style={styles.sectionHeaderTitle}>Haftalık Takvim</Text>
          <View style={styles.daysRow}>
            {daysOfWeek.map((day, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <TouchableOpacity
                  key={day.label}
                  style={[styles.dayCapsule, isSelected && styles.dayCapsuleActive]}
                  onPress={() => setSelectedDayIndex(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayCapsuleLabel, isSelected && styles.dayCapsuleLabelActive]}>
                    {day.label}
                  </Text>
                  <Text style={[styles.dayCapsuleDate, isSelected && styles.dayCapsuleDateActive]}>
                    {day.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── 7. SERİ & ROZETLER (STREAK BADGES) ─── */}
        <View style={styles.streakSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Seri & Başarı Rozetleri</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/profile')}>
              <Text style={styles.seeAllLink}>Tümünü Gör →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.streakBadgesRow}>
            <View style={styles.streakBadgeCard}>
              <View style={[styles.badgeIconBox, { backgroundColor: 'rgba(250, 204, 21, 0.12)' }]}>
                <FlameIcon size={22} color="#FACC15" />
              </View>
              <Text style={styles.badgeDays}>1 Gün</Text>
              <Text style={styles.badgeTitle}>İlk Adım</Text>
            </View>

            <View style={[styles.streakBadgeCard, styles.streakBadgeActive]}>
              <View style={[styles.badgeIconBox, { backgroundColor: 'rgba(192, 132, 252, 0.2)' }]}>
                <FlameIcon size={22} color="#C084FC" />
              </View>
              <Text style={[styles.badgeDays, { color: '#C084FC' }]}>7 Gün</Text>
              <Text style={styles.badgeTitle}>Demir İrade</Text>
            </View>

            <View style={styles.streakBadgeCard}>
              <View style={[styles.badgeIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
                <FlameIcon size={22} color="#38BDF8" />
              </View>
              <Text style={styles.badgeDays}>30 Gün</Text>
              <Text style={styles.badgeTitle}>Yenilmez</Text>
            </View>

            <View style={styles.streakBadgeCard}>
              <View style={[styles.badgeIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.12)' }]}>
                <FlameIcon size={22} color="#A855F7" />
              </View>
              <Text style={styles.badgeDays}>100 Gün</Text>
              <Text style={styles.badgeTitle}>Efsane</Text>
            </View>
          </View>
        </View>

        {/* ─── 8. UZMAN SİSTEM DURUMU HIZLI KART (AI STATUS BANNER) ─── */}
        <TouchableOpacity
          style={styles.aiStatusBanner}
          activeOpacity={0.85}
          onPress={() => router.push('/(app)/ai-status' as any)}
        >
          <View style={styles.aiBannerLeft}>
            <View style={styles.aiBannerIconWrap}>
              <BrainAiIcon size={24} color="#C084FC" />
            </View>
            <View style={styles.aiBannerTexts}>
              <Text style={styles.aiBannerTitle}>AI Toparlanma Skoru: 80 / 100</Text>
              <Text style={styles.aiBannerDesc}>
                Uzman sistem: Kas liflerin toparlandı, bugün yüksek hacim için uygunsun.
              </Text>
            </View>
          </View>
          <View style={styles.aiBannerArrow}>
            <ArrowRightIcon size={18} color="#C084FC" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B14',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: Spacing.four,
  },

  /* 1. Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarWrap: {
    marginRight: Spacing.three,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#101524',
    borderWidth: 2,
    borderColor: '#C084FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerTitles: {
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C084FC',
    borderWidth: 1.5,
    borderColor: '#101524',
  },

  /* 2. Zaman Filtresi */
  timeFilterContainer: {
    flexDirection: 'row',
    backgroundColor: '#101524',
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timeFilterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  timeFilterBtnActive: {
    backgroundColor: '#8B5CF6',
  },
  timeFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  timeFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* 3. 3'lü Metrik Kartları */
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#101524',
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricPercent: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#161E33',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  /* 4. Aktivite & Hedef Kartı */
  activityCard: {
    backgroundColor: '#101524',
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activityCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  activityCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  gaugeContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gaugeSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  progressRows: {
    flex: 1,
    gap: 10,
  },
  progressItem: {},
  progressItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressItemName: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  progressItemVal: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#161E33',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },

  /* 5. Günün Antrenmanı (Hero Card) */
  workoutHeroCard: {
    backgroundColor: '#101524',
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  workoutHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  workoutTagPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  workoutTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 0.5,
  },
  streakSmallChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakSmallText: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '700',
  },
  workoutHeroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  musclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  muscleChip: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  muscleChipText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  workoutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1528',
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    gap: 8,
  },
  startWorkoutBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* 6. Haftalık Takvim */
  weekCalendarSection: {},
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  seeAllLink: {
    fontSize: 13,
    color: '#C084FC',
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#101524',
    padding: 8,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayCapsule: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: Radius.lg,
    minWidth: 40,
  },
  dayCapsuleActive: {
    backgroundColor: '#8B5CF6',
  },
  dayCapsuleLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  dayCapsuleLabelActive: {
    color: '#FFFFFF',
  },
  dayCapsuleDate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dayCapsuleDateActive: {
    color: '#FFFFFF',
  },

  /* 7. Seri & Rozetler */
  streakSection: {},
  streakBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  streakBadgeCard: {
    flex: 1,
    backgroundColor: '#101524',
    borderRadius: Radius.lg,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  streakBadgeActive: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  badgeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeDays: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeTitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },

  /* 8. AI Status Banner */
  aiStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#101524',
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  aiBannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTexts: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C084FC',
  },
  aiBannerDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  aiBannerArrow: {
    marginLeft: 8,
  },
});
