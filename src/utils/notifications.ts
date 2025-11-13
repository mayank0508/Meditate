// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { saveJSON, loadJSON } from './storage';

const REMINDER_KEY = 'REMINDER_SETTING';

export type ReminderSetting = {
  enabled: boolean;
  hour: number;
  minute: number;
  notificationId?: string | null;
};

export async function requestPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn(
      'requestPermission: not a physical device — notifications are limited on simulators.'
    );
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true
    }
  });

  console.log('requestPermission -> status:', status);
  return status === 'granted';
}

export async function scheduleDailyReminder(setting: ReminderSetting) {
  try {
    console.log('scheduleDailyReminder called with:', setting);
    await cancelSavedReminder();

    if (!setting.enabled) {
      await saveJSON(REMINDER_KEY, setting);
      console.log('scheduleDailyReminder: saved disabled setting');
      return null;
    }

    if (!Device.isDevice) {
      console.warn(
        'scheduleDailyReminder: running on simulator — scheduled notifications might not fire on simulators. Test on a real device.'
      );
    }

    const trigger = {
      hour: setting.hour,
      minute: setting.minute,
      repeats: true
    } as any;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to breathe 🌬️',
        body: 'Open your timer for a short meditation.',
        sound: true
      },
      trigger
    });

    console.log('scheduleDailyReminder -> scheduled id:', id);
    const toSave = { ...setting, notificationId: id };
    await saveJSON(REMINDER_KEY, toSave);
    return id;
  } catch (err) {
    console.error('scheduleDailyReminder error:', err);
    throw err;
  }
}

export async function cancelSavedReminder() {
  try {
    const saved = await loadJSON<ReminderSetting>(REMINDER_KEY);
    if (saved?.notificationId) {
      console.log('cancelSavedReminder: cancelling id', saved.notificationId);
      await Notifications.cancelScheduledNotificationAsync(
        saved.notificationId
      );
    }
  } catch (e) {
    console.warn('cancelSavedReminder error', e);
  }
  await saveJSON(REMINDER_KEY, {
    enabled: false,
    hour: 7,
    minute: 0,
    notificationId: null
  });
}

export async function loadReminderSetting(): Promise<ReminderSetting> {
  const s = await loadJSON<ReminderSetting>(REMINDER_KEY);
  if (!s) return { enabled: false, hour: 7, minute: 0, notificationId: null };
  return s;
}

/**
 * DEBUG helper: schedule an immediate notification after X seconds.
 * Use only for testing and remove later.
 */
export async function scheduleDebugInSeconds(seconds = 10) {
  try {
    console.log(
      `scheduleDebugInSeconds: scheduling notification in ${seconds}s`
    );
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Debug: test notification',
        body: `Fires in ${seconds} seconds`
      },
      trigger: { seconds }
    } as any);
    console.log('scheduleDebugInSeconds -> id:', id);
    return id;
  } catch (e) {
    console.error('scheduleDebugInSeconds error', e);
    throw e;
  }
}
