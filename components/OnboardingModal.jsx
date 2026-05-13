import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@moneylog_onboarding_done';

// ─── Slide 1: Category Bank demo ─────────────────────────────────────────────

const DEFAULT_CATS = [
  { name: 'Entertainment',  icon: 'game-controller-outline', color: '#6BCB77' },
  { name: 'Gifts',          icon: 'gift-outline',            color: '#FF6BD6' },
  { name: 'Groceries',      icon: 'cart-outline',            color: '#4D96FF' },
  { name: 'Health/Medical', icon: 'medkit-outline',          color: '#4ECDC4' },
  { name: 'Home',           icon: 'home-outline',            color: '#45B7D1' },
];
const NEW_CAT = { name: 'Transportation', icon: 'car-outline', color: '#96CEB4' };
const TYPE_WORD = 'Transportation';

function CategoryBankSlide({ t, active }) {
  const [phase, setPhase]     = useState(0); // 0: idle  1: typing  2: added
  const [typedText, setTyped] = useState('');

  const inputFade  = useRef(new Animated.Value(0)).current;
  const newCatAnim = useRef(new Animated.Value(0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;

  const t1Ref   = useRef(null);
  const t2Ref   = useRef(null);
  const t3Ref   = useRef(null);
  const t4Ref   = useRef(null);
  const ivRef   = useRef(null);
  const blinkRef = useRef(null);

  const clearAll = useCallback(() => {
    clearTimeout(t1Ref.current);
    clearTimeout(t2Ref.current);
    clearTimeout(t3Ref.current);
    clearTimeout(t4Ref.current);
    clearInterval(ivRef.current);
    blinkRef.current?.stop();
  }, []);

  const resetAndPlay = useCallback(() => {
    clearAll();
    setPhase(0);
    setTyped('');
    inputFade.setValue(0);
    newCatAnim.setValue(0);
    cursorAnim.setValue(1);

    // Blinking cursor
    blinkRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blinkRef.current.start();

    // Phase 1: show modal and start typing after 1.2s
    t1Ref.current = setTimeout(() => {
      setPhase(1);
      Animated.timing(inputFade, { toValue: 1, duration: 350, useNativeDriver: true }).start();

      let i = 0;
      ivRef.current = setInterval(() => {
        i++;
        setTyped(TYPE_WORD.slice(0, i));

        if (i === TYPE_WORD.length) {
          clearInterval(ivRef.current);
          blinkRef.current?.stop();
          cursorAnim.setValue(0);

          // Phase 2: wait, then fade modal out
          t2Ref.current = setTimeout(() => {
            Animated.timing(inputFade, { toValue: 0, duration: 300, useNativeDriver: true }).start();

            // Phase 3: slide new category in
            t3Ref.current = setTimeout(() => {
              setPhase(2);
              Animated.spring(newCatAnim, {
                toValue: 1, tension: 90, friction: 10, useNativeDriver: true,
              }).start();

              // Loop
              t4Ref.current = setTimeout(resetAndPlay, 2500);
            }, 350);
          }, 1000);
        }
      }, 100);
    }, 1200);
  }, [clearAll]);

  useEffect(() => {
    if (!active) { clearAll(); return; }
    resetAndPlay();
    return clearAll;
  }, [active]);

  const catCount = phase >= 2 ? DEFAULT_CATS.length + 1 : DEFAULT_CATS.length;

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={[sl.header]}>
        <View>
          <Text style={[sl.screenTitle, { color: t.text }]}>Category Bank</Text>
          <Text style={[sl.screenSub, { color: t.muted }]}>{catCount} categories</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={[sl.circleBtn, { borderColor: '#FF3B30' }]}>
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          </View>
          <View style={[sl.circleBtn, { borderColor: '#5C5CFF' }]}>
            <Ionicons name="add" size={18} color="#5C5CFF" />
          </View>
        </View>
      </View>

      {/* Search bar */}
      <View style={[sl.searchBar, { backgroundColor: t.field }]}>
        <Ionicons name="search-outline" size={15} color={t.muted} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 14, color: t.muted }}>Search categories...</Text>
      </View>

      {/* Category list */}
      <View style={[sl.listCard, { backgroundColor: t.card }]}>
        {DEFAULT_CATS.map((cat, i) => (
          <View
            key={cat.name}
            style={[sl.catRow, i < DEFAULT_CATS.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.divider }]}
          >
            <View style={[sl.catIcon, { backgroundColor: cat.color + '22' }]}>
              <Ionicons name={cat.icon} size={16} color={cat.color} />
            </View>
            <Text style={[sl.catName, { color: t.text }]}>{cat.name}</Text>
            <View style={[sl.badge, { backgroundColor: t.field }]}>
              <Text style={[sl.badgeText, { color: '#5C5CFF' }]}>Default</Text>
            </View>
          </View>
        ))}

        {/* New category slides in */}
        <Animated.View style={{
          opacity: newCatAnim,
          transform: [{
            translateY: newCatAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }),
          }],
          overflow: 'hidden',
        }}>
          <View style={[sl.catRow, { borderTopWidth: 1, borderTopColor: t.divider }]}>
            <View style={[sl.catIcon, { backgroundColor: NEW_CAT.color + '22' }]}>
              <Ionicons name={NEW_CAT.icon} size={16} color={NEW_CAT.color} />
            </View>
            <Text style={[sl.catName, { color: t.text }]}>{NEW_CAT.name}</Text>
          </View>
        </Animated.View>
      </View>

      {/* Modal overlay */}
      <Animated.View style={[sl.modalOverlay, { opacity: inputFade }]} pointerEvents="none">
        <View style={[sl.modalSheet, { backgroundColor: t.card, borderColor: t.field }]}>
          <Text style={[sl.modalTitle, { color: t.text }]}>New Category</Text>
          <View style={[sl.modalInput, { backgroundColor: t.field, borderColor: t.divider }]}>
            <Text style={[sl.modalInputText, { color: t.text }]}>
              {typedText}<Animated.Text style={{ opacity: cursorAnim, color: '#5C5CFF' }}>|</Animated.Text>
            </Text>
          </View>
          <View style={sl.modalBtns}>
            <View style={sl.modalCancel}>
              <Text style={[sl.modalCancelText, { color: t.muted }]}>Cancel</Text>
            </View>
            <View style={[sl.modalConfirm, { opacity: typedText.length > 0 ? 1 : 0.35 }]}>
              <Text style={sl.modalConfirmText}>Confirm</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Slide 2: Logs demo ───────────────────────────────────────────────────────

const MOCK_LOGS = [
  { title: 'May 2026',    amount: '$1,820.50', date: 'May 2026',  active: true  },
  { title: 'Europe Tour', amount: '$5,610.75', date: 'Jan 2026',  active: false },
];
const NEW_LOG       = { title: 'Japan Trip', amount: '$0.00', date: 'Mar 2026', active: false };
const LOG_TYPE_WORD = 'Japan Trip';

function LogsSlide({ t, active }) {
  const [phase, setPhase]     = useState(0);
  const [typedText, setTyped] = useState('');

  const inputFade  = useRef(new Animated.Value(0)).current;
  const newLogAnim = useRef(new Animated.Value(0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;

  const t1Ref    = useRef(null);
  const t2Ref    = useRef(null);
  const t3Ref    = useRef(null);
  const t4Ref    = useRef(null);
  const ivRef    = useRef(null);
  const blinkRef = useRef(null);

  const clearAll = useCallback(() => {
    clearTimeout(t1Ref.current);
    clearTimeout(t2Ref.current);
    clearTimeout(t3Ref.current);
    clearTimeout(t4Ref.current);
    clearInterval(ivRef.current);
    blinkRef.current?.stop();
  }, []);

  const resetAndPlay = useCallback(() => {
    clearAll();
    setPhase(0);
    setTyped('');
    inputFade.setValue(0);
    newLogAnim.setValue(0);
    cursorAnim.setValue(1);

    blinkRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blinkRef.current.start();

    t1Ref.current = setTimeout(() => {
      setPhase(1);
      Animated.timing(inputFade, { toValue: 1, duration: 350, useNativeDriver: true }).start();

      let i = 0;
      ivRef.current = setInterval(() => {
        i++;
        setTyped(LOG_TYPE_WORD.slice(0, i));
        if (i === LOG_TYPE_WORD.length) {
          clearInterval(ivRef.current);
          blinkRef.current?.stop();
          cursorAnim.setValue(0);

          t2Ref.current = setTimeout(() => {
            Animated.timing(inputFade, { toValue: 0, duration: 300, useNativeDriver: true }).start();
            t3Ref.current = setTimeout(() => {
              setPhase(2);
              Animated.spring(newLogAnim, {
                toValue: 1, tension: 90, friction: 10, useNativeDriver: true,
              }).start();
              t4Ref.current = setTimeout(resetAndPlay, 2500);
            }, 350);
          }, 1000);
        }
      }, 100);
    }, 1200);
  }, [clearAll]);

  useEffect(() => {
    if (!active) { clearAll(); return; }
    resetAndPlay();
    return clearAll;
  }, [active]);

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={sl.header}>
        <View>
          <Text style={[sl.screenTitle, { color: t.text }]}>Logs</Text>
          <Text style={[sl.screenSub, { color: t.muted }]}>{phase >= 2 ? 3 : 2} logs</Text>
        </View>
        <View style={[sl.circleBtn, { borderColor: '#5C5CFF' }]}>
          <Ionicons name="add" size={18} color="#5C5CFF" />
        </View>
      </View>

      {/* Search bar */}
      <View style={[sl.searchBar, { backgroundColor: t.field }]}>
        <Ionicons name="search-outline" size={15} color={t.muted} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 14, color: t.muted }}>Search</Text>
      </View>

      {/* New log slides in */}
      <Animated.View style={{
        opacity: newLogAnim,
        transform: [{ translateY: newLogAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
      }}>
        <View style={[sl.logCard, { backgroundColor: t.card, borderLeftColor: t.field }]}>
          <View style={{ flex: 1 }}>
            <Text style={[sl.logTitle, { color: t.text }]}>{NEW_LOG.title}</Text>
            <Text style={[sl.logDate,  { color: t.muted }]}>{NEW_LOG.date}</Text>
          </View>
          <Text style={[sl.logAmt, { color: t.text }]}>{NEW_LOG.amount}</Text>
        </View>
      </Animated.View>

      {/* Existing logs */}
      {MOCK_LOGS.map((log) => (
        <View key={log.title} style={[sl.logCard, { backgroundColor: t.card, borderLeftColor: log.active ? '#5C5CFF' : t.field }]}>
          <View style={{ flex: 1 }}>
            <Text style={[sl.logTitle, { color: t.text }]}>{log.title}</Text>
            <Text style={[sl.logDate,  { color: t.muted }]}>{log.date}</Text>
          </View>
          <Text style={[sl.logAmt, { color: t.text }]}>{log.amount}</Text>
        </View>
      ))}

      {/* Modal overlay — matches screen2 MB style */}
      <Animated.View style={[sl.modalOverlay, { opacity: inputFade }]} pointerEvents="none">
        <View style={[sl.logModalCard, { backgroundColor: t.card, borderColor: t.divider }]}>
          <View style={[sl.logIconWrap, { backgroundColor: t.field }]}>
            <Ionicons name="document-text-outline" size={28} color="#5C5CFF" />
          </View>
          <Text style={[sl.logModalTitle, { color: t.text }]}>New Log</Text>
          <View style={[sl.logModalInput, { backgroundColor: t.field, borderColor: t.divider }]}>
            <Text style={[sl.logModalInputText, { color: t.text }]}>
              {typedText}<Animated.Text style={{ opacity: cursorAnim, color: '#5C5CFF' }}>|</Animated.Text>
            </Text>
          </View>
          <View style={[sl.logModalBtn]}>
            <Text style={sl.logModalBtnText}>Next</Text>
          </View>
          <Text style={[sl.logModalCancel, { color: t.muted }]}>Cancel</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Slide 3: Spend demo ─────────────────────────────────────────────────────

const MOCK_SPEND_CATS = [
  { name: 'Groceries',      icon: 'cart-outline',            color: '#4D96FF', amount: 450.25 },
  { name: 'Transportation', icon: 'car-outline',             color: '#96CEB4', amount: 280.00 },
  { name: 'Entertainment',  icon: 'game-controller-outline', color: '#6BCB77', amount: 125.00 },
];
const SPEND_DESC_WORD = 'Coffee & snacks';

function SpendSlide({ t, active }) {
  const [phase, setPhase]         = useState(0);
  const [typedText, setTyped]     = useState('');
  const [logFlashed, setFlashed]  = useState(false);
  const [grocAmt, setGrocAmt]     = useState(450.25);

  const formFade   = useRef(new Animated.Value(0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;

  const t1Ref    = useRef(null);
  const t2Ref    = useRef(null);
  const t3Ref    = useRef(null);
  const t4Ref    = useRef(null);
  const t5Ref    = useRef(null);
  const ivRef    = useRef(null);
  const blinkRef = useRef(null);

  const clearAll = useCallback(() => {
    clearTimeout(t1Ref.current);
    clearTimeout(t2Ref.current);
    clearTimeout(t3Ref.current);
    clearTimeout(t4Ref.current);
    clearTimeout(t5Ref.current);
    clearInterval(ivRef.current);
    blinkRef.current?.stop();
  }, []);

  const resetAndPlay = useCallback(() => {
    clearAll();
    setPhase(0);
    setTyped('');
    setFlashed(false);
    setGrocAmt(450.25);
    formFade.setValue(0);
    cursorAnim.setValue(1);

    blinkRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blinkRef.current.start();

    t1Ref.current = setTimeout(() => {
      setPhase(1);
      Animated.timing(formFade, { toValue: 1, duration: 350, useNativeDriver: true }).start();

      let i = 0;
      ivRef.current = setInterval(() => {
        i++;
        setTyped(SPEND_DESC_WORD.slice(0, i));
        if (i === SPEND_DESC_WORD.length) {
          clearInterval(ivRef.current);
          blinkRef.current?.stop();
          cursorAnim.setValue(0);

          // Flash LOG button, update groceries, clear form
          t2Ref.current = setTimeout(() => {
            setFlashed(true);
            t3Ref.current = setTimeout(() => {
              setFlashed(false);
              setGrocAmt(465.25);
              Animated.timing(formFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                setTyped('');
                setPhase(2);
              });
              t4Ref.current = setTimeout(resetAndPlay, 2500);
            }, 220);
          }, 800);
        }
      }, 100);
    }, 1200);
  }, [clearAll]);

  useEffect(() => {
    if (!active) { clearAll(); return; }
    resetAndPlay();
    return clearAll;
  }, [active]);

  const formatAmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const logEnabled = typedText.length > 0;

  const cats = MOCK_SPEND_CATS.map(c => ({
    ...c,
    amount: c.name === 'Groceries' ? grocAmt : c.amount,
  }));

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={[sl.spHeader, { borderBottomColor: t.divider }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
          <View style={sl.spAccent} />
          <Text style={[sl.spLogTitle, { color: t.text }]}>Japan Trip</Text>
        </View>
        <Text style={[sl.spTotal, { color: t.text }]}>$855.25</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['analytics-outline', 'list-outline', 'pie-chart-outline', 'add-circle-outline'].map((icon, i) => (
            <View key={i} style={[sl.spQuickBtn, { backgroundColor: t.field }]}>
              <Ionicons name={icon} size={14} color={t.muted} />
            </View>
          ))}
        </View>
      </View>

      {/* Form card */}
      <View style={[sl.spCard, { backgroundColor: t.card, borderColor: t.divider }]}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          <View style={{ flex: 0.75 }}>
            <Text style={[sl.spLabel, { color: t.muted }]}>AMOUNT</Text>
            <View style={[sl.spField, { backgroundColor: t.field }]}>
              <Text style={[sl.spDollar, { color: t.muted }]}>$</Text>
              <Animated.Text style={[sl.spFieldText, { color: t.text, opacity: formFade }]}>15.00</Animated.Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[sl.spLabel, { color: t.muted }]}>CATEGORY</Text>
            <View style={[sl.spField, { backgroundColor: t.field }]}>
              <Animated.Text style={[sl.spFieldText, { color: t.text, opacity: formFade }]}>Groceries</Animated.Text>
            </View>
          </View>
        </View>

        <Text style={[sl.spLabel, { color: t.muted }]}>DESCRIPTION</Text>
        <View style={[sl.spField, { backgroundColor: t.field, marginBottom: 12 }]}>
          <Text style={[sl.spFieldText, { color: t.text }]}>
            {typedText}
            {phase === 1 && <Animated.Text style={{ opacity: cursorAnim, color: '#5C5CFF' }}>|</Animated.Text>}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={[sl.spClearBtn, { borderColor: t.divider }]}>
            <Text style={[sl.spClearText, { color: t.muted }]}>CLEAR</Text>
          </View>
          <View style={[sl.spLogBtn, {
            backgroundColor: logEnabled ? (logFlashed ? '#fff' : '#5C5CFF') : t.field,
            borderWidth: logEnabled ? 0 : 1,
            borderColor: t.divider,
          }]}>
            <Text style={[sl.spLogText, { color: logEnabled ? (logFlashed ? '#5C5CFF' : '#fff') : t.muted }]}>LOG</Text>
          </View>
        </View>
      </View>

      {/* Category list */}
      <View style={[sl.spCatCard, { backgroundColor: t.card, borderColor: t.divider }]}>
        {cats.map((cat, i) => (
          <View
            key={cat.name}
            style={[sl.spCatRow, i < cats.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.divider }]}
          >
            <Ionicons name={cat.icon} size={15} color={cat.color} style={{ marginRight: 10 }} />
            <Text style={[sl.spCatName, { color: t.text }]}>{cat.name}</Text>
            <Text style={[sl.spCatAmt, { color: t.text }]}>${formatAmt(cat.amount)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Slides config ────────────────────────────────────────────────────────────

const SLIDES = [
  {
    title:   'Track default categories or create your own',
    caption: 'Build your category bank with defaults or create your own custom categories.',
    render:  (t, active) => <CategoryBankSlide t={t} active={active} />,
  },
  {
    title:   'Organise your spending into logs',
    caption: 'Create logs for trips, months, or any budget you want to track.',
    render:  (t, active) => <LogsSlide t={t} active={active} />,
  },
  {
    title:   'Log your spending as you go',
    caption: 'Enter an amount, pick a category, add a note — then tap LOG.',
    render:  (t, active) => <SpendSlide t={t} active={active} />,
  },
];

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function OnboardingModal({ visible, onDone }) {
  const { isDarkMode } = useTheme();
  const scrollRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const backWidth = useRef(new Animated.Value(0)).current;

  const animateBack = (index) => {
    Animated.timing(backWidth, {
      toValue: index === 0 ? 0 : 66,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const t = isDarkMode ? {
    bg:      '#0f0f0f',
    card:    '#1a1a1a',
    field:   '#242424',
    text:    '#ffffff',
    muted:   '#555',
    divider: '#222',
    dot:     '#2a2a2a',
    caption: '#888',
    modal:   '#0a0a0a',
  } : {
    bg:      '#EEF2F7',
    card:    '#ffffff',
    field:   '#EEF2F7',
    text:    '#0A1628',
    muted:   '#8BA3C0',
    divider: '#EEF2F7',
    dot:     '#D8E2EE',
    caption: '#4A6FA5',
    modal:   '#F4F7FB',
  };

  const goTo = (index) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrent(index);
    animateBack(index);
  };

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== current) {
      setCurrent(index);
      animateBack(index);
    }
  };

  const isLast = current === SLIDES.length - 1;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: t.modal }]}>

        {/* Skip */}
        <TouchableOpacity style={styles.skipBtn} onPress={onDone}>
          <Text style={[styles.skipText, { color: t.caption }]}>Skip</Text>
        </TouchableOpacity>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {SLIDES.map((slide, i) => (
            <View key={i} style={styles.slide}>
              {slide.title && (
                <Text style={[styles.slideTitle, { color: t.text }]}>{slide.title}</Text>
              )}
              <View style={[styles.previewFrame, { backgroundColor: t.bg }]}>
                {slide.render(t, current === i)}
              </View>
              <Text style={[styles.caption, { color: t.caption }]}>{slide.caption}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Dots */}
        {SLIDES.length > 1 && (
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => goTo(i)}>
                <View style={[
                  styles.dot,
                  { backgroundColor: i === current ? '#5C5CFF' : t.dot },
                  i === current && styles.dotActive,
                ]} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Back / Next / Done */}
        <View style={styles.btnRow}>
          {SLIDES.length > 1 && (
            <Animated.View style={{ width: backWidth, overflow: 'hidden' }}>
              <TouchableOpacity
                style={[styles.backBtn, { borderColor: t.dot, marginRight: 12 }]}
                onPress={() => goTo(current - 1)}
                disabled={current === 0}
              >
                <Ionicons name="arrow-back" size={18} color={t.caption} />
              </TouchableOpacity>
            </Animated.View>
          )}
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={isLast ? onDone : () => goTo(current + 1)}
            activeOpacity={0.85}
          >
            <Text style={styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
            {!isLast && <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />}
          </TouchableOpacity>
        </View>

        <View style={{ height: 48 }} />
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:    { flex: 1 },
  skipBtn:      { alignSelf: 'flex-end', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8 },
  skipText:     { fontSize: 16 },
  slide:        { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  slideTitle:   { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 24, paddingHorizontal: 8 },
  previewFrame: { width: '100%', flex: 1, maxHeight: height * 0.68, borderRadius: 24, overflow: 'hidden', padding: 18 },
  caption:      { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 20, paddingHorizontal: 8 },
  dotsRow:      { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 16 },
  dot:          { width: 8, height: 8, borderRadius: 4 },
  dotActive:    { width: 24, borderRadius: 4 },
  btnRow:       { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24 },
  backBtn:      { width: 54, height: 54, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  nextBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#5C5CFF', height: 54, borderRadius: 16 },
  nextText:     { color: '#fff', fontSize: 17, fontWeight: '700' },
});

// ─── Slide-level styles ───────────────────────────────────────────────────────

const sl = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  screenTitle:  { fontSize: 22, fontWeight: '800' },
  screenSub:    { fontSize: 12, marginTop: 2 },
  circleBtn:    { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  searchBar:    { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, height: 38, marginBottom: 10 },
  listCard:     { borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
  catRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 14 },
  catIcon:      { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  catName:      { flex: 1, fontSize: 14, fontWeight: '400' },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText:    { fontSize: 10, fontWeight: '600' },
  // Spend screen
  spHeader:    { paddingBottom: 12, marginBottom: 8, borderBottomWidth: 1 },
  spAccent:    { width: 3, height: 18, borderRadius: 2, backgroundColor: '#5C5CFF', marginRight: 10 },
  spLogTitle:  { fontSize: 15, fontWeight: '700' },
  spTotal:     { fontSize: 28, fontWeight: '800', marginBottom: 10 },
  spQuickBtn:  { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  spCard:      { borderRadius: 13, padding: 12, borderWidth: 1, marginBottom: 8 },
  spLabel:     { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 5 },
  spField:     { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', minHeight: 34 },
  spDollar:    { fontSize: 13, marginRight: 3 },
  spFieldText: { fontSize: 13 },
  spClearBtn:  { flex: 0.75, height: 36, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  spClearText: { fontWeight: '600', fontSize: 12 },
  spLogBtn:    { flex: 1, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  spLogText:   { fontWeight: '700', fontSize: 14 },
  spCatCard:   { borderRadius: 13, borderWidth: 1, overflow: 'hidden' },
  spCatRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  spCatName:   { flex: 1, fontSize: 13 },
  spCatAmt:    { fontSize: 13, fontWeight: '600' },
  // Log card
  logCard:       { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 8, borderLeftWidth: 3 },
  logTitle:      { fontSize: 15, fontWeight: '600' },
  logDate:       { fontSize: 12, marginTop: 2 },
  logAmt:        { fontSize: 15, fontWeight: '700' },
  // Log modal (matches screen2 MB style)
  logModalCard:  { width: '85%', borderRadius: 24, padding: 24, borderWidth: 1, alignItems: 'center' },
  logIconWrap:   { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logModalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  logModalInput: { width: '100%', borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, alignItems: 'center' },
  logModalInputText: { fontSize: 16 },
  logModalBtn:   { width: '100%', backgroundColor: '#5C5CFF', borderRadius: 12, alignItems: 'center', paddingVertical: 14, marginBottom: 10 },
  logModalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logModalCancel: { fontSize: 15 },
  // Modal overlay (matches screen4 exactly)
  modalOverlay:      { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalSheet:        { width: '85%', borderRadius: 18, padding: 24, borderWidth: 1 },
  modalTitle:        { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput:        { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 20 },
  modalInputText:    { fontSize: 16 },
  modalBtns:         { flexDirection: 'row', gap: 10 },
  modalCancel:       { flex: 1, alignItems: 'center', paddingVertical: 12 },
  modalCancelText:   { fontSize: 16 },
  modalConfirm:      { flex: 1, borderRadius: 10, alignItems: 'center', paddingVertical: 12, backgroundColor: '#5C5CFF' },
  modalConfirmText:  { fontSize: 16, fontWeight: '600', color: '#fff' },
});
