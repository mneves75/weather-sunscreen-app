import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin, typed wrapper around AsyncStorage with JSON helpers.
 * Keep this minimal and side‑effect free to make it easy to mock in tests.
 */
class StorageService {
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async multiRemove(keys: string[]): Promise<void> {
    await AsyncStorage.multiRemove(keys);
  }

  async setObject<T extends object>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }

  async getObject<T>(key: string): Promise<T | null> {
    const raw = await this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.setItem(key, value ? '1' : '0');
  }

  async getBoolean(key: string, fallback: boolean = false): Promise<boolean> {
    const v = await this.getItem(key);
    if (v == null) return fallback;
    return v === '1' || v.toLowerCase() === 'true';
  }
}

export const storageService = new StorageService();

export type StorageKeys = {
  PROFILE: string;
  APPLICATIONS: string;
  REMINDERS: string;
  THEME: string;
};
