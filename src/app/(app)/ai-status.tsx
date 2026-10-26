import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { useAuth } from '@/auth/auth-provider';
import { Radius, Spacing } from '@/constants/theme';
import { useUser } from '@/hooks/use-user';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── SVG İkonları ───
function BackIcon({ size = 22, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 19l-7-7 7-7"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
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

function BikeIcon({ size = 20, color = '#C6F432' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="5.5" cy="17.5" r="3.5" stroke={color} strokeWidth={2} />
      <Circle cx="18.5" cy="17.5" r="3.5" stroke={color} strokeWidth={2} />
      <Path
        d="M15 6a1 1 0 100-2 1 1 0 000 2zm-3 11.5l3.5-7.5H12l-2-4H7m5 11.5l-4-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DumbbellIcon({ size = 20, color = '#FB923C' }: { size?: number; color?: string }) {
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

function DiagonalArrow({ size = 16, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 17L17 7M7 7h10v10"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SparklesIcon({ size = 18, color = '#C6F432' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2zM19 17l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function AiStatusScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const { user } = useUser();

  const [filterPeriod, setFilterPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const username = user?.username || (state.status === 'signedIn' ? state.user.username : 'Sporcu');
  const userInitials = username.slice(0, 2).toUpperCase();

  // Yarı Dairesel Hız Göstergesi (Radial Gauge) Hesaplaması
  const gaugeScore = 80; // 0 - 100
  const gaugeRadius = 110;
  const strokeWidth = 14;
  const cx = 140;
  const cy = 135;

  // 180 derecelik yarım çember yayı: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
  const arcPath = `M ${cx - gaugeRadius} ${cy} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${cx + gaugeRadius} ${cy}`;
  const arcLength = Math.PI * gaugeRadius; // ~345.5
  const strokeDashoffset = arcLength * (1 - gaugeScore / 100);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. ÜST BAR (Geri, Başlık, Zil) ─── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
            activeOpacity={0.7}
          >
            <BackIcon size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(app)/settings')}
          >
            <BellIcon size={20} color="#FFFFFF" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* ─── 2. BAŞLIK VE AÇIKLAMA ─── */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>AI Health & Hypertrophy Score</Text>
          <Text style={styles.mainSubtitle}>
            Yapay Zeka Destekli Hipertrofi & Toparlanma Analizi
          </Text>
        </View>

        {/* ─── 3. RADYAL HIZ GÖSTERGESİ (GAUGE) ─── */}
        <View style={styles.gaugeCard}>
          <Svg width={280} height={175} viewBox="0 0 280 175" style={styles.gaugeSvg}>
            <Defs>
              <LinearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#1E3A1A" />
                <Stop offset="50%" stopColor="#84CC16" />
                <Stop offset="100%" stopColor="#C6F432" />
              </LinearGradient>
            </Defs>

            {/* Arka Plan Yay Yolu (Koyu ray) */}
            <Path
              d={arcPath}
              stroke="#151A26"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />

            {/* Aktif Skor Yay Yolu (Neon Lime Gradyan) */}
            <Path
              d={arcPath}
              stroke="url(#gaugeGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />

            {/* İbre Noktası (Dot at 80%) */}
            <Circle
              cx={cx + gaugeRadius * Math.cos(Math.PI * (1 - gaugeScore / 100))}
              cy={cy - gaugeRadius * Math.sin(Math.PI * (1 - gaugeScore / 100))}
              r={7}
              fill="#C6F432"
              stroke="#090A0F"
              strokeWidth={2.5}
            />
          </Svg>

          {/* Kadran Ticks/Değer Yazıları */}
          <View style={styles.gaugeTicks}>
            <Text style={styles.tickText}>0</Text>
            <Text style={styles.tickText}>25</Text>
            <Text style={styles.tickText}>50</Text>
            <Text style={styles.tickText}>70</Text>
            <Text style={[styles.tickText, { color: '#C6F432', fontWeight: '800' }]}>80</Text>
            <Text style={styles.tickText}>100</Text>
          </View>

          {/* Merkez Skor ve Durum */}
          <View style={styles.gaugeCenterInfo}>
            <Text style={styles.gaugeScoreBig}>{gaugeScore}</Text>
            <Text style={styles.gaugeStatusLabel}>Toparlanma & Hazırlık: Mükemmel</Text>
          </View>
        </View>

        {/* ─── 4. İKİLİ AKTİVİTE / HACİM KARTLARI ─── */}
        <View style={styles.twinCardsRow}>
          {/* Sol Kart: Kardiyo & Isınma */}
          <View style={styles.twinCard}>
            <View style={styles.twinCardTop}>
              <View style={[styles.twinIconBox, { backgroundColor: 'rgba(198, 244, 50, 0.12)' }]}>
                <BikeIcon size={20} color="#C6F432" />
              </View>
              <Text style={styles.twinCategory}>Kardiyo & Isınma</Text>
            </View>

            <View style={styles.twinValueRow}>
              <Text style={styles.twinValueBig}>2.4</Text>
              <Text style={styles.twinValueTotal}>/5.0</Text>
            </View>
            <Text style={styles.twinSubtitle}>2.6 KM Hedef Kaldı</Text>

            <TouchableOpacity
              style={styles.twinActionBtnLime}
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/(tabs)/workout')}
            >
              <DiagonalArrow size={16} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Sağ Kart: Hipertrofi Hacmi */}
          <View style={styles.twinCard}>
            <View style={styles.twinCardTop}>
              <View style={[styles.twinIconBox, { backgroundColor: 'rgba(251, 146, 60, 0.12)' }]}>
                <DumbbellIcon size={20} color="#FB923C" />
              </View>
              <Text style={styles.twinCategory}>Hacim Hedefi</Text>
            </View>

            <View style={styles.twinValueRow}>
              <Text style={styles.twinValueBig}>4</Text>
              <Text style={styles.twinValueTotal}>/5</Text>
            </View>
            <Text style={styles.twinSubtitle}>1 Antrenman Kaldı</Text>

            <TouchableOpacity
              style={styles.twinActionBtnDark}
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/(tabs)/workout')}
            >
              <DiagonalArrow size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 5. HAFTALIK TUTARLILIK & EĞRİSEL GRAFİK (SPLINE WAVE) ─── */}
        <View style={styles.consistencyCard}>
          <View style={styles.consistencyHeader}>
            <View>
              <Text style={styles.consistencyTitle}>Haftalık Tutarlılık</Text>
              <Text style={styles.consistencyChange}>+12% geçen haftaya göre</Text>
            </View>

            <TouchableOpacity
              style={styles.periodPill}
              activeOpacity={0.8}
              onPress={() => setFilterPeriod(filterPeriod === 'weekly' ? 'monthly' : 'weekly')}
            >
              <Text style={styles.periodPillText}>
                {filterPeriod === 'weekly' ? 'Haftalık ▾' : 'Aylık ▾'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spline Wave Grafik */}
          <View style={styles.chartWrapper}>
            <Svg width={SCREEN_WIDTH - 64} height={130} viewBox="0 0 320 130">
              <Defs>
                <LinearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#C6F432" stopOpacity={0.35} />
                  <Stop offset="100%" stopColor="#C6F432" stopOpacity={0.0} />
                </LinearGradient>
              </Defs>

              {/* Hedef Eksen Çizgisi (Dashed target line) */}
              <Path
                d="M 10 50 L 310 50"
                stroke="#252D3F"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />

              {/* Kesişim Dikey Çizgisi */}
              <Path
                d="M 230 10 L 230 110"
                stroke="#374523"
                strokeWidth={1.2}
                strokeDasharray="3,3"
              />

              {/* Alan Doldurma (Area fill) */}
              <Path
                d="M 10 95 C 40 105, 60 75, 90 85 C 120 95, 140 60, 170 65 C 200 70, 210 55, 230 45 C 260 30, 280 25, 310 32 L 310 120 L 10 120 Z"
                fill="url(#waveGradient)"
              />

              {/* Dalga Eğrisi (Neon Line) */}
              <Path
                d="M 10 95 C 40 105, 60 75, 90 85 C 120 95, 140 60, 170 65 C 200 70, 210 55, 230 45 C 260 30, 280 25, 310 32"
                stroke="#C6F432"
                strokeWidth={2.6}
                fill="none"
                strokeLinecap="round"
              />

              {/* Vurgulanan Kesişim Noktası */}
              <Circle cx={230} cy={45} r={5} fill="#C6F432" stroke="#090A0F" strokeWidth={2} />
              <Circle cx={230} cy={45} r={8} stroke="#C6F432" strokeWidth={1.5} fill="none" opacity={0.5} />
            </Svg>

            {/* Ay Etiketleri */}
            <View style={styles.chartMonthsRow}>
              <Text style={styles.monthLabel}>Oca</Text>
              <Text style={styles.monthLabel}>Şub</Text>
              <Text style={styles.monthLabel}>Mar</Text>
              <Text style={styles.monthLabel}>Nis</Text>
              <Text style={[styles.monthLabel, { color: '#C6F432', fontWeight: '800' }]}>May</Text>
              <Text style={styles.monthLabel}>Haz</Text>
            </View>
          </View>
        </View>

        {/* ─── 6. AI UZMAN KOÇLUK TAVSİYESİ KARTI ─── */}
        <View style={styles.aiAdviceCard}>
          <View style={styles.adviceHeader}>
            <SparklesIcon size={18} color="#C6F432" />
            <Text style={styles.adviceTitle}>Uzman Sistem Analizi</Text>
          </View>
          <Text style={styles.adviceBody}>
            Son antrenman verilerine göre merkezi sinir sistemi (CNS) toparlanması %80 seviyesinde.
            Göğüs ve omuz kas grubu için bugün yüksek yoğunluklu (RIR 1-2) hipertrofi seansı öneriliyor.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six * 1.5,
    gap: Spacing.four,
  },

  /* 1. Üst Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#13161F',
    borderWidth: 1,
    borderColor: '#232A3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#161A26',
    borderWidth: 2,
    borderColor: '#C6F432',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#13161F',
    borderWidth: 1,
    borderColor: '#232A3B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C6F432',
    borderWidth: 1.5,
    borderColor: '#13161F',
  },

  /* 2. Başlık */
  titleSection: {
    alignItems: 'flex-start',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 13,
    color: '#8E99AF',
    marginTop: 4,
  },

  /* 3. Gösterge (Gauge) Kartı */
  gaugeCard: {
    backgroundColor: '#13161F',
    borderRadius: Radius.xl,
    paddingTop: 18,
    paddingBottom: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#232A3B',
    position: 'relative',
  },
  gaugeSvg: {
    alignSelf: 'center',
  },
  gaugeTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
    marginTop: -20,
    marginBottom: 8,
  },
  tickText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  gaugeCenterInfo: {
    alignItems: 'center',
    marginTop: 6,
  },
  gaugeScoreBig: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  gaugeStatusLabel: {
    fontSize: 13,
    color: '#C6F432',
    fontWeight: '700',
    marginTop: 2,
  },

  /* 4. İkili Aktivite Kartları */
  twinCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  twinCard: {
    flex: 1,
    backgroundColor: '#13161F',
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#232A3B',
    position: 'relative',
    minHeight: 140,
  },
  twinCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  twinIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  twinCategory: {
    fontSize: 12,
    color: '#8E99AF',
    fontWeight: '600',
    flex: 1,
  },
  twinValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  twinValueBig: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  twinValueTotal: {
    fontSize: 14,
    color: '#8E99AF',
    fontWeight: '600',
    marginLeft: 2,
  },
  twinSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  twinActionBtnLime: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C6F432',
    alignItems: 'center',
    justifyContent: 'center',
  },
  twinActionBtnDark: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E2333',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2B3245',
  },

  /* 5. Haftalık Tutarlılık */
  consistencyCard: {
    backgroundColor: '#13161F',
    borderRadius: Radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: '#232A3B',
  },
  consistencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  consistencyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  consistencyChange: {
    fontSize: 13,
    color: '#C6F432',
    fontWeight: '700',
    marginTop: 2,
  },
  periodPill: {
    backgroundColor: '#181C28',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#232A3B',
  },
  periodPillText: {
    fontSize: 12,
    color: '#8E99AF',
    fontWeight: '600',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chartMonthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  monthLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },

  /* 6. AI Tavsiye Kartı */
  aiAdviceCard: {
    backgroundColor: 'rgba(198, 244, 50, 0.05)',
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(198, 244, 50, 0.25)',
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C6F432',
  },
  adviceBody: {
    fontSize: 13,
    color: '#C3CAD9',
    lineHeight: 19,
  },
});
