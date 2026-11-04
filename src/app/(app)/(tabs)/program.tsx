import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import { useProgram } from '@/hooks/use-program';
import { useUser } from '@/hooks/use-user';
import type { CustomDay } from '@/types/program';

// ─── Renk Token'ları (Cyber Dark Standartları) ───
const colors = {
  background: '#080B14',
  cardBg: '#101524',
  cardBgInner: '#0C101C',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderHover: 'rgba(139, 92, 246, 0.35)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  // Mor / Neon Violet (Özel Program Butonu & Vurgular)
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleDark: '#7C3AED',
  purpleBg: 'rgba(139, 92, 246, 0.14)',
  purpleBorder: 'rgba(139, 92, 246, 0.4)',

  // Yeşil / Neon Emerald (Programı Seç Butonu & Aktiflik)
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.12)',
  emeraldBorder: 'rgba(16, 185, 129, 0.45)',

  // Cyan / Hedef Rozetleri
  cyan: '#06B6D4',
  cyanLight: '#22D3EE',
  cyanBg: 'rgba(6, 182, 212, 0.12)',
  cyanBorder: 'rgba(6, 182, 212, 0.35)',

  // Amber / Sarı (Seviye Rozeti & Vurgular)
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  amberBg: 'rgba(245, 158, 11, 0.12)',
  amberBorder: 'rgba(245, 158, 11, 0.35)',
};

// ─── Popüler Program Modeli ───
export interface PresetProgram {
  id: string;
  name: string;
  badge: string;
  daysPerWeek: number;
  level: string;
  focusSplit: string;
  tagline: string;
  mainGoal: string;
  targetAudience: string;
  strategySummary: string;
  keyBenefits: string[];
  days: CustomDay[];
}

// ─── Popüler Program Havuzu Kataloğu ───
const POPULAR_PROGRAMS: PresetProgram[] = [
  {
    id: 'ppl-6day',
    name: 'Push / Pull / Legs (PPL)',
    badge: 'Altın Standart',
    daysPerWeek: 6,
    level: 'Orta - İleri',
    focusSplit: 'İtiş · Çekiş · Bacak',
    tagline: 'Her kas grubunu haftada 2 kez uyararak bilimsel hipertrofi sağlayan en popüler split.',
    mainGoal: 'Maksimum Kas Kazanımı (Hipertrofi) & Hacim',
    targetAudience: 'Haftada 6 gün antrenman yapabilen, hacim ve estetiği bir arada hedefleyen sporcular.',
    strategySummary:
      'Kas gruplarını anatomik itiş, çekiş ve bacak hareket zincirlerine göre gruplar. Her kası 72 saat arayla iki kez uyararak kas protein sentezini tüm hafta boyunca zirvede tutar.',
    keyBenefits: [
      'Haftada 2x kas uyarımıyla kanıtlanmış hipertrofi optimizasyonu',
      'İtiş ve çekiş ayrımı sayesinde omuz ve dirsek eklemlerine binen yükün dengelenmesi',
      'A ve B seansları ile hem bileşik güç hem de açısal izolasyon dengesi',
    ],
    days: [
      { day: 'Pazartesi', type: 'Push A', focus: 'Göğüs, Ön Omuz, Yan Omuz, Triceps', isRest: false },
      { day: 'Salı', type: 'Pull A', focus: 'Latissimus, Üst Sırt, Arka Omuz, Biceps', isRest: false },
      { day: 'Çarşamba', type: 'Legs A', focus: 'Quadriceps, Hamstring, Gluteus, Kalf', isRest: false },
      { day: 'Perşembe', type: 'Dinlenme', focus: 'Merkezi Sinir Sistemi & Kas Onarımı', isRest: true },
      { day: 'Cuma', type: 'Push B', focus: 'Üst Göğüs, Yan Omuz, Triceps Uzun Baş', isRest: false },
      { day: 'Cumartesi', type: 'Pull B', focus: 'Sırt Kalınlığı, Trapez, Biceps, Ön Kol', isRest: false },
      { day: 'Pazar', type: 'Legs B', focus: 'Hamstring, Gluteus Odaklı, Kalf, Karın', isRest: false },
    ],
  },
  {
    id: 'upper-lower-4day',
    name: 'Upper / Lower (Üst & Alt Vücut)',
    badge: 'Dengeli & Güçlü',
    daysPerWeek: 4,
    level: 'Tüm Seviyeler',
    focusSplit: 'Üst Vücut · Alt Vücut',
    tagline: 'Vücudu ikiye bölen, haftada 3 gün toparlanma sunan ve yoğun hayata mükemmel uyan split.',
    mainGoal: 'Güç Temeli & Dengeli Hipertrofi',
    targetAudience: 'Haftada 4 gün ayırabilen, hem ağır bileşik kaldırmak hem de kas kütlesi inşa etmek isteyenler.',
    strategySummary:
      'Haftalık 4 gün antrenman ile her kas grubu haftada iki kez uyarılırken, çarşamba ve hafta sonu dinlenmeleriyle merkezi sinir sistemine ideal toparlanma süresi tanınır.',
    keyBenefits: [
      'Haftada 3 tam gün toparlanma ile sıfır aşırı yorgunluk riski',
      'Yoğun okul/iş hayatına sahip kişiler için en sürdürülebilir model',
      'Squat, Bench Press, Deadlift ve Overhead Press gelişiminde yüksek verim',
    ],
    days: [
      { day: 'Pazartesi', type: 'Üst Vücut A', focus: 'Göğüs Odaklı, Sırt, Omuz, Kollar', isRest: false },
      { day: 'Salı', type: 'Alt Vücut A', focus: 'Quadriceps Odaklı Squat, Hamstring, Kalf', isRest: false },
      { day: 'Çarşamba', type: 'Dinlenme', focus: 'Aktif Toparlanma & Dinlenme', isRest: true },
      { day: 'Perşembe', type: 'Üst Vücut B', focus: 'Sırt Odaklı Row/Pull, Üst Göğüs, Kollar', isRest: false },
      { day: 'Cuma', type: 'Alt Vücut B', focus: 'Hamstring / Deadlift Odaklı, Gluteus, Karın', isRest: false },
      { day: 'Cumartesi', type: 'Dinlenme', focus: 'Toparlanma', isRest: true },
      { day: 'Pazar', type: 'Dinlenme', focus: 'Haftalık Yenilenme', isRest: true },
    ],
  },
  {
    id: 'arnold-split-6day',
    name: 'Arnold Split (Antagonist Hipertrofi)',
    badge: 'Klasik Estetik',
    daysPerWeek: 6,
    level: 'İleri Seviye',
    focusSplit: 'Göğüs-Sırt · Omuz-Kol · Bacak',
    tagline: "Arnold'un efsanevi Göğüs+Sırt, Omuz+Kol ve Bacak süperset odaklı estetik split'i.",
    mainGoal: 'V-Taper Estetik, Pump & Kol/Omuz Hacmi',
    targetAudience: 'Yüksek seans yoğunluğunu kaldırabilen, kol ve gövde genişliğini önceliklendiren sporcular.',
    strategySummary:
      'Zıt çalışan kas gruplarını (Göğüs & Sırt, Biceps & Triceps) aynı gün çalıştırarak kan akışını maksimize eder, dinlenme aralıklarında dahi kas tonusunu diri tutar.',
    keyBenefits: [
      'Antagonist süpersetlerle seans süresini kısaltıp metabolik stresi katlama',
      'Maksimum göğüs kafesi genişliği ve kusursuz V-Taper estetiği',
      'Kollar ve omuzlar için bağımsız gün sayesinde devasa kol gelişimi',
    ],
    days: [
      { day: 'Pazartesi', type: 'Göğüs & Sırt A', focus: 'Genişlik & Hacim, Antagonist Süpersetler', isRest: false },
      { day: 'Salı', type: 'Omuzlar & Kollar A', focus: 'Ön/Yan/Arka Omuz, Biceps & Triceps', isRest: false },
      { day: 'Çarşamba', type: 'Bacak & Karın A', focus: 'Quadriceps Odaklı, Hamstring, Kalf', isRest: false },
      { day: 'Perşembe', type: 'Dinlenme', focus: 'Toparlanma & Glikojen Depolama', isRest: true },
      { day: 'Cuma', type: 'Göğüs & Sırt B', focus: 'İç/Üst Göğüs & Sırt Kalınlığı', isRest: false },
      { day: 'Cumartesi', type: 'Omuzlar & Kollar B', focus: '3D Yan Omuz, Kol Zirveleme', isRest: false },
      { day: 'Pazar', type: 'Bacak & Karın B', focus: 'Posterior Zincir, Gluteus, Kalf', isRest: false },
    ],
  },
  {
    id: 'full-body-3day',
    name: 'Full Body (Tüm Vücut 3 Gün)',
    badge: 'Zaman Tasarrufu',
    daysPerWeek: 3,
    level: 'Başlangıç - Orta',
    focusSplit: 'Tüm Vücut Bileşik',
    tagline: 'Her seansta tüm ana kas gruplarını çalıştıran, haftada 4 gün dinlendiren verimli split.',
    mainGoal: 'Temel Güç, Metabolik Yanıt & Yalın Kütle',
    targetAudience: 'Haftada sadece 3 gün spor salonuna gidebilen veya yağ yakarken kasını korumak isteyenler.',
    strategySummary:
      'Her antrenmanda tüm büyük kas grupları bileşik hareketlerle uyarılır. Seans başına enerji tüketimi çok yüksektir ve haftalık 4 gün dinlenme kas gelişimini güvenceye alır.',
    keyBenefits: [
      'Haftada yalnızca 3 seans ile maksimum zaman tasarrufu',
      'Yüksek metabolik yanıt sayesinde yağ yakımı ve kondisyon artışı',
      'Kaçırılan antrenmanların telafisi en kolay olan esnek yapı',
    ],
    days: [
      { day: 'Pazartesi', type: 'Full Body A', focus: 'Squat, Bench Press, Barbell Row, Omuz', isRest: false },
      { day: 'Salı', type: 'Dinlenme', focus: 'Toparlanma & Kardiyo', isRest: true },
      { day: 'Çarşamba', type: 'Full Body B', focus: 'Deadlift, Overhead Press, Barfiks, Kollar', isRest: false },
      { day: 'Perşembe', type: 'Dinlenme', focus: 'Toparlanma', isRest: true },
      { day: 'Cuma', type: 'Full Body C', focus: 'Leg Press, Incline DB Press, Cable Row, Karın', isRest: false },
      { day: 'Cumartesi', type: 'Dinlenme', focus: 'Aktif Dinlenme', isRest: true },
      { day: 'Pazar', type: 'Dinlenme', focus: 'Haftalık Yenilenme', isRest: true },
    ],
  },
  {
    id: 'bro-split-5day',
    name: 'Bro Split (Klasik Bölgesel)',
    badge: 'Bölgesel İzolasyon',
    daysPerWeek: 5,
    level: 'Orta - İleri',
    focusSplit: 'Tek Kas Grubu / Gün',
    tagline: 'Her gün tek bir ana kas grubuna odaklanan, lifleri tükenişe götüren klasik split.',
    mainGoal: 'Kas İzolasyonu, Zihin-Kas Bağlantısı & Şişkinlik',
    targetAudience: 'Tek bir bölgeyi tamamen tüketmeyi seven ve haftada 5 gün salona gidebilen sporcular.',
    strategySummary:
      'Her kas grubuna seansta 15-20 setlik derin hacim ve farklı açılardan izolasyon uygulanır. Lifler tamamen yıpratıldıktan sonra bir sonraki haftaya kadar 7 gün dinlendirilir.',
    keyBenefits: [
      'Her kas grubuna tüm enerjiyi tüketene kadar odaklanabilme',
      'Seans içi yoğun kan pompalanması (pump) ve zihin-kas bağlantısı',
      'Çalıştırılan bölge için 7 tam gün iyileşme süresi',
    ],
    days: [
      { day: 'Pazartesi', type: 'Göğüs Günü', focus: 'Düz, Eğimli ve Açış Varyasyonları', isRest: false },
      { day: 'Salı', type: 'Sırt Günü', focus: 'Lat Pulldown, Row Çeşitleri, Deadlift', isRest: false },
      { day: 'Çarşamba', type: 'Dinlenme', focus: 'Toparlanma & Aktif Dinlenme', isRest: true },
      { day: 'Perşembe', type: 'Omuz Günü', focus: 'Overhead Press, Lateral Raise, Arka Omuz', isRest: false },
      { day: 'Cuma', type: 'Bacak Günü', focus: 'Squat, Leg Press, Hamstring Curl, Kalf', isRest: false },
      { day: 'Cumartesi', type: 'Kol Günü', focus: 'Biceps & Triceps Süpersetleri, Karın', isRest: false },
      { day: 'Pazar', type: 'Dinlenme', focus: 'Haftalık Yenilenme', isRest: true },
    ],
  },
  {
    id: 'torso-limbs-4day',
    name: 'Torso / Limbs (Gövde & Ekstremiteler)',
    badge: 'Modern Hibrit',
    daysPerWeek: 4,
    level: 'Orta Seviye',
    focusSplit: 'Gövde · Kollar & Bacaklar',
    tagline: 'Gövdeyi (Göğüs-Sırt) bir gün, ekstremiteleri (Bacak-Kol-Omuz) ayrı gün çalıştıran split.',
    mainGoal: 'Kol ve Omuz Öncelikli Estetik Gelişim',
    targetAudience: 'Kollarının göğüs/sırt günlerinde yorulmasından şikayetçi olan ve kol hacmini artırmak isteyenler.',
    strategySummary:
      'Kollar ve yan omuzlar, gövde itiş ve çekişlerinden ayrı bir günde bacaklarla eşleştirilir. Bu sayede kollara dinçken maksimum ağırlık yüklenmesi yapılabilir.',
    keyBenefits: [
      'Zayıf kollar ve yan omuzlar için öncelikli hipertrofi ortamı',
      'Göğüs ve sırtta ön yorgunluk olmadan daha yüksek kuvvet aktarımı',
      'Haftada 4 gün ile optimum antrenman/yaşam dengesi',
    ],
    days: [
      { day: 'Pazartesi', type: 'Gövde A', focus: 'Göğüs, Sırt ve Üst Sırt Bileşikleri', isRest: false },
      { day: 'Salı', type: 'Ekstremite A', focus: 'Bacaklar, Biceps, Triceps, Yan Omuz', isRest: false },
      { day: 'Çarşamba', type: 'Dinlenme', focus: 'Toparlanma Günü', isRest: true },
      { day: 'Perşembe', type: 'Gövde B', focus: 'Üst Göğüs, Kanat & Trapez, Karın', isRest: false },
      { day: 'Cuma', type: 'Ekstremite B', focus: 'Posterior Bacak, Kollar Zirveleme', isRest: false },
      { day: 'Cumartesi', type: 'Dinlenme', focus: 'Toparlanma', isRest: true },
      { day: 'Pazar', type: 'Dinlenme', focus: 'Haftalık Yenilenme', isRest: true },
    ],
  },
];

// ─── İkon Bileşenleri ───
function EditPencilIcon({ color = colors.purpleLight, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </Svg>
  );
}

function ChevronDownIcon({ color = colors.textDim, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M19 9l-7 7-7-7" />
    </Svg>
  );
}

function TargetIcon({ color = colors.purpleLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Circle cx="12" cy="12" r="6" strokeWidth="2" />
      <Circle cx="12" cy="12" r="2" strokeWidth="2" fill={color} />
    </Svg>
  );
}

function CheckCircleIcon({ color = colors.emeraldLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4" />
    </Svg>
  );
}

function CalendarIcon({ color = colors.cyan, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
      <Path strokeLinecap="round" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
  );
}

export default function ProgramPoolScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { saveCustomProgram, isSaving } = useProgram();

  // Açık olan kartın id'si (Varsayılan olarak tüm kartlar kapalı)
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingProgramId, setSavingProgramId] = useState<string | null>(null);

  // Kullanıcının şu anki split'ini kontrol et
  const activePresetId = useMemo(() => {
    if (!user?.custom_split) return null;
    try {
      const parsed = JSON.parse(user.custom_split);
      const firstWeek = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
      if (!firstWeek || !Array.isArray(firstWeek) || firstWeek.length < 7) return null;

      // Program havuzundaki günlerle eşleştir
      for (const preset of POPULAR_PROGRAMS) {
        let matchCount = 0;
        for (let i = 0; i < 7; i++) {
          const userDay = firstWeek[i];
          const presetDay = preset.days[i];
          if (
            userDay &&
            presetDay &&
            userDay.isRest === presetDay.isRest &&
            userDay.type?.trim().toLowerCase() === presetDay.type?.trim().toLowerCase()
          ) {
            matchCount++;
          }
        }
        // En az 5 gün uyuşuyorsa bu şablondur
        if (matchCount >= 5) {
          return preset.id;
        }
      }
    } catch {
      // JSON parse hatası
    }
    return null;
  }, [user?.custom_split]);

  // Kartı genişletme / daraltma (120Hz akıcı reanimated geçişi)
  const toggleCard = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Programı Seçme İşlemi
  const handleSelectProgram = async (program: PresetProgram) => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Lütfen önce giriş yapın.');
      return;
    }

    setSavingProgramId(program.id);
    try {
      await saveCustomProgram({
        username: user.username,
        program: [program.days],
      });
      Alert.alert(
        '🎉 Program Aktif Edildi!',
        `"${program.name}" programı başarıyla ana antrenman split'iniz olarak belirlendi.`,
        [{ text: 'Harika!' }]
      );
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Program kaydedilirken bir sorun oluştu.');
    } finally {
      setSavingProgramId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Sayfa Üst Başlığı */}
        <View style={styles.header}>
          <View>
            <View style={styles.headerTitleRow}>
              <Text style={styles.screenTitle}>Program Havuzu</Text>
              <View style={styles.poolBadge}>
                <Text style={styles.poolBadgeText}>{POPULAR_PROGRAMS.length} Popüler Plan</Text>
              </View>
            </View>
            <Text style={styles.screenSubtitle}>
              Bilimsel ve kanıtlanmış haftalık antrenman programlarını keşfedin
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ══════════════════════════════════════════════════
              1. SAYFANIN EN ÜSTÜNDEKİ MOR BUTON: KENDİ PROGRAMINI YAZ
              (Kullanıcının isteği: şimdiki sayfaya geçecek mor buton)
             ══════════════════════════════════════════════════ */}
          <TouchableOpacity
            style={styles.createOwnProgramHeroBtn}
            onPress={() => router.push('/(app)/program/custom' as any)}
            activeOpacity={0.82}
          >
            <View style={styles.createOwnHeroLeft}>
              <View style={styles.createOwnIconCircle}>
                <EditPencilIcon size={20} color={colors.purpleLight} />
              </View>
              <View style={styles.createOwnTextGroup}>
                <View style={styles.createOwnTitleRow}>
                  <Text style={styles.createOwnTitle}>Kendi Programını Yaz</Text>
                  <View style={styles.createOwnCustomBadge}>
                    <Text style={styles.createOwnCustomBadgeText}>Özel</Text>
                  </View>
                </View>
                <Text style={styles.createOwnSubtitle}>
                  Gün gün kendi split ve kas odaklarınızı sıfırdan oluşturun →
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Bölüm Başlığı */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>SEÇİLEBİLİR POPÜLER PROGRAMLAR</Text>
            <Text style={styles.sectionHint}>İncelemek için karta dokunun</Text>
          </View>

          {/* ══════════════════════════════════════════════════
              2. KART KART DİZİLEN PROGRAM HAVUZU LİSTESİ
             ══════════════════════════════════════════════════ */}
          <View style={styles.programCardsList}>
            {POPULAR_PROGRAMS.map((program) => {
              const isExpanded = expandedId === program.id;
              const isActive = activePresetId === program.id;
              const isCurrentlySaving = savingProgramId === program.id;

              return (
                <Animated.View
                  key={program.id}
                  layout={LinearTransition.duration(450).easing(Easing.bezier(0.25, 1, 0.35, 1))}
                  style={[
                    styles.programCard,
                    isExpanded && styles.programCardExpanded,
                    isActive && styles.programCardActive,
                  ]}
                >
                  {/* Kart Başlık Bölümü (Tıklanabilir) */}
                  <TouchableOpacity
                    style={styles.cardHeaderPressable}
                    onPress={() => toggleCard(program.id)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.cardHeaderTopRow}>
                      <View style={styles.cardBadgesRow}>
                        <View style={styles.daysBadge}>
                          <CalendarIcon size={12} color={colors.cyanLight} />
                          <Text style={styles.daysBadgeText}>{program.daysPerWeek} Gün / Hafta</Text>
                        </View>
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelBadgeText}>{program.level}</Text>
                        </View>
                        <View style={styles.splitBadge}>
                          <Text style={styles.splitBadgeText}>{program.badge}</Text>
                        </View>
                      </View>

                      {isActive && (
                        <View style={styles.activePill}>
                          <View style={styles.activeDot} />
                          <Text style={styles.activePillText}>AKTİF</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.cardTitleRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{program.name}</Text>
                        <Text style={styles.cardTagline} numberOfLines={isExpanded ? undefined : 2}>
                          {program.tagline}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.chevronWrap,
                          isExpanded && { transform: [{ rotate: '180deg' }] },
                        ]}
                      >
                        <ChevronDownIcon size={20} color={isExpanded ? colors.purpleLight : colors.textDim} />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* ═══════════════════════════════════════════════
                      KART GENİŞLEDİĞİNDE GÖRÜNEN İÇERİK
                     ═══════════════════════════════════════════════ */}
                  {isExpanded && (
                    <Animated.View
                      entering={FadeIn.duration(380).easing(Easing.bezier(0.25, 1, 0.35, 1))}
                      exiting={FadeOut.duration(260).easing(Easing.bezier(0.25, 1, 0.35, 1))}
                      style={styles.expandedContent}
                    >
                      {/* 1. Programın Ana Amacı ve Hedefi */}
                      <View style={styles.goalSectionBox}>
                        <View style={styles.goalSectionHeader}>
                          <TargetIcon size={16} color={colors.purpleLight} />
                          <Text style={styles.goalSectionHeading}>PROGRAMIN ANA AMACI VE STRATEJİSİ</Text>
                        </View>

                        <View style={styles.goalTitleBadge}>
                          <Text style={styles.goalTitleBadgeText}>{program.mainGoal}</Text>
                        </View>

                        <Text style={styles.goalDescText}>{program.strategySummary}</Text>

                        <View style={styles.keyBenefitsBox}>
                          <Text style={styles.keyBenefitsHeading}>Öne Çıkan Faydalar:</Text>
                          {program.keyBenefits.map((benefit, bIdx) => (
                            <View key={bIdx} style={styles.benefitRow}>
                              <CheckCircleIcon size={14} color={colors.emeraldLight} />
                              <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* 2. Haftalık Rutin Dağılımı (7 Gün) */}
                      <View style={styles.scheduleSection}>
                        <View style={styles.scheduleHeaderRow}>
                          <CalendarIcon size={15} color={colors.cyanLight} />
                          <Text style={styles.scheduleSectionHeading}>HAFTALIK GÜN DAĞILIMI (7 GÜN)</Text>
                        </View>

                        <View style={styles.daysTable}>
                          {program.days.map((dayItem, dIdx) => (
                            <View
                              key={dIdx}
                              style={[
                                styles.dayTableRow,
                                dayItem.isRest ? styles.dayTableRowRest : styles.dayTableRowWorkout,
                                dIdx === program.days.length - 1 && { borderBottomWidth: 0 },
                              ]}
                            >
                              {/* Sol Sütun: Gün Adı ve Program/Seans İsmi (Alt Alta) */}
                              <View style={styles.dayColLeft}>
                                <Text
                                  style={[
                                    styles.dayNameText,
                                    dayItem.isRest && styles.dayNameTextRest,
                                  ]}
                                >
                                  {dayItem.day}
                                </Text>
                                <View
                                  style={[
                                    styles.dayTypeChip,
                                    dayItem.isRest ? styles.dayTypeChipRest : styles.dayTypeChipWorkout,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.dayTypeChipText,
                                      dayItem.isRest ? styles.dayTypeChipTextRest : styles.dayTypeChipTextWorkout,
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {dayItem.isRest ? '💤 Dinlenme' : `🔥 ${dayItem.type}`}
                                  </Text>
                                </View>
                              </View>

                              {/* Sağ Sütun / Önü: Günün İçeriği */}
                              <View style={styles.dayColRight}>
                                <Text
                                  style={[
                                    styles.dayFocusText,
                                    dayItem.isRest && styles.dayFocusTextRest,
                                  ]}
                                >
                                  {dayItem.focus}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* 3. Programı Seç Butonu (Yeşil Neon Çerçeveli) */}
                      <TouchableOpacity
                        style={[
                          styles.selectProgramNeonBtn,
                          isActive && styles.selectProgramActiveBtn,
                          (isCurrentlySaving || isSaving) && { opacity: 0.6 },
                        ]}
                        onPress={() => handleSelectProgram(program)}
                        disabled={isCurrentlySaving || isSaving}
                        activeOpacity={0.75}
                      >
                        {isCurrentlySaving ? (
                          <ActivityIndicator size="small" color={colors.emeraldLight} />
                        ) : (
                          <Text style={styles.selectProgramNeonBtnText}>
                            {isActive ? '✓ Bu Program Şu Anda Aktif' : 'Bu Programı Seç ve Başla'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
  },
  poolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  poolBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  screenSubtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 4,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  // ─── En Üstteki Mor Buton: Kendi Programını Yaz ───
  createOwnProgramHeroBtn: {
    backgroundColor: '#131126',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    padding: 16,
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 0,
  },
  createOwnHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  createOwnIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
    borderWidth: 1.2,
    borderColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createOwnTextGroup: {
    flex: 1,
  },
  createOwnTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createOwnTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  createOwnCustomBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.purpleLight,
  },
  createOwnCustomBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#080B14',
  },
  createOwnSubtitle: {
    fontSize: 12,
    color: colors.purpleLight,
    marginTop: 3,
    lineHeight: 16,
    fontWeight: '500',
  },

  // ─── Bölüm Başlığı ───
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
  },
  sectionHint: {
    fontSize: 11,
    color: colors.textDim,
  },

  // ─── Program Kartları ───
  programCardsList: {
    gap: 14,
  },
  programCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  programCardExpanded: {
    borderColor: 'rgba(139, 92, 246, 0.45)',
    backgroundColor: '#0F1424',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 0,
  },
  programCardActive: {
    borderColor: colors.emeraldBorder,
  },
  cardHeaderPressable: {
    padding: 16,
  },
  cardHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: colors.cyanBg,
    borderWidth: 1,
    borderColor: colors.cyanBorder,
  },
  daysBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.cyanLight,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: colors.amberBg,
    borderWidth: 1,
    borderColor: colors.amberBorder,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.amberLight,
  },
  splitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  splitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.emeraldBg,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emeraldLight,
  },
  activePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.emeraldLight,
    letterSpacing: 0.5,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  cardTagline: {
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 4,
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  // ─── Genişletilmiş İçerik ───
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 14,
  },
  goalSectionBox: {
    backgroundColor: colors.cardBgInner,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    padding: 14,
    marginBottom: 16,
  },
  goalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  goalSectionHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.purpleLight,
    letterSpacing: 0.8,
  },
  goalTitleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  goalTitleBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  goalDescText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  keyBenefitsBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
    gap: 5,
  },
  keyBenefitsHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDim,
    marginBottom: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 11.5,
    color: colors.text,
    flex: 1,
    lineHeight: 16,
  },

  // ─── Haftalık Rutin Günleri ───
  scheduleSection: {
    marginBottom: 16,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  scheduleSectionHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.cyanLight,
    letterSpacing: 0.8,
  },
  daysTable: {
    backgroundColor: colors.cardBgInner,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  dayTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    gap: 14,
  },
  dayTableRowWorkout: {
    backgroundColor: 'transparent',
  },
  dayTableRowRest: {
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },
  dayColLeft: {
    width: 100,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3.5,
  },
  dayNameText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  dayNameTextRest: {
    color: colors.textDim,
  },
  dayTypeChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dayTypeChipWorkout: {
    backgroundColor: colors.emeraldBg,
    borderWidth: 0.8,
    borderColor: colors.emeraldBorder,
  },
  dayTypeChipRest: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayTypeChipText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  dayTypeChipTextWorkout: {
    color: colors.emeraldLight,
  },
  dayTypeChipTextRest: {
    color: colors.textDim,
  },
  dayColRight: {
    flex: 1,
    justifyContent: 'center',
  },
  dayFocusText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16.5,
    textAlign: 'left',
    fontWeight: '500',
  },
  dayFocusTextRest: {
    color: colors.textDim,
    fontStyle: 'italic',
  },

  // ─── Yeşil Neon Çerçeveli "Programı Seç" Butonu ───
  selectProgramNeonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.emerald,
    backgroundColor: colors.emeraldBg,
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 0,
  },
  selectProgramActiveBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderColor: colors.emeraldLight,
  },
  selectProgramNeonBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.emeraldLight,
    letterSpacing: 0.3,
  },
});
