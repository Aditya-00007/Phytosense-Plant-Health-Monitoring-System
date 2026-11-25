import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const web = Platform.OS === 'web';

// SecureStore on devices, localStorage on web. Never throws.
export const storage = {
  async get(key) {
    try {
      return web ? window.localStorage.getItem(key) : await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      if (web) window.localStorage.setItem(key, value);
      else await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async remove(key) {
    try {
      if (web) window.localStorage.removeItem(key);
      else await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};
