import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS_Mobile } from '../../constants';

export const storage = {
  /**
   * Get item
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  /**
   * Set item
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  /**
   * Remove item
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  /**
   * Clear all app storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },

  /**
   * Multi-get
   */
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Storage multiGet error:', error);
      return keys.map(key => [key, null]);
    }
  },

  /**
   * Multi-remove
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Storage multiRemove error:', error);
    }
  },

  // Convenience methods for Acaedu
  async getAuthToken(): Promise<string | null> {
    return this.get(STORAGE_KEYS_Mobile.AUTH_TOKEN);
  },

  async setAuthToken(token: string): Promise<void> {
    await this.set(STORAGE_KEYS_Mobile.AUTH_TOKEN, token);
  },

  async getUser(): Promise<any | null> {
    return this.get(STORAGE_KEYS_Mobile.USER);
  },

  async setUser(user: any): Promise<void> {
    await this.set(STORAGE_KEYS_Mobile.USER, user);
  },

  async clearAuth(): Promise<void> {
    await this.multiRemove([
      STORAGE_KEYS_Mobile.AUTH_TOKEN,
      STORAGE_KEYS_Mobile.USER
    ]);
  }
};
