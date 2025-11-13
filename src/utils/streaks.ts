// src/utils/streaks.ts
import { loadJSON, saveJSON } from './storage';

const KEY = 'STREAK_INFO';

export type StreakInfo = {
  streakCount: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function loadStreakInfo(): Promise<StreakInfo> {
  const s = await loadJSON<StreakInfo>(KEY);
  if (!s) return { streakCount: 0, lastCompletedDate: null };
  return s;
}

export async function recordCompletion(): Promise<StreakInfo> {
  const info = await loadStreakInfo();
  const today = todayStr();
  if (info.lastCompletedDate === today) {
    return info;
  }
  let newCount = 1;
  if (info.lastCompletedDate === yesterdayStr()) {
    newCount = info.streakCount + 1;
  }
  const newInfo = { streakCount: newCount, lastCompletedDate: today };
  await saveJSON(KEY, newInfo);
  return newInfo;
}

export async function resetStreak(): Promise<StreakInfo> {
  const newInfo = { streakCount: 0, lastCompletedDate: null };
  await saveJSON(KEY, newInfo);
  return newInfo;
}
