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
import Svg, { Path } from 'react-native-svg';

import { ModernSwitch } from '@/components/ui/modern-switch';

// ─── Renk Token'ları (Cyber Dark Standartları) ───
const colors = {
  background: '#080B14',
  cardBg: '#101524',
  cardBgInner: '#0C101C',
  itemBg: '#121829',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  // Mor / Violet
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleBg: 'rgba(139, 92, 246, 0.12)',
  purpleBorder: 'rgba(139, 92, 246, 0.3)',

  // Zümrüt Yeşili (Neon Emerald)
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.12)',
  emeraldBorder: 'rgba(16, 185, 129, 0.3)',

  // Cyan
  cyan: '#06B6D4',
  cyanLight: '#22D3EE',
  cyanBg: 'rgba(6, 182, 212, 0.12)',
  cyanBorder: 'rgba(6, 182, 212, 0.3)',
};

// ─── SVG İkonları ───
function BackIcon({ color = colors.text, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function ReportIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </Svg>
  );
}

function MailIcon({ color = colors.emeraldLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </Svg>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();

  // Şimdilik boş görsel state'ler (henüz bir API'ye bağlı değil)
  const [monthlyReport, setMonthlyReport] = useState<boolean>(true);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ─── Üst Başlık Çubuğu ─── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Geri Dön"
        >
          <BackIcon size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Bildirimler</Text>
          <Text style={styles.headerSubtitle}>Bildirim ve İletişim Tercihleri</Text>
        </View>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Bilgilendirme Kartı ─── */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerDot} />
          <Text style={styles.infoBannerText}>
            Gelişim raporlarınızı ve önemli bildirimleri buradan yönetebilirsiniz. Tercihlerinizi dilediğiniz zaman açıp kapatabilirsiniz.
          </Text>
        </View>

        {/* ─── Bildirim Seçenekleri Grubu (Profil Sayfası Düzeninde) ─── */}
        <Text style={styles.sectionHeading}>RAPOR VE E-POSTA TERCİHLERİ</Text>
        <View style={styles.groupCard}>
          {/* 1. Aylık Rapor */}
          <TouchableOpacity
            style={styles.itemContainer}
            activeOpacity={0.8}
            onPress={() => setMonthlyReport((prev) => !prev)}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: colors.purpleBg, borderColor: colors.purpleBorder }]}>
                <ReportIcon color={colors.purpleLight} size={20} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.itemTitle}>Aylık rapor</Text>
                <Text style={styles.itemSubtitle}>
                  Her ay sonu detaylı hipertrofi, hacim ve güç gelişim özeti
                </Text>
              </View>
            </View>

            <View style={styles.itemRight}>
              <ModernSwitch
                value={monthlyReport}
                onValueChange={setMonthlyReport}
              />
            </View>
          </TouchableOpacity>

          {/* 2. E-posta Bildirimleri */}
          <TouchableOpacity
            style={styles.itemContainer}
            activeOpacity={0.8}
            onPress={() => setEmailNotifications((prev) => !prev)}
          >
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: colors.emeraldBg, borderColor: colors.emeraldBorder }]}>
                <MailIcon color={colors.emeraldLight} size={20} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.itemTitle}>E posta bildirimleri</Text>
                <Text style={styles.itemSubtitle}>
                  Aylık raporlar, antrenman özetleri ve duyuruları e-posta ile al
                </Text>
              </View>
            </View>

            <View style={styles.itemRight}>
              <ModernSwitch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
              />
            </View>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 1,
  },
  headerPlaceholder: {
    width: 38,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    marginBottom: 20,
  },
  infoBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.purpleLight,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  groupCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 22,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.itemBg,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  itemSubtitle: {
    fontSize: 11.5,
    color: colors.textMuted,
    lineHeight: 16,
  },
  itemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

