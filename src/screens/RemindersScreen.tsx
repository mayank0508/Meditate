// src/screens/RemindersScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Button, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  loadReminderSetting,
  scheduleDailyReminder,
  requestPermission,
  ReminderSetting,
  scheduleDebugInSeconds
} from '../utils/notifications';

export default function RemindersScreen() {
  const [setting, setSetting] = useState<ReminderSetting>({
    enabled: false,
    hour: 7,
    minute: 0,
    notificationId: null
  });

  useEffect(() => {
    (async () => {
      const s = await loadReminderSetting();
      setSetting(s);
    })();
  }, []);

  // request permission and toggle reminders
  async function toggle(enabled: boolean) {
    if (enabled) {
      const ok = await requestPermission();
      if (!ok) {
        Alert.alert(
          'Permission needed',
          'Please enable notifications in your device settings.'
        );
        return;
      }
    }
    const newSet = { ...setting, enabled };
    await scheduleDailyReminder(newSet);
    const fresh = await loadReminderSetting();
    setSetting(fresh);
  }

  // quick setter for demo times
  async function setTime(h: number, m: number) {
    const s = { ...setting, hour: h, minute: m, enabled: true };
    await scheduleDailyReminder(s);
    const fresh = await loadReminderSetting();
    setSetting(fresh);
  }

  // ===== DEBUG: list scheduled notifications =====
  // This must be inside the component so it's in scope for the button
  async function listScheduled() {
    try {
      const list = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications:', list);
      Alert.alert(`Scheduled: ${list.length}`);
    } catch (e) {
      console.warn('listScheduled error', e);
      Alert.alert('Error listing scheduled notifications', String(e));
    }
  }
  // ==============================================

  // ...inside component JSX where debug button is:
  <Button
    title="Debug: Fire in 10s"
    onPress={async () => {
      try {
        const id = await scheduleDebugInSeconds(10);
        Alert.alert('Debug scheduled', `id: ${id}`);
      } catch (e) {
        Alert.alert('Debug failed', String(e));
      }
    }}
  />;

  return (
    <View style={{ padding: 18 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Daily Reminder</Text>

      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}
      >
        <Switch value={setting.enabled} onValueChange={toggle} />
        <Text style={{ marginLeft: 12 }}>
          {setting.enabled
            ? `At ${String(setting.hour).padStart(2, '0')}:${String(
                setting.minute
              ).padStart(2, '0')}`
            : 'Off'}
        </Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <Button title="Set 7:00 AM" onPress={() => setTime(7, 0)} />
        <View style={{ height: 8 }} />
        <Button title="Set 9:00 PM" onPress={() => setTime(21, 0)} />
      </View>

      {/* DEBUG button */}
      <View style={{ marginTop: 16 }}>
        <Button title="Debug: List Scheduled" onPress={listScheduled} />
      </View>
    </View>
  );
}
