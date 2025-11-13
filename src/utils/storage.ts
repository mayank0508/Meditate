// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveJSON(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore silently; caller can handle if needed
  }
}

export async function loadJSON<T = any>(key: string): Promise<T | null> {
  try {
    const s = await AsyncStorage.getItem(key);
    if (!s) return null;
    return JSON.parse(s) as T;
  } catch (e) {
    return null;
  }
}
