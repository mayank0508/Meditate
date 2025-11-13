// src/screens/HomeScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import TimerCircle from '../components/TimerCircle';
import { recordCompletion, loadStreakInfo, StreakInfo } from '../utils/streaks';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  // quick-and-dirty nav typing to avoid TS errors while keeping dev fast
  const nav = useNavigation() as any;

  // timer state
  const [totalSeconds, setTotalSeconds] = useState<number>(5 * 60); // default 5 min
  const [remaining, setRemaining] = useState<number>(totalSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // streak state
  const [streak, setStreak] = useState<StreakInfo>({ streakCount: 0, lastCompletedDate: null });

  // confetti ref
  const confettiRef = useRef<any>(null);

  // load streak on mount
  useEffect(() => {
    (async () => {
      const s = await loadStreakInfo();
      setStreak(s);
    })();
  }, []);

  // keep remaining synced when total changes
  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  // main timer loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            // finish
            if (timerRef.current) {
              clearInterval(timerRef.current as any);
              timerRef.current = null;
            }
            setIsRunning(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current as any);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const onStart = () => setIsRunning(true);
  const onPause = () => setIsRunning(false);
  const onReset = () => {
    setIsRunning(false);
    setRemaining(totalSeconds);
  };

  // when a session completes
  async function onComplete() {
    try {
      const newInfo = await recordCompletion();
      setStreak(newInfo);

      // confetti
      try {
        confettiRef.current?.start();
      } catch (e) {
        // ignore confetti errors silently
      }

      // small feedback notification (local) — works on device and simulator mostly as immediate toast
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Session complete 🎉',
            body: `Streak: ${newInfo.streakCount} day${newInfo.streakCount === 1 ? '' : 's'}`,
          },
          trigger: null,
        });
      } catch (e) {
        // don't crash app for notification scheduling failures
        console.warn('notify error', e);
      }
    } catch (e) {
      console.warn('streak save error', e);
      Alert.alert('Error', 'Could not save streak. Please try again.');
    }
  }

  // quick UI helpers for changing presets
  function setPresetMinutes(mins: number) {
    const secs = Math.max(1, Math.floor(mins * 60));
    setTotalSeconds(secs);
    setRemaining(secs);
    setIsRunning(false);
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Breathe • Timer</Text>

        <View style={styles.headerRight}>
          <View style={styles.streakBox}>
            <Text style={styles.streakNumber}>{streak.streakCount}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>

          <TouchableOpacity
            onPress={() => nav.navigate('Reminders')}
            style={styles.remBtn}
            accessibilityRole="button"
            accessibilityLabel="Open reminders"
          >
            <Text style={styles.remBtnText}>Reminders</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.center}>
        <TimerCircle
          remaining={remaining}
          total={totalSeconds}
          onStart={onStart}
          onPause={onPause}
          onReset={onReset}
          isRunning={isRunning}
        />
      </View>

      <View style={styles.quickBtns}>
        <TouchableOpacity style={styles.quick} onPress={() => setPresetMinutes(1)}>
          <Text>1 min</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quick} onPress={() => setPresetMinutes(3)}>
          <Text>3 min</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quick} onPress={() => setPresetMinutes(5)}>
          <Text>5 min</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quick} onPress={() => setPresetMinutes(10)}>
          <Text>10 min</Text>
        </TouchableOpacity>
      </View>

      {/* confetti for celebration */}
      <ConfettiCannon ref={confettiRef} count={80} origin={{ x: -10, y: 0 }} autoStart={false} />

      {/* small footer note for device/simulator debugging */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {Platform.OS === 'ios' || Platform.OS === 'android'
            ? 'Tip: test notifications on a real device for accurate behavior.'
            : 'Running in web/desktop environment.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  streakBox: { backgroundColor: '#f0fdf4', padding: 8, borderRadius: 12, alignItems: 'center', marginRight: 12 },
  streakNumber: { fontWeight: '800' },
  streakLabel: { fontSize: 12 },
  remBtn: { padding: 8, borderRadius: 10, backgroundColor: '#e6f7ee' },
  remBtnText: { color: '#05386b', fontWeight: '700' },
  center: { alignItems: 'center', marginTop: 18 },
  quickBtns: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 28 },
  quick: { padding: 10, borderRadius: 10, backgroundColor: '#e6f7ee' },
  footer: { marginTop: 18, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#666' },
});
