import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type KeyboardEvent,
  type ScrollViewInstance,
  type ViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type FormFieldScrollContextValue = {
  notifyFieldFocus: (wrapperRef: RefObject<ViewInstance | null>) => void;
};

const FormFieldScrollContext = createContext<FormFieldScrollContextValue | null>(null);

export function useFormFieldScroll() {
  return useContext(FormFieldScrollContext);
}

type Props = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  headerElement?: ReactNode;
};

export function FormScreen({ title, subtitle, children, headerElement }: Props) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const scrollContainerRef = useRef<ViewInstance>(null);
  const scrollOffsetRef = useRef(0);
  const restingScrollHRef = useRef(0);
  const kbHeightRef = useRef(0);
  const kbTopRef = useRef<number | null>(null);
  const activeFieldRef = useRef<RefObject<ViewInstance | null> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [keyboardPadBottom, setKeyboardPadBottom] = useState(0);

  const scrollFieldIntoView = useCallback(
    (fieldRef: RefObject<ViewInstance | null> | null, kbTop: number) => {
      if (!fieldRef?.current || !scrollRef.current) return;
      fieldRef.current.measureInWindow((_x, fieldY, _w, fieldHeight) => {
        if (fieldHeight <= 0) return;
        const clearance = 24;
        const fieldBottom = fieldY + fieldHeight;
        const overlap = fieldBottom + clearance - kbTop;
        if (overlap > 0) {
          scrollRef.current?.scrollTo({
            y: Math.max(0, scrollOffsetRef.current + overlap),
            animated: true,
          });
        } else if (fieldY < 60) {
          scrollRef.current?.scrollTo({
            y: Math.max(0, scrollOffsetRef.current + fieldY - 60),
            animated: true,
          });
        }
      });
    },
    [],
  );

  const scheduleScrollIntoView = useCallback(
    (fieldRef: RefObject<ViewInstance | null> | null, kbTop: number, delayMs: number) => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      scrollTimerRef.current = setTimeout(() => {
        scrollTimerRef.current = null;
        scrollFieldIntoView(fieldRef, kbTop);
      }, delayMs);
    },
    [scrollFieldIntoView],
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      const kbHeight = event.endCoordinates.height;
      kbHeightRef.current = kbHeight;
      const windowHeight = Dimensions.get('window').height;
      const rawScreenY = event.endCoordinates.screenY;

      if (Platform.OS === 'ios') {
        const kbTop = rawScreenY > 0 ? rawScreenY : windowHeight - kbHeight;
        kbTopRef.current = kbTop;
        setKeyboardPadBottom(24);
        if (activeFieldRef.current) {
          scheduleScrollIntoView(activeFieldRef.current, kbTop, 80);
        }
        return;
      }

      scrollContainerRef.current?.measureInWindow((_x, scrollY, _w, scrollH) => {
        const scrollBottom = scrollY + scrollH;
        const alreadyResizedByOS =
          restingScrollHRef.current > 0 && restingScrollHRef.current - scrollH >= kbHeight * 0.5;

        let kbTop: number;
        if (alreadyResizedByOS) {
          kbTop = rawScreenY > 0 ? Math.min(rawScreenY, scrollBottom) : scrollBottom;
          setKeyboardPadBottom(24);
        } else {
          kbTop =
            rawScreenY > 0 && rawScreenY < scrollBottom ? rawScreenY : scrollBottom - kbHeight;
          const coveredBottom = Math.max(0, scrollBottom - kbTop);
          setKeyboardPadBottom(coveredBottom + 24);
        }

        kbTopRef.current = kbTop;
        if (activeFieldRef.current) {
          scheduleScrollIntoView(activeFieldRef.current, kbTop, 80);
        }
      });
    };

    const onHide = () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
      kbHeightRef.current = 0;
      kbTopRef.current = null;
      setKeyboardPadBottom(0);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      showSub.remove();
      hideSub.remove();
    };
  }, [scheduleScrollIntoView]);

  const notifyFieldFocus = useCallback(
    (wrapperRef: RefObject<ViewInstance | null>) => {
      activeFieldRef.current = wrapperRef;
      if (kbTopRef.current !== null) {
        scheduleScrollIntoView(wrapperRef, kbTopRef.current, 60);
      }
    },
    [scheduleScrollIntoView],
  );

  const contextValue = useMemo(() => ({ notifyFieldFocus }), [notifyFieldFocus]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          ref={scrollContainerRef}
          collapsable={false}
          style={styles.flex}
          onLayout={(e) => {
            if (kbHeightRef.current === 0) {
              restingScrollHRef.current = e.nativeEvent.layout.height;
            }
          }}
        >
          <FormFieldScrollContext.Provider value={contextValue}>
            <ScrollView
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={[
                styles.content,
                keyboardPadBottom > 0 ? { paddingBottom: keyboardPadBottom } : null,
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={(e) => {
                scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
              }}
            >
              {headerElement}
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              {children}
            </ScrollView>
          </FormFieldScrollContext.Provider>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#080B14',
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E99AF',
    marginBottom: 24,
    lineHeight: 20,
  },
});
