import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Card } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { formatTrDate } from '@/lib/rpe';

// ─── Renk Token'ları (Cyber Dark Paleti) ───
const colors = {
  background: '#080B14',
  cardBg: '#101524',
  cardBgInner: '#0C101C',
  itemBg: '#121829',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderHover: 'rgba(139, 92, 246, 0.35)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  // Cyan (Boy)
  cyan: '#38BDF8',
  cyanLight: '#7DD3FC',
  cyanBg: 'rgba(56, 189, 248, 0.12)',
  cyanBorder: 'rgba(56, 189, 248, 0.28)',

  // Amber (Yaş)
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  amberBg: 'rgba(245, 158, 11, 0.12)',
  amberBorder: 'rgba(245, 158, 11, 0.28)',

  // Emerald (Kilo)
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.12)',
  emeraldBorder: 'rgba(16, 185, 129, 0.28)',

  // Purple (Cinsiyet)
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleBg: 'rgba(139, 92, 246, 0.12)',
  purpleBorder: 'rgba(139, 92, 246, 0.28)',

  // Pembe (Kadın)
  pink: '#EC4899',
  pinkLight: '#F472B6',
  pinkBg: 'rgba(236, 72, 153, 0.12)',
  pinkBorder: 'rgba(236, 72, 153, 0.28)',

  // Modal Sheet
  modalSheetBg: '#0F1424',
  modalHandle: '#334155',
};

// ─── SVG İkonları ───
function BackIcon({ color = '#F8FAFC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function EditPencilIcon({ color = colors.purpleLight, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </Svg>
  );
}

function RulerIcon({ color = colors.cyan, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 7L7 21l-4-4L17 3l4 4zM7 13l2 2m-4-4l2 2m4-4l2 2m4-4l2 2"
      />
    </Svg>
  );
}



function MaleIcon({ color = colors.purpleLight, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="10" cy="14" r="5" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 5l-5.4 5.4M19 5h-4m4 0v4" />
    </Svg>
  );
}

function FemaleIcon({ color = colors.pinkLight, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="9" r="5" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7m-3-3h6" />
    </Svg>
  );
}

function CheckCircleFill({ size = 18, color = colors.purpleLight }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </Svg>
  );
}

function CheckBadgeSolidIcon({ size = 16, color = '#10B981' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.8"
        stroke="#080B14"
        d="M8.5 12.5l2.5 2.5 5-5"
      />
    </Svg>
  );
}

function SimplePencilIcon({ color = '#94A3B8', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </Svg>
  );
}

function ChevronDownIcon({ size = 16, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 9l-7 7-7-7" />
    </Svg>
  );
}

function ChevronUpIcon({ size = 16, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 15l7-7 7 7" />
    </Svg>
  );
}

function CloseIcon({ size = 16, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M6 18L18 6M6 6l12 12" />
    </Svg>
  );
}

function CalendarIcon({ color = '#C084FC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
      <Circle cx="9" cy="15" r="1" fill={color} />
      <Circle cx="12" cy="15" r="1" fill={color} />
      <Circle cx="15" cy="15" r="1" fill={color} />
    </Svg>
  );
}

function UserMiniIcon({ color = colors.purpleLight, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <Circle cx="12" cy="7" r="4" strokeWidth="2" />
    </Svg>
  );
}

function ClockIcon({ color = colors.purpleLight, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="9" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v5l3 3" />
    </Svg>
  );
}

function TargetIcon({ color = colors.purpleLight, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="9" strokeWidth="2" />
      <Circle cx="12" cy="12" r="5" strokeWidth="2" />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
    </Svg>
  );
}

function WeightBoxIcon({ color = colors.emeraldLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="6" r="3" strokeWidth="2" />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6.5 9a2 2 0 00-1.9 1.46L2.1 19.5A2 2 0 004 22h16a2 2 0 001.9-2.5l-2.5-9.04A2 2 0 0017.5 9z"
      />
    </Svg>
  );
}

function DumbbellIcon({ color = colors.cyan, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
    </Svg>
  );
}

function HeartPulseIcon({ color = colors.emeraldLight, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </Svg>
  );
}

function FlameIcon({ color = colors.purpleLight, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </Svg>
  );
}

// ─── Yardımcı Fonksiyonlar & Seçenekler ───
const GOAL_CHOICES = [
  { key: 'hypertrophy', label: 'Kas geliştirme', desc: 'Hipertrofi odaklı hacim ve lif gelişimi' },
  { key: 'bulk', label: 'Hacim & Kütle', desc: 'Kontrollü kalori fazlası ve net kütle inşası' },
  { key: 'cut', label: 'Definasyon & Yağ Yakımı', desc: 'Kas kütlesini koruyarak yağ yakımı' },
  { key: 'strength', label: 'Maksimal Güç (Kuvvet)', desc: 'Nöromüsküler patlayıcı kuvvet' },
  { key: 'maintain', label: 'Form Koruma (Rekomp)', desc: 'Mevcut formu koruma ve zindelik' },
];

const LEVEL_CHOICES = [
  { key: 'Beginner', label: 'Başlangıç seviyesi', desc: '0 - 1 yıl antrenman deneyimi' },
  { key: 'Intermediate', label: 'Orta seviye', desc: '1 - 3 yıl düzenli antrenman' },
  { key: 'Advanced', label: 'İleri seviye', desc: '3+ yıl disiplinli hipertrofi' },
];

function formatGoal(raw?: string | null): string {
  if (!raw) return 'Kas geliştirme';
  const match = GOAL_CHOICES.find((c) => c.key.toLowerCase() === raw.toLowerCase());
  if (match) return match.label;
  const l = raw.toLowerCase();
  if (l.includes('hypertrophy') || l.includes('kas')) return 'Kas geliştirme';
  if (l.includes('strength') || l.includes('güç')) return 'Maksimal Güç (Kuvvet)';
  if (l.includes('endurance') || l.includes('dayanıklılık')) return 'Dayanıklılık';
  if (l.includes('fat') || l.includes('kilo') || l.includes('cut')) return 'Definasyon & Yağ Yakımı';
  return raw;
}

function formatFitnessLevel(raw?: string | null): string {
  if (!raw) return 'İleri seviye';
  const match = LEVEL_CHOICES.find((c) => c.key.toLowerCase() === raw.toLowerCase());
  if (match) return match.label;
  const l = raw.toLowerCase();
  if (l.includes('adv') || l.includes('ileri')) return 'İleri seviye';
  if (l.includes('inter') || l.includes('orta')) return 'Orta seviye';
  if (l.includes('beg') || l.includes('başlangıç')) return 'Başlangıç seviyesi';
  return raw;
}
function normalizeGender(raw?: string | null): 'male' | 'female' {
  if (!raw) return 'male';
  const g = raw.toLowerCase();
  if (g.includes('fem') || g.includes('kadın') || g.includes('kadin')) return 'female';
  return 'male';
}

/**
 * Her cihazda (iOS, Android, farklı ekran en-boy oranları, klavye yükseklikleri ve
 * sistem pencere yeniden boyutlandırma davranışlarında - adjustResize vs adjustNothing)
 * panonun klavyenin hemen üzerine hizalanmasını sağlayan otomatik dinamik hesaplama fonksiyonu.
 */
function calculateAutoKeyboardShift(params: {
  keyboardScreenY?: number;
  keyboardHeight: number;
  containerLayoutY: number;
  containerHeight: number;
  sheetHeight: number;
  statusBarInset?: number;
}): number {
  const {
    keyboardScreenY = 0,
    keyboardHeight,
    containerLayoutY,
    containerHeight,
    sheetHeight,
    statusBarInset = 44,
  } = params;

  if (keyboardHeight <= 0) return 0;

  const screenH = Dimensions.get('screen').height;
  const windowH = Dimensions.get('window').height;
  const baseScreenHeight = Math.max(screenH, windowH);

  // 1. Android / Sistem Otomatik Boyutlandırma Kontrolü:
  // Eğer sistem (örneğin Android adjustResize) pencereyi zaten klavye kadar küçülttüyse,
  // containerHeight pencere boyuna daralmıştır ve pano otomatik olarak klavyenin üzerine oturmuştur.
  // Bu durumda ek kaydırma uygulamak panoyu ekranın yukarısına fırlatır!
  const isAlreadyResizedBySystem = containerHeight <= baseScreenHeight - (keyboardHeight * 0.7);
  if (isAlreadyResizedBySystem) {
    return 0;
  }

  // 2. Ekran Geometrisi:
  // Klavyenin ekran üzerindeki başlangıç Y koordinatı
  const actualKeyboardTop =
    keyboardScreenY > 0 && keyboardScreenY < baseScreenHeight
      ? keyboardScreenY
      : baseScreenHeight - keyboardHeight;

  // Panonun alt kenarının mutlak ekran konumu
  const containerScreenBottom = containerLayoutY + containerHeight;

  // Panonun klavye ile çakışan (altta kalan) piksel miktarı
  const overlap = Math.max(0, containerScreenBottom - actualKeyboardTop);
  if (overlap <= 0) return 0;

  // 3. Tavan Güvenliği:
  // Panonun üst kenarı hiçbir telefonda ekranın tepesinden (durum çubuğu + çentik) yukarı taşamaz
  const maxAllowedShift = Math.max(0, containerHeight - sheetHeight - statusBarInset);

  return Math.min(overlap, maxAllowedShift);
}

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user, updateProfile, isUpdatingProfile } = useUser();

  // Düzenleme Modalı State'leri
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [formGender, setFormGender] = useState<'male' | 'female'>('male');
  const [formAge, setFormAge] = useState('');
  const [formHeight, setFormHeight] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formTargetWeight, setFormTargetWeight] = useState('');
  const [formGoal, setFormGoal] = useState('hypertrophy');
  const [formFitnessLevel, setFormFitnessLevel] = useState('Advanced');
  const [formDaysPerWeek, setFormDaysPerWeek] = useState(4);
  const [formSessionTimeMins, setFormSessionTimeMins] = useState(60);
  const [activeDropdown, setActiveDropdown] = useState<'goal' | 'level' | null>(null);
  const [isDurationOpen, setIsDurationOpen] = useState(false);

  // Kullanıcı bilgileri
  const gender = normalizeGender(user?.gender);
  const age = user?.age ?? null;
  const height = user?.height ?? null;
  const weight = user?.weight ?? null;

  // Bilimsel Biyometrik Hesaplamalar (Görseldeki değerlerle birebir uyumlu)
  const { bmi, bmiCategory, bmr } = useMemo(() => {
    const effectiveHeight = height || 180;
    const effectiveWeight = weight || 80;
    const effectiveAge = age || 22;

    const heightM = effectiveHeight / 100;
    const bmiVal = effectiveWeight / (heightM * heightM);
    // Türkçe standart format (virgüllü, örn: 24,7)
    const bmiFormatted = bmiVal.toFixed(1).replace('.', ',');

    let category = 'Normal aralık';
    if (bmiVal < 18.5) {
      category = 'Düşük aralık';
    } else if (bmiVal < 25) {
      category = 'Normal aralık';
    } else if (bmiVal < 30) {
      category = 'Fazla kilo';
    } else {
      category = 'Yüksek aralık';
    }

    // Mifflin-St Jeor BMR Formülü
    let bmrVal = 10 * effectiveWeight + 6.25 * effectiveHeight - 5 * effectiveAge;
    if (gender === 'male') {
      bmrVal += 5;
    } else {
      bmrVal -= 161;
    }

    return {
      bmi: bmiFormatted,
      bmiCategory: category,
      bmr: Math.round(bmrVal),
    };
  }, [height, weight, age, gender]);

  // ─── Sürüklenebilir Alt Panel (Bottom Sheet) Animasyon & PanResponder ───
  const estimatedSheetHeight = 650;
  const [sheetHeight, setSheetHeight] = useState(estimatedSheetHeight);

  const [translateY] = useState(() => new Animated.Value(estimatedSheetHeight));
  const [backdropAnim] = useState(() => new Animated.Value(0));
  const [keyboardShift] = useState(() => new Animated.Value(0));

  // Cinsiyet yumuşak renk/çerçeve geçiş animasyonu (0: Erkek, 1: Kadın)
  const [genderAnim] = useState(() => new Animated.Value(0));

  // Açılır Listeler İçin Yumuşak Animasyon Değerleri (0: Kapalı, 1: Açık)
  const [dropdownAnim] = useState(() => new Animated.Value(0));
  const [durationAnim] = useState(() => new Animated.Value(0));
  // Menü açıkken alttaki butonların kazara tıklanmasını (touch bleed-through) önleyen kilit
  const [isMenuTouchGuard, setIsMenuTouchGuard] = useState(false);

  // Açılır Menüleri Yumuşak Animasyonla Aç/Kapat
  const toggleDropdown = useCallback(
    (type: 'goal' | 'level') => {
      Keyboard.dismiss();
      setIsDurationOpen(false);
      durationAnim.setValue(0);

      if (activeDropdown === type) {
        Animated.timing(dropdownAnim, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          setActiveDropdown(null);
          setTimeout(() => setIsMenuTouchGuard(false), 180);
        });
      } else {
        setIsMenuTouchGuard(true);
        setActiveDropdown(type);
        dropdownAnim.setValue(0);
        Animated.spring(dropdownAnim, {
          toValue: 1,
          damping: 20,
          mass: 0.8,
          stiffness: 240,
          useNativeDriver: true,
        }).start();
      }
    },
    [activeDropdown, dropdownAnim, durationAnim]
  );

  const closeDropdown = useCallback(() => {
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setActiveDropdown(null);
      setTimeout(() => setIsMenuTouchGuard(false), 180);
    });
  }, [dropdownAnim]);

  const toggleDuration = useCallback(() => {
    Keyboard.dismiss();
    setActiveDropdown(null);
    dropdownAnim.setValue(0);

    if (isDurationOpen) {
      Animated.timing(durationAnim, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setIsDurationOpen(false);
        setTimeout(() => setIsMenuTouchGuard(false), 180);
      });
    } else {
      setIsMenuTouchGuard(true);
      setIsDurationOpen(true);
      durationAnim.setValue(0);
      Animated.spring(durationAnim, {
        toValue: 1,
        damping: 20,
        mass: 0.8,
        stiffness: 240,
        useNativeDriver: true,
      }).start();
    }
  }, [durationAnim, dropdownAnim, isDurationOpen]);

  const closeDuration = useCallback(() => {
    Animated.timing(durationAnim, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setIsDurationOpen(false);
      setTimeout(() => setIsMenuTouchGuard(false), 180);
    });
  }, [durationAnim]);

  const dropdownAnimatedStyle = useMemo(
    () => ({
      opacity: dropdownAnim,
      transform: [
        {
          translateY: dropdownAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [14, 0],
          }),
        },
        {
          scale: dropdownAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1],
          }),
        },
      ],
    }),
    [dropdownAnim]
  );

  const durationAnimatedStyle = useMemo(
    () => ({
      opacity: durationAnim,
      transform: [
        {
          translateY: durationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [14, 0],
          }),
        },
        {
          scale: durationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1],
          }),
        },
      ],
    }),
    [durationAnim]
  );

  // Kapsayıcı render yüksekliği ve Y konumu (State olarak saklanır)
  const [containerHeight, setContainerHeight] = useState(() => Dimensions.get('window').height);
  const [containerY, setContainerY] = useState(0);

  // Klavye ve Sürükleme birleşik translateY değeri
  const combinedTranslateY = useMemo(
    () => Animated.subtract(translateY, keyboardShift),
    [translateY, keyboardShift]
  );

  // Klavye açıldığında panoyu her cihazın ekran geometrisine göre otomatik hizala
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const rawHeight = e.endCoordinates ? e.endCoordinates.height : 0;
      if (rawHeight <= 0) return;

      const targetShift = calculateAutoKeyboardShift({
        keyboardScreenY: e.endCoordinates ? e.endCoordinates.screenY : 0,
        keyboardHeight: rawHeight,
        containerLayoutY: containerY,
        containerHeight: containerHeight || Dimensions.get('window').height,
        sheetHeight: sheetHeight || estimatedSheetHeight,
        statusBarInset: 44,
      });

      Animated.timing(keyboardShift, {
        toValue: targetShift,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 180,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardShift, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration || 220) : 180,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [containerHeight, containerY, estimatedSheetHeight, keyboardShift, sheetHeight]);

  // Yüksek akışlı (high-flow) yaylanma animasyonuyla açılış
  const openSheet = useCallback(() => {
    keyboardShift.setValue(0);
    translateY.setValue(sheetHeight || estimatedSheetHeight);
    backdropAnim.setValue(0);

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        mass: 0.8,
        stiffness: 220,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        useNativeDriver: false,
      }),
    ]).start();
  }, [backdropAnim, estimatedSheetHeight, keyboardShift, sheetHeight, translateY]);

  // Yüksek akışlı pürüzsüz kapanış animasyonu
  const closeSheet = useCallback(() => {
    Keyboard.dismiss();

    // Klavyenin açık olması durumunda dahi panonun ekranın tamamen altına inmesini sağlar
    const targetY = (sheetHeight || estimatedSheetHeight) + 400;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: targetY,
        duration: 220,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
      Animated.timing(keyboardShift, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsEditModalVisible(false);
      setActiveDropdown(null);
      setIsDurationOpen(false);
      setIsMenuTouchGuard(false);
      dropdownAnim.setValue(0);
      durationAnim.setValue(0);
      keyboardShift.setValue(0);
      translateY.setValue(sheetHeight || estimatedSheetHeight);
    });
  }, [backdropAnim, dropdownAnim, durationAnim, estimatedSheetHeight, keyboardShift, sheetHeight, translateY]);

  useEffect(() => {
    if (isEditModalVisible) {
      openSheet();
    }
  }, [isEditModalVisible, openSheet]);

  // PanResponder: Tutamaç veya başlık çekildiğinde paneli parmakla 1:1 aşağı indirir
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 1 || Math.abs(gestureState.dy) > 2;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return gestureState.dy > 1 || Math.abs(gestureState.dy) > 2;
        },
        onPanResponderGrant: () => {
          Keyboard.dismiss();
          translateY.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            const fade = Math.max(0.2, 1 - gestureState.dy / (sheetHeight * 1.1));
            backdropAnim.setValue(fade);
          } else {
            translateY.setValue(gestureState.dy * 0.18);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldDismiss = gestureState.dy > 70 || gestureState.vy > 0.4;
          if (shouldDismiss) {
            closeSheet();
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                damping: 22,
                mass: 0.8,
                stiffness: 240,
                useNativeDriver: false,
              }),
              Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 160,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
              }),
            ]).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              damping: 22,
              mass: 0.8,
              stiffness: 240,
              useNativeDriver: false,
            }),
            Animated.timing(backdropAnim, {
              toValue: 1,
              duration: 160,
              easing: Easing.out(Easing.quad),
              useNativeDriver: false,
            }),
          ]).start();
        },
      }),
    [backdropAnim, closeSheet, sheetHeight, translateY]
  );

  // Modalı Aç ve Değerleri Yükle
  const openEditModal = () => {
    const curGender = normalizeGender(user?.gender);
    setFormGender(curGender);
    genderAnim.setValue(curGender === 'male' ? 0 : 1);
    setFormAge(user?.age ? String(user?.age) : '');
    setFormHeight(user?.height ? String(user?.height) : '');
    setFormWeight(user?.weight ? String(user?.weight) : '');
    setFormTargetWeight(user?.target_weight ? String(user.target_weight) : '');
    setFormGoal(user?.goal || 'hypertrophy');
    setFormFitnessLevel(user?.fitness_level || 'Advanced');
    setFormDaysPerWeek(user?.days_per_week || 4);
    setFormSessionTimeMins(user?.session_time_mins || 60);
    setActiveDropdown(null);
    setIsDurationOpen(false);
    setIsMenuTouchGuard(false);
    dropdownAnim.setValue(0);
    durationAnim.setValue(0);
    setIsEditModalVisible(true);
  };

  // Cinsiyet Yumuşak Geçişi
  const selectGender = (newGender: 'male' | 'female') => {
    Keyboard.dismiss();
    setFormGender(newGender);
    Animated.spring(genderAnim, {
      toValue: newGender === 'male' ? 0 : 1,
      damping: 20,
      stiffness: 220,
      mass: 0.7,
      useNativeDriver: false,
    }).start();
  };

  // Yumuşak Geçiş Renkleri
  const maleBorderColor = useMemo(
    () =>
      genderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.cyan, 'rgba(255, 255, 255, 0.08)'],
      }),
    [genderAnim]
  );
  const maleBgColor = useMemo(
    () =>
      genderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(56, 189, 248, 0.14)', '#121829'],
      }),
    [genderAnim]
  );
  const maleTextColor = useMemo(
    () =>
      genderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.cyan, colors.textMuted],
      }),
    [genderAnim]
  );

  const femaleBorderColor = useMemo(
    () =>
      genderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255, 255, 255, 0.08)', colors.pinkLight],
      }),
    [genderAnim]
  );
  const femaleBgColor = useMemo(
    () =>
      genderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#121829', 'rgba(236, 72, 153, 0.14)'],
      }),
    [genderAnim]
  );
  const femaleTextColor = useMemo(
    () =>
      genderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.textMuted, colors.pinkLight],
      }),
    [genderAnim]
  );

  // Bilgileri Kaydet
  const handleSave = async () => {
    Keyboard.dismiss();
    if (!user) return;

    // Hedef Kilo henüz veritabanında aktif değilse hata fırlat / uyar
    if (formTargetWeight.trim()) {
      Alert.alert(
        'Veritabanı Hatası',
        'Hedef kilo alanı henüz veritabanında tanımlı değil. Lütfen bu alanı boş bırakın.'
      );
      return;
    }

    try {
      await updateProfile({
        username: user.username,
        gender: formGender,
        age: formAge ? parseInt(formAge, 10) : null,
        height: formHeight ? parseFloat(formHeight) : null,
        weight: formWeight ? parseFloat(formWeight) : null,
        fitness_level: formFitnessLevel,
        goal: formGoal,
        days_per_week: formDaysPerWeek,
        session_time_mins: formSessionTimeMins,
      });
      closeSheet();
      Alert.alert('Başarılı', 'Kişisel bilgileriniz güncellendi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Bilgiler kaydedilemedi.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ─── Üst Başlık & Aksiyon Çubuğu (Düzenle Butonu Korunuyor) ─── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={10}
        >
          <BackIcon size={20} color="#F8FAFC" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Kişisel Bilgiler</Text>

        <TouchableOpacity
          style={styles.editActionBtn}
          onPress={openEditModal}
          activeOpacity={0.7}
        >
          <EditPencilIcon size={16} color={colors.purpleLight} />
          <Text style={styles.editActionText}>Düzenle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── En Üst Kullanıcı Kartı (Avatar, İsim, E-posta, Düzenle) ─── */}
        <Card style={styles.topUserCard}>
          <View style={styles.topAvatarCircle}>
            <Svg width={52} height={52} viewBox="0 0 52 52" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#8B5CF6" />
                  <Stop offset="100%" stopColor="#06B6D4" />
                </LinearGradient>
              </Defs>
              <Circle cx="26" cy="26" r="26" fill="url(#avatarGrad)" />
            </Svg>
            <Text style={styles.topAvatarText}>
              {(user?.username || 'T').charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.topUserInfo}>
            <View style={styles.topNameRow}>
              <Text style={styles.topUsername}>{user?.username || 'Turan'}</Text>
              <CheckBadgeSolidIcon size={16} color="#10B981" />
            </View>
            <Text style={styles.topEmail}>{user?.email || 'turanaskerov2004@gmail.com'}</Text>
          </View>

          <TouchableOpacity
            style={styles.topCardEditBtn}
            onPress={openEditModal}
            activeOpacity={0.7}
            hitSlop={12}
          >
            <SimplePencilIcon size={18} color="#94A3B8" />
          </TouchableOpacity>
        </Card>

        {/* 1. BÖLÜM: TEMEL BİLGİLER */}
        <Text style={styles.sectionHeaderTitle}>TEMEL BİLGİLER</Text>
        <Card style={styles.cardBox}>
          {/* Ad Soyad */}
          <View style={styles.infoRow}>
            <View style={styles.leftInfoWrap}>
              <View style={[styles.roundIconBox, styles.purpleRoundIcon]}>
                <UserMiniIcon size={18} color={colors.purpleLight} />
              </View>
              <Text style={styles.rowLabel}>Ad Soyad</Text>
            </View>
            <Text style={styles.rowValue}>{user?.username || 'Turan'}</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Yaş */}
          <View style={styles.infoRow}>
            <View style={styles.leftInfoWrap}>
              <View style={[styles.roundIconBox, styles.cyanRoundIcon]}>
                <CalendarIcon size={18} color={colors.cyan} />
              </View>
              <Text style={styles.rowLabel}>Yaş</Text>
            </View>
            <Text style={styles.rowValue}>{age || 22} yaş</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Cinsiyet */}
          <View style={styles.infoRow}>
            <View style={styles.leftInfoWrap}>
              <View style={[styles.roundIconBox, styles.purpleRoundIcon]}>
                {gender === 'female' ? (
                  <FemaleIcon size={18} color={colors.pinkLight} />
                ) : (
                  <MaleIcon size={18} color={colors.purpleLight} />
                )}
              </View>
              <Text style={styles.rowLabel}>Cinsiyet</Text>
            </View>
            <Text style={styles.rowValue}>{gender === 'female' ? 'Kadın' : 'Erkek'}</Text>
          </View>
        </Card>

        {/* 2. BÖLÜM: VÜCUT ÖLÇÜMLERİ */}
        <Text style={styles.sectionHeaderTitle}>VÜCUT ÖLÇÜMLERİ</Text>
        <View style={styles.threeColsRow}>
          {/* Boy Kartı */}
          <Card style={styles.measureCard}>
            <View style={[styles.measureIconCircle, styles.cyanRoundIcon]}>
              <RulerIcon size={20} color={colors.cyan} />
            </View>
            <Text style={styles.measureLabel}>Boy</Text>
            <Text style={styles.measureValue}>{height || 180} cm</Text>
          </Card>

          {/* Kilo Kartı */}
          <Card style={styles.measureCard}>
            <View style={[styles.measureIconCircle, styles.emeraldRoundIcon]}>
              <WeightBoxIcon size={20} color={colors.emeraldLight} />
            </View>
            <Text style={styles.measureLabel}>Kilo</Text>
            <Text style={styles.measureValue}>{weight || 80} kg</Text>
          </Card>

          {/* Hedef Kilo Kartı */}
          <Card style={styles.measureCard}>
            <View style={[styles.measureIconCircle, styles.amberRoundIcon]}>
              <TargetIcon size={20} color={colors.amberLight} />
            </View>
            <Text style={styles.measureLabel}>Hedef Kilo</Text>
            <Text style={styles.measureValue}>
              {user?.target_weight ? `${user.target_weight} kg` : '--'}
            </Text>
          </Card>
        </View>

        {/* Son Ölçüm Tarihi Alt Yazısı */}
        <View style={styles.lastMeasurementRow}>
          <ClockIcon size={13} color={colors.textDim} />
          <Text style={styles.lastMeasurementText}>Son ölçüm: {formatTrDate(new Date())}</Text>
        </View>

        {/* 3. BÖLÜM: ANTRENMAN PROFİLİ */}
        <Text style={styles.sectionHeaderTitle}>ANTRENMAN PROFİLİ</Text>
        <Card style={styles.cardBox}>
          {/* Ana Hedef */}
          <View style={styles.infoRow}>
            <View style={styles.leftInfoWrap}>
              <View style={[styles.roundIconBox, styles.purpleRoundIcon]}>
                <TargetIcon size={18} color={colors.purpleLight} />
              </View>
              <Text style={styles.rowLabel}>Ana hedef</Text>
            </View>
            <Text style={styles.rowValue}>{user?.goal ? formatGoal(user.goal) : 'Kas geliştirme'}</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Seviye */}
          <View style={styles.infoRow}>
            <View style={styles.leftInfoWrap}>
              <View style={[styles.roundIconBox, styles.cyanRoundIcon]}>
                <DumbbellIcon size={18} color={colors.cyan} />
              </View>
              <Text style={styles.rowLabel}>Seviye</Text>
            </View>
            <Text style={styles.rowValue}>
              {user?.fitness_level ? formatFitnessLevel(user.fitness_level) : 'İleri seviye'}
            </Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Haftalık Hedef */}
          <View style={styles.infoRow}>
            <View style={styles.leftInfoWrap}>
              <View style={[styles.roundIconBox, styles.emeraldRoundIcon]}>
                <CalendarIcon size={18} color={colors.emeraldLight} />
              </View>
              <Text style={styles.rowLabel}>Haftalık hedef</Text>
            </View>
            <Text style={styles.rowValue}>{user?.days_per_week || 4} antrenman</Text>
          </View>

          <View style={styles.rowDivider} />

          {/* Ortalama Süre */}
          <View style={styles.infoRow}>
            <View style={styles.leftInfoWrap}>
              <View style={[styles.roundIconBox, styles.amberRoundIcon]}>
                <ClockIcon size={18} color={colors.amberLight} />
              </View>
              <Text style={styles.rowLabel}>Ortalama süre</Text>
            </View>
            <Text style={styles.rowValue}>{user?.session_time_mins || 60} dakika</Text>
          </View>
        </Card>

        {/* 4. BÖLÜM: OTOMATİK ANALİZ */}
        <Text style={styles.sectionHeaderTitle}>OTOMATİK ANALİZ</Text>
        <View style={styles.twoColsRow}>
          {/* BMI Kartı */}
          <Card style={styles.analysisCardCol}>
            <View style={styles.analysisCardHeader}>
              <View style={[styles.analysisIconCircle, styles.emeraldRoundIcon]}>
                <HeartPulseIcon size={18} color={colors.emeraldLight} />
              </View>
              <Text style={styles.analysisCardLabel}>BMI</Text>
              <View style={styles.analysisCardRightCol}>
                <Text style={styles.analysisCardValue}>{bmi || '24,7'}</Text>
                <View style={styles.bmiBadge}>
                  <Text style={styles.bmiBadgeText}>{bmiCategory || 'Normal aralık'}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* BMR Kartı */}
          <Card style={styles.analysisCardCol}>
            <View style={styles.analysisCardHeader}>
              <View style={[styles.analysisIconCircle, styles.purpleRoundIcon]}>
                <FlameIcon size={18} color={colors.purpleLight} />
              </View>
              <Text style={styles.analysisCardLabel}>BMR</Text>
              <View style={styles.analysisCardRightCol}>
                <View style={styles.bmrValWrap}>
                  <Text style={styles.analysisCardValue}>{bmr || 1820}</Text>
                  <Text style={styles.bmrUnitText}>kcal/gün</Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Alt Bilgilendirme */}
        <Text style={styles.autoNoteText}>
          Boy, kilo, yaş ve cinsiyet bilgilerine göre otomatik hesaplanır. ⓘ
        </Text>
      </ScrollView>

      {/* ─── DÜZENLEME BOTTOM SHEET MODALI (SÜRÜKLENEBİLİR & NEON) ─── */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
        statusBarTranslucent
      >
        <View
          style={styles.modalRootContainer}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            const y = e.nativeEvent.layout.y;
            if (h > 0 && Math.abs(h - containerHeight) > 2) {
              setContainerHeight(h);
              setContainerY(y);
            }
          }}
        >
          {/* Dokunulduğunda Kapanan Karartılmış Arka Plan */}
          <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
            <Pressable
              style={styles.modalBackdropTap}
              onPress={() => {
                Keyboard.dismiss();
                closeSheet();
              }}
            />
          </Animated.View>

          {/* Sürükle Bırak Yapılabilir Yüzen Alt Panel */}
          <Animated.View
            style={[
              styles.modalSheet,
              {
                transform: [{ translateY: combinedTranslateY }],
              },
            ]}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h > 0 && Math.abs(h - sheetHeight) > 2) {
                setSheetHeight(h);
              }
            }}
          >
            {/* Sürükle Bırak Tutamaç Alanı (PanResponder) */}
            <View {...panResponder.panHandlers} style={styles.modalDragHandleZone}>
              <View style={styles.modalHandle} />
            </View>

            {/* Header (Aynı zamanda sürüklenebilir) */}
            <View style={styles.modalHeaderRow}>
              <View {...panResponder.panHandlers} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={styles.modalHeaderIconWrap}>
                  <EditPencilIcon size={18} color={colors.purpleLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Kişisel Bilgileri Düzenle</Text>
                  <Text style={styles.modalDesc}>
                    Aşağı sürükleyerek kapatabilirsiniz
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  closeSheet();
                }}
                style={styles.modalCloseButtonRed}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
              >
                <CloseIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Form Alanı (Küçük ekranlı veya yüksek klavyeli cihazlarda kaydırılabilir) */}
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 6 }}
            >
              {/* Menü açıkken dışarı dokunulduğunda menüyü kapatan ve arka planı koruyan görünmez kalkan */}
              {(activeDropdown !== null || isDurationOpen) && (
                <Pressable
                  style={[StyleSheet.absoluteFill, { zIndex: 100 }]}
                  onPress={() => {
                    if (activeDropdown !== null) closeDropdown();
                    if (isDurationOpen) closeDuration();
                  }}
                />
              )}

              {/* Cinsiyet Seçimi (Yumuşak Geçişli Animasyon) */}
              <Text style={styles.modalSubheading}>CİNSİYET</Text>
              <View style={styles.genderRow} pointerEvents={isMenuTouchGuard ? 'none' : 'auto'}>
                <Animated.View style={[styles.genderCard, { borderColor: maleBorderColor, backgroundColor: maleBgColor }]}>
                  <TouchableOpacity
                    style={styles.genderCardInner}
                    onPress={() => selectGender('male')}
                    activeOpacity={0.8}
                  >
                    <MaleIcon size={20} color={formGender === 'male' ? colors.cyan : colors.textMuted} />
                    <Animated.Text style={[styles.genderText, { color: maleTextColor, fontWeight: formGender === 'male' ? '800' : '700' }]}>
                      Erkek
                    </Animated.Text>
                    {formGender === 'male' && <CheckCircleFill size={16} color={colors.cyan} />}
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.genderCard, { borderColor: femaleBorderColor, backgroundColor: femaleBgColor }]}>
                  <TouchableOpacity
                    style={styles.genderCardInner}
                    onPress={() => selectGender('female')}
                    activeOpacity={0.8}
                  >
                    <FemaleIcon size={20} color={formGender === 'female' ? colors.pinkLight : colors.textMuted} />
                    <Animated.Text style={[styles.genderText, { color: femaleTextColor, fontWeight: formGender === 'female' ? '800' : '700' }]}>
                      Kadın
                    </Animated.Text>
                    {formGender === 'female' && <CheckCircleFill size={16} color={colors.pinkLight} />}
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Yaş, Boy, Kilo Kutuları */}
              <Text style={styles.modalSubheading}>BİYOMETRİK ÖLÇÜMLER</Text>
              <View style={styles.metricInputRow} pointerEvents={isMenuTouchGuard ? 'none' : 'auto'}>
                {/* Yaş Input */}
                <View style={styles.metricInputCol}>
                  <View style={styles.inputLabelRow}>
                    <View style={[styles.inputNeonDot, { backgroundColor: colors.amber }]} />
                    <Text style={[styles.label, { color: colors.amberLight }]}>Yaş</Text>
                    <Text style={styles.labelUnit}>(yıl)</Text>
                  </View>
                  <TextInput
                    style={[styles.metricTextInput, styles.inputAmber]}
                    value={formAge}
                    onChangeText={setFormAge}
                    keyboardType="number-pad"
                    placeholder="24"
                    placeholderTextColor={colors.textDim}
                    maxLength={3}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>

                {/* Boy Input */}
                <View style={styles.metricInputCol}>
                  <View style={styles.inputLabelRow}>
                    <View style={[styles.inputNeonDot, { backgroundColor: colors.cyan }]} />
                    <Text style={[styles.label, { color: colors.cyan }]}>Boy</Text>
                    <Text style={styles.labelUnit}>(cm)</Text>
                  </View>
                  <TextInput
                    style={[styles.metricTextInput, styles.inputCyan]}
                    value={formHeight}
                    onChangeText={setFormHeight}
                    keyboardType="decimal-pad"
                    placeholder="178"
                    placeholderTextColor={colors.textDim}
                    maxLength={5}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>

                {/* Kilo Input */}
                <View style={styles.metricInputCol}>
                  <View style={styles.inputLabelRow}>
                    <View style={[styles.inputNeonDot, { backgroundColor: colors.emerald }]} />
                    <Text style={[styles.label, { color: colors.emeraldLight }]}>Kilo</Text>
                    <Text style={styles.labelUnit}>(kg)</Text>
                  </View>
                  <TextInput
                    style={[styles.metricTextInput, styles.inputEmerald]}
                    value={formWeight}
                    onChangeText={setFormWeight}
                    keyboardType="decimal-pad"
                    placeholder="76.5"
                    placeholderTextColor={colors.textDim}
                    maxLength={5}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
              </View>

              {/* Hedef Kilo Input (Altyapı hazırlandı, DB aktif olana kadar uyarılı) */}
              <View style={styles.targetWeightInputWrap} pointerEvents={isMenuTouchGuard ? 'none' : 'auto'}>
                <View style={styles.inputLabelRow}>
                  <View style={[styles.inputNeonDot, { backgroundColor: colors.amber }]} />
                  <Text style={[styles.label, { color: colors.amberLight }]}>Hedef Kilo</Text>
                  <Text style={styles.labelUnit}>(kg - Henüz veritabanında aktif değil)</Text>
                </View>
                <TextInput
                  style={styles.targetWeightTextInput}
                  value={formTargetWeight}
                  onChangeText={setFormTargetWeight}
                  keyboardType="decimal-pad"
                  placeholder="Hedef kilonuzu girin (Örn: 75)"
                  placeholderTextColor={colors.textDim}
                  maxLength={5}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              {/* 3. BÖLÜM: ANTRENMAN TERCİHLERİ */}
              <Text style={styles.modalSubheading}>ANTRENMAN TERCİHLERİ</Text>

              {/* Ana Hedef & Antrenman Seviyesi Seçim Kutuları (2 Sütun) + Ön Plana YUKARI Açılan Liste */}
              <View style={{ position: 'relative', zIndex: 500, elevation: 30 }}>
                {/* Ana Hedef Ön Plana ve YUKARI Açılan Animasyonlu Liste */}
                {activeDropdown === 'goal' && (
                  <Animated.View style={[styles.dropdownFloatingOverlay, dropdownAnimatedStyle]}>
                    <View style={styles.dropdownFloatingHeader}>
                      <Text style={styles.dropdownHeaderTitle}>Hedefinizi Seçin</Text>
                      <ChevronUpIcon size={14} color={colors.cyan} />
                    </View>
                    <ScrollView
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      bounces={false}
                      style={styles.dropdownScrollView}
                      contentContainerStyle={{ paddingVertical: 2 }}
                    >
                      {GOAL_CHOICES.map((item, idx) => {
                        const isSelected = formGoal.toLowerCase() === item.key.toLowerCase();
                        return (
                          <React.Fragment key={item.key}>
                            <TouchableOpacity
                              style={[styles.dropdownMenuItem, isSelected && styles.dropdownMenuItemActive]}
                              onPress={() => {
                                setFormGoal(item.key);
                                closeDropdown();
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.dropdownMenuTitle, isSelected && { color: colors.cyan }]}>
                                  {item.label}
                                </Text>
                                <Text style={styles.dropdownMenuDesc}>{item.desc}</Text>
                              </View>
                              {isSelected && <CheckCircleFill size={16} color={colors.cyan} />}
                            </TouchableOpacity>
                            {idx < GOAL_CHOICES.length - 1 && <View style={styles.dropdownDivider} />}
                          </React.Fragment>
                        );
                      })}
                    </ScrollView>
                  </Animated.View>
                )}

                {/* Antrenman Seviyesi Ön Plana ve YUKARI Açılan Animasyonlu Liste */}
                {activeDropdown === 'level' && (
                  <Animated.View style={[styles.dropdownFloatingOverlay, dropdownAnimatedStyle]}>
                    <View style={styles.dropdownFloatingHeader}>
                      <Text style={styles.dropdownHeaderTitle}>Antrenman Seviyenizi Seçin</Text>
                      <ChevronUpIcon size={14} color={colors.cyan} />
                    </View>
                    <ScrollView
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      bounces={false}
                      style={styles.dropdownScrollView}
                      contentContainerStyle={{ paddingVertical: 2 }}
                    >
                      {LEVEL_CHOICES.map((item, idx) => {
                        const isSelected = formFitnessLevel.toLowerCase() === item.key.toLowerCase();
                        return (
                          <React.Fragment key={item.key}>
                            <TouchableOpacity
                              style={[styles.dropdownMenuItem, isSelected && styles.dropdownMenuItemActive]}
                              onPress={() => {
                                setFormFitnessLevel(item.key);
                                closeDropdown();
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.dropdownMenuTitle, isSelected && { color: colors.cyan }]}>
                                  {item.label}
                                </Text>
                                <Text style={styles.dropdownMenuDesc}>{item.desc}</Text>
                              </View>
                              {isSelected && <CheckCircleFill size={16} color={colors.cyan} />}
                            </TouchableOpacity>
                            {idx < LEVEL_CHOICES.length - 1 && <View style={styles.dropdownDivider} />}
                          </React.Fragment>
                        );
                      })}
                    </ScrollView>
                  </Animated.View>
                )}

                <View style={styles.prefTwoColsRow}>
                  {/* Ana Hedef Kutusu */}
                  <TouchableOpacity
                    style={[styles.prefBoxCol, activeDropdown === 'goal' && styles.prefBoxColActive]}
                    onPress={() => toggleDropdown('goal')}
                    activeOpacity={0.7}
                    disabled={isDurationOpen}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.prefBoxLabel}>Ana Hedef</Text>
                      <Text style={styles.prefBoxValue} numberOfLines={1}>
                        {formatGoal(formGoal)}
                      </Text>
                    </View>
                    {activeDropdown === 'goal' ? (
                      <ChevronUpIcon size={16} color={colors.cyan} />
                    ) : (
                      <ChevronDownIcon size={16} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>

                  {/* Antrenman Seviyesi Kutusu */}
                  <TouchableOpacity
                    style={[styles.prefBoxCol, activeDropdown === 'level' && styles.prefBoxColActive]}
                    onPress={() => toggleDropdown('level')}
                    activeOpacity={0.7}
                    disabled={isDurationOpen}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.prefBoxLabel}>Antrenman Seviyesi</Text>
                      <Text style={styles.prefBoxValue} numberOfLines={1}>
                        {formatFitnessLevel(formFitnessLevel)}
                      </Text>
                    </View>
                    {activeDropdown === 'level' ? (
                      <ChevronUpIcon size={16} color={colors.cyan} />
                    ) : (
                      <ChevronDownIcon size={16} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Haftalık Hedef (Haftalık Hedef Kartlarını Neon Mor Rengi İle Değiştir: 2, 3, 4, 5, 6) */}
              <Text style={styles.weeklyGoalLabel}>Haftalık hedef</Text>
              <View style={styles.weeklyDaysRow} pointerEvents={isMenuTouchGuard ? 'none' : 'auto'}>
                {[2, 3, 4, 5, 6].map((day) => {
                  const isSelected = formDaysPerWeek === day;
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayPillBtn, isSelected && styles.dayPillBtnPurpleActive]}
                      onPress={() => {
                        Keyboard.dismiss();
                        setFormDaysPerWeek(day);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dayPillText, isSelected && styles.dayPillTextPurpleActive]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 4. BÖLÜM: İSTEĞE BAĞLI BİLGİLER */}
              <Text style={styles.modalSubheading}>İSTEĞE BAĞLI BİLGİLER</Text>

              {/* Ortalama Süre: Üzerine basınca YUKARI VE ÖN PLANA açılan animasyonlu liste */}
              <View style={{ position: 'relative', zIndex: 600, elevation: 32 }}>
                {isDurationOpen && (
                  <Animated.View style={[styles.durationUpwardFloatingOverlay, durationAnimatedStyle]}>
                    <View style={styles.durationUpwardHeader}>
                      <Text style={styles.durationUpwardTitle}>Ortalama Seans Süresi Seçin</Text>
                      <ChevronUpIcon size={14} color={colors.cyan} />
                    </View>
                    <ScrollView
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      bounces={false}
                      style={styles.durationScrollView}
                      contentContainerStyle={{ paddingVertical: 2 }}
                    >
                      {[30, 45, 60, 75, 90, 120].map((mins, idx) => {
                        const isSelected = formSessionTimeMins === mins;
                        return (
                          <React.Fragment key={mins}>
                            <TouchableOpacity
                              style={[
                                styles.durationOptionRow,
                                isSelected && styles.durationOptionRowActive,
                              ]}
                              onPress={() => {
                                setFormSessionTimeMins(mins);
                                closeDuration();
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text
                                  style={[
                                    styles.durationOptionText,
                                    isSelected && styles.durationOptionTextActive,
                                  ]}
                                >
                                  {mins} dakika
                                </Text>
                                {mins === 60 && (
                                  <View style={styles.recBadge}>
                                    <Text style={styles.recBadgeText}>Önerilen</Text>
                                  </View>
                                )}
                              </View>
                              {isSelected && <CheckCircleFill size={16} color={colors.cyan} />}
                            </TouchableOpacity>
                            {idx < 5 && <View style={styles.dropdownDivider} />}
                          </React.Fragment>
                        );
                      })}
                    </ScrollView>
                  </Animated.View>
                )}

                {/* Ortalama Süre Tetikleyici Kartı */}
                <TouchableOpacity
                  style={[
                    styles.durationTriggerCard,
                    isDurationOpen && styles.durationTriggerCardActive,
                  ]}
                  onPress={toggleDuration}
                  activeOpacity={0.7}
                  disabled={activeDropdown !== null}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.durationTriggerLabel}>Ortalama antrenman süresi</Text>
                    <View style={styles.durationTriggerValueRow}>
                      <Text style={styles.durationTriggerMainVal}>{formSessionTimeMins} dk</Text>
                      <Text style={styles.durationTriggerHint}>
                        Önerileri kişiselleştirmek için kullanılır
                      </Text>
                    </View>
                  </View>
                  {isDurationOpen ? (
                    <ChevronUpIcon size={18} color={colors.cyan} />
                  ) : (
                    <ChevronDownIcon size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Aksiyon Butonu: YALNIZCA KAYDET (Eski şık neon transparan cam görünüm) */}
              <View style={styles.modalActionButtons} pointerEvents={isMenuTouchGuard ? 'none' : 'auto'}>
                <TouchableOpacity
                  style={[styles.neonSaveBtnOnly, isUpdatingProfile && { opacity: 0.65 }]}
                  onPress={handleSave}
                  activeOpacity={0.7}
                  disabled={isUpdatingProfile}
                >
                  <Text style={styles.neonSaveBtnText}>
                    {isUpdatingProfile ? 'Kaydediliyor...' : 'Kaydet'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Sonsuz Alt Uzantı Eteği (Pano yukarı kaydığında veya çekildiğinde alt sınırın görünmemesini sağlar) */}
            <View style={styles.sheetBottomExtension} pointerEvents="none" />
          </Animated.View>
        </View>
      </Modal>
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.purpleBg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  editActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  topUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1222',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 4,
  },
  topAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topAvatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  topUserInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  topNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topUsername: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  topCardEditBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  cardBox: {
    backgroundColor: '#0D1222',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  leftInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roundIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleRoundIcon: {
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  cyanRoundIcon: {
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  emeraldRoundIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  amberRoundIcon: {
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 10,
  },
  threeColsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  measureCard: {
    flex: 1,
    backgroundColor: '#0D1222',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  measureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  measureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  measureValue: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.2,
  },
  lastMeasurementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  lastMeasurementText: {
    fontSize: 12,
    color: colors.textDim,
  },
  twoColsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  analysisCardCol: {
    flex: 1,
    backgroundColor: '#0D1222',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  analysisCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginLeft: 8,
  },
  analysisCardRightCol: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
  },
  analysisCardValue: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.text,
  },
  bmiBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  bmiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.emeraldLight,
  },
  bmrValWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  bmrUnitText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
  },
  autoNoteText: {
    fontSize: 11.5,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  targetWeightInputWrap: {
    marginTop: 12,
  },
  targetWeightTextInput: {
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 13.5,
    fontWeight: '600',
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  modalRootContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalBackdropTap: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    backgroundColor: '#0C101C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: Dimensions.get('window').height * 0.86,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopColor: colors.purpleLight,
    shadowColor: colors.purple,
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
  modalDragHandleZone: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.purpleLight,
    shadowColor: colors.purpleLight,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalHeaderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.purpleBg,
    borderWidth: 1.5,
    borderColor: colors.purpleBorder,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  modalSubheading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  genderCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 8,
    width: '100%',
  },
  genderText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  metricInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricInputCol: {
    flex: 1,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  inputNeonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  labelUnit: {
    fontSize: 10,
    color: colors.textDim,
    fontWeight: '400',
  },
  metricTextInput: {
    backgroundColor: colors.itemBg,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    borderWidth: 1.5,
    textAlign: 'center',
  },
  inputAmber: {
    borderColor: 'rgba(245, 158, 11, 0.35)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  inputCyan: {
    borderColor: 'rgba(56, 189, 248, 0.35)',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  inputEmerald: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  /* ─── Antrenman Tercihleri & Seçiciler ─── */
  prefTwoColsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  prefBoxCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  prefBoxColActive: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  prefBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  prefBoxValue: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  dropdownFloatingOverlay: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    marginBottom: 8,
    maxHeight: 195,
    zIndex: 9999,
    elevation: 35,
    backgroundColor: '#0D1222',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
  },
  dropdownFloatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.cyan,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 2,
  },
  dropdownScrollView: {
    maxHeight: 145,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  dropdownMenuItemActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  dropdownMenuTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  dropdownMenuDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 1,
  },
  weeklyGoalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.purpleLight,
    marginTop: 14,
    marginBottom: 10,
  },
  weeklyDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayPillBtn: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillBtnPurpleActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  dayPillText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
  },
  dayPillTextPurpleActive: {
    color: '#C084FC',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },

  /* ─── Ortalama Süre (Yukarı ve Ön Plana Açılır Liste) ─── */
  durationUpwardFloatingOverlay: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    marginBottom: 8,
    maxHeight: 195,
    zIndex: 9999,
    elevation: 35,
    backgroundColor: '#0D1222',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
  },
  durationUpwardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  durationUpwardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.cyan,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  durationScrollView: {
    maxHeight: 145,
  },
  durationUpwardHint: {
    fontSize: 11,
    color: colors.textDim,
  },
  durationOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  durationOptionRowActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  durationOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  durationOptionTextActive: {
    fontWeight: '800',
    color: colors.cyan,
  },
  recBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
  durationTriggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  durationTriggerCardActive: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  durationTriggerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 2,
  },
  durationTriggerValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
  durationTriggerMainVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  durationTriggerHint: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.textDim,
  },

  /* ─── Aksiyon Butonları (Yalnızca Kaydet - Eski Transparan Cam Stili) ─── */
  modalActionButtons: {
    marginTop: 22,
    marginBottom: 10,
  },
  neonSaveBtnOnly: {
    width: '100%',
    height: 48,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonSaveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.3,
  },
});
