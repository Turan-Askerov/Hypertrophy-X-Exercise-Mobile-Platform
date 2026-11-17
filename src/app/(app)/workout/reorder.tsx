import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/ui/empty-state';
import { getSupersetTheme } from '@/constants/superset';
import { Radius, Spacing } from '@/constants/theme';
import { workoutDraft } from '@/lib/workout-draft';
import type { ExerciseEntry } from '@/types/workout';

// Kart yüksekliği (64) + Boşluk (10) = 74px
const CARD_HEIGHT = 64;
const CARD_GAP = 10;
const SLOT_HEIGHT = CARD_HEIGHT + CARD_GAP;

// ─── TEKİL KART BİLEŞENİ (Akıcı Pan & Spring Animasyonlu) ───
type ReorderCardItemProps = {
  entry: ExerciseEntry;
  index: number;
  isDragging: boolean;
  targetOffset: number;
  dragY: Animated.Value;
  dragScale: Animated.Value;
  onStartDrag: (index: number) => void;
  onMoveDrag: (dy: number) => void;
  onEndDrag: () => void;
  onDeletePress: (index: number, name: string) => void;
};

const ReorderCardItem = React.memo(function ReorderCardItem({
  entry,
  index,
  isDragging,
  targetOffset,
  dragY,
  dragScale,
  onStartDrag,
  onMoveDrag,
  onEndDrag,
  onDeletePress,
}: ReorderCardItemProps) {
  // Diğer kartların kayma animasyonu (React 19 useState pattern)
  const [offsetAnim] = useState(() => new Animated.Value(0));
  const supersetTheme = getSupersetTheme(entry.superset_id);

  useEffect(() => {
    if (!isDragging) {
      Animated.spring(offsetAnim, {
        toValue: targetOffset,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      offsetAnim.setValue(0);
    }
  }, [targetOffset, isDragging, offsetAnim]);

  // Hamburger tutamacı için PanResponder
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          onStartDrag(index);
        },
        onPanResponderMove: (_, gestureState) => {
          onMoveDrag(gestureState.dy);
        },
        onPanResponderRelease: () => {
          onEndDrag();
        },
        onPanResponderTerminate: () => {
          onEndDrag();
        },
      }),
    [index, onStartDrag, onMoveDrag, onEndDrag]
  );

  const cardStyle = isDragging
    ? {
        transform: [{ translateY: dragY }, { scale: dragScale }],
        zIndex: 999,
        elevation: 8,
        borderColor: '#C084FC',
        backgroundColor: '#161C32',
      }
    : {
        transform: [{ translateY: offsetAnim }],
        zIndex: 1,
        elevation: 0,
      };

  return (
    <Animated.View style={[styles.reorderCard, cardStyle]}>
      {/* EN SOL: Listeden Çıkarma Butonu (-) */}
      <TouchableOpacity
        style={styles.removeCircleBtn}
        onPress={() => onDeletePress(index, entry.exercise_name)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.75}
        accessibilityLabel={`${entry.exercise_name} hareketini çıkar`}
      >
        <Text style={styles.minusIcon}>—</Text>
      </TouchableOpacity>

      {/* SOL: Animasyonlu GIF / Görsel Çerçevesi (En Sol - Boş) */}
      <View style={styles.thumbnailFrame} />

      {/* ORTA: Egzersiz Bilgileri */}
      <View style={styles.itemInfo}>
        <Text style={styles.exerciseName} numberOfLines={1}>
          {entry.exercise_name}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.muscleBadge}>
            <Text style={styles.muscleText}>{entry.muscle_group}</Text>
          </View>
          {supersetTheme && (
            <View
              style={[
                styles.supersetBadge,
                {
                  backgroundColor: supersetTheme.bg,
                  borderColor: supersetTheme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.supersetBadgeText,
                  { color: supersetTheme.text },
                ]}
              >
                {supersetTheme.label}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* EN SAĞ: SADECE HAMBURGER SÜRÜKLEME TUTAMACI */}
      <View style={styles.dragHandleBox} {...panResponder.panHandlers}>
        <Text style={[styles.hamburgerIcon, isDragging && styles.hamburgerIconActive]}>
          ≡
        </Text>
      </View>
    </Animated.View>
  );
});

// ─── ANA SAYFA BİLEŞENİ ───
export default function ReorderExercisesScreen() {
  const router = useRouter();

  // workoutDraft'ı reaktif olarak dinle
  const draft = useSyncExternalStore(
    workoutDraft.subscribe,
    workoutDraft.getSnapshot
  );

  const exercises = draft.exercises;

  // Çıkarma onay modalı durumu
  const [deleteTarget, setDeleteTarget] = useState<{
    index: number;
    name: string;
  } | null>(null);

  // Sürükleme durumu: { draggingIndex, hoverIndex } veya null
  const [dragState, setDragState] = useState<{
    draggingIndex: number;
    hoverIndex: number;
  } | null>(null);

  // Sürüklenen kartın animasyon değerleri (React 19 useState pattern)
  const [dragY] = useState(() => new Animated.Value(0));
  const [dragScale] = useState(() => new Animated.Value(1));

  // Geri gitme
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)/workout');
    }
  };

  // Silme onaylama
  const handleConfirmDelete = () => {
    if (deleteTarget !== null) {
      workoutDraft.removeExercise(deleteTarget.index);
      setDeleteTarget(null);
    }
  };

  // ─── SÜRÜKLE - BIRAK HANDLER'LARI ───
  const handleStartDrag = useCallback(
    (index: number) => {
      dragY.setValue(0);
      setDragState({ draggingIndex: index, hoverIndex: index });

      Animated.spring(dragScale, {
        toValue: 1.04,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    },
    [dragY, dragScale]
  );

  const handleMoveDrag = useCallback(
    (dy: number) => {
      dragY.setValue(dy);

      setDragState((prev) => {
        if (!prev) return null;
        const slotShift = Math.round(dy / SLOT_HEIGHT);
        const newHover = Math.max(
          0,
          Math.min(exercises.length - 1, prev.draggingIndex + slotShift)
        );
        if (newHover !== prev.hoverIndex) {
          return { ...prev, hoverIndex: newHover };
        }
        return prev;
      });
    },
    [dragY, exercises.length]
  );

  const handleEndDrag = useCallback(() => {
    setDragState((current) => {
      if (!current) return null;

      const from = current.draggingIndex;
      const to = current.hoverIndex;
      const landingOffset = (to - from) * SLOT_HEIGHT;

      Animated.parallel([
        Animated.spring(dragY, {
          toValue: landingOffset,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(dragScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (from !== to) {
          const next = [...exercises];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          workoutDraft.reorderExercises(next);
        }

        dragY.setValue(0);
        dragScale.setValue(1);
        setDragState(null);
      });

      return current;
    });
  }, [dragY, dragScale, exercises]);

  const handleDeletePress = useCallback((index: number, name: string) => {
    setDeleteTarget({ index, name });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* ─── ÜST BAR: GERİ | YENİDEN SIRALA (BİTTİ BUTONU AŞAĞI TAŞINDI) ─── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleGoBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>Geri</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Yeniden Sırala</Text>
            <Text style={styles.headerSubtitle}>
              {exercises.length} Egzersiz
            </Text>
          </View>

          {/* Ortalamayı korumak için sağ dengeleme boşluğu */}
          <View style={styles.headerSpacer} />
        </View>

        {/* ─── BİLGİ İPUCU ─── */}
        <View style={styles.hintBanner}>
          <Text style={styles.hintText}>
            Sıralamak için sağdaki ≡ simgesinden tutup yukarı/aşağı sürükleyin; çıkarmak için eksiye (-) basın.
          </Text>
        </View>

        {/* ─── KARTLAR LİSTESİ ─── */}
        {exercises.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="Sıralanacak hareket yok"
              description="Antrenmanınızda henüz bir hareket bulunmuyor."
              actionLabel="Geri Dön"
              onAction={handleGoBack}
            />
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={dragState === null} // Sürüklerken ekran kaymasını kilitle
          >
            {exercises.map((entry: ExerciseEntry, index: number) => {
              const isDragging = dragState?.draggingIndex === index;

              // Bu kartın boşluk açmak için kayma miktarı
              let targetOffset = 0;
              if (dragState && !isDragging) {
                const { draggingIndex, hoverIndex } = dragState;
                if (draggingIndex < hoverIndex) {
                  // Aşağı sürükleniyor: aradaki kartlar YUKARI kayar
                  if (index > draggingIndex && index <= hoverIndex) {
                    targetOffset = -SLOT_HEIGHT;
                  }
                } else if (draggingIndex > hoverIndex) {
                  // Yukarı sürükleniyor: aradaki kartlar AŞAĞI kayar
                  if (index >= hoverIndex && index < draggingIndex) {
                    targetOffset = SLOT_HEIGHT;
                  }
                }
              }

              return (
                <ReorderCardItem
                  key={entry.exercise_id || `${entry.exercise_name}_${index}`}
                  entry={entry}
                  index={index}
                  isDragging={isDragging}
                  targetOffset={targetOffset}
                  dragY={dragY}
                  dragScale={dragScale}
                  onStartDrag={handleStartDrag}
                  onMoveDrag={handleMoveDrag}
                  onEndDrag={handleEndDrag}
                  onDeletePress={handleDeletePress}
                />
              );
            })}
          </ScrollView>
        )}

        {/* ─── EKRANIN ALTINA TAŞINAN BİTTİ BUTONU (YAPIŞKAN ALT BAR) ─── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.doneBtnBottom}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnTextBottom}>Bitti</Text>
          </TouchableOpacity>
        </View>

        {/* ─── EKRANIN ORTASINDA ONAY PANOSU (MODAL) ─── */}
        <Modal
          visible={deleteTarget !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteTarget(null)}
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setDeleteTarget(null)}
            />

            <View style={styles.modalCard}>
              <View style={styles.modalIconBox}>
                <Text style={styles.modalAlertIcon}>!</Text>
              </View>

              <Text style={styles.modalTitle}>Hareketi Çıkar</Text>
              <Text style={styles.modalMessage}>
                <Text style={styles.modalHighlight}>
                  {deleteTarget?.name}
                </Text>{' '}
                hareketi antrenmanınızdan çıkarılsın mı? Girilen setler silinecektir.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setDeleteTarget(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Vazgeç</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleConfirmDelete}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalConfirmText}>Çıkar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0C101D',
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  headerTitleWrap: {
    alignItems: 'center',
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A855F7',
  },
  headerSpacer: {
    width: 44,
  },
  hintBanner: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.15)',
  },
  hintText: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.three,
    gap: CARD_GAP,
    paddingBottom: 20,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  reorderCard: {
    height: CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1322',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    paddingHorizontal: 12,
    gap: 10,
  },
  removeCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.2,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minusIcon: {
    fontSize: 14,
    color: '#F87171',
    fontWeight: '900',
    lineHeight: 16,
  },
  thumbnailFrame: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#101424',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    overflow: 'hidden',
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  exerciseName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  muscleBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  muscleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C084FC',
  },
  supersetBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.16)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  supersetBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F472B6',
  },
  dragHandleBox: {
    width: 48,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: '800',
  },
  hamburgerIconActive: {
    color: '#C084FC',
  },
  // Ekran Altındaki Bitti Butonu
  bottomBar: {
    backgroundColor: '#0C101D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: Spacing.four,
    paddingTop: 12,
    paddingBottom: 16,
  },
  doneBtnBottom: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderWidth: 1.5,
    borderColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnTextBottom: {
    fontSize: 15,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 0.3,
  },
  // Ortadaki Onay Modalı
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0D111E',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    padding: Spacing.four,
    alignItems: 'center',
    gap: 12,
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAlertIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EF4444',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalHighlight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F87171',
  },
});
