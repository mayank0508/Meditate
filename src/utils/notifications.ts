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
  // simulators/emulators often can't receive push notifications reliably
  if (!Device.isDevice) {
    console.warn('requestPermission: not a physical device — notifications are limited on simulators.');
    // still attempt to get permissions but warn the user in UI if needed
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await (Notifications.requestPermissionsAsync as any)({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });

  return status === 'granted';
}

export async function scheduleDailyReminder(setting: ReminderSetting) {
  // cancel previous saved one first
  await cancelSavedReminder();

  if (!setting.enabled) {
    await saveJSON(REMINDER_KEY, setting);
    return null;
  }

  // if running on simulator and device is not physical, warn and still save but scheduling may not fire
  if (!Device.isDevice) {
    console.warn('scheduleDailyReminder: running on simulator — scheduled notifications might not fire. Test on a real device.');
  }

  const trigger = {
    hour: setting.hour,
    minute: setting.minute,
    repeats: true,
  } as any;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to breathe 🌬️',
      body: 'Open your timer for a short meditation.',
      sound: true,
    },
    trigger,
  });

  const toSave = { ...setting, notificationId: id };
  await saveJSON(REMINDER_KEY, toSave);

  // return scheduled id for immediate verification if caller wants it
  return id;
}

export async function cancelSavedReminder() {
  const saved = await loadJSON<ReminderSetting>(REMINDER_KEY);
  if (saved?.notificationId) {
    try { await Notifications.cancelScheduledNotificationAsync(saved.notificationId); } catch (e) { console.warn(e); }
  }
  await saveJSON(REMINDER_KEY, { enabled: false, hour: 7, minute: 0, notificationId: null });
}

export async function loadReminderSetting(): Promise<ReminderSetting> {
  const s = await loadJSON<ReminderSetting>(REMINDER_KEY);
  if (!s) return { enabled: false, hour: 7, minute: 0, notificationId: null };
  return s;
}
