import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createTokenStorage } from './create-token-storage.ts';

export const tokenStorage = createTokenStorage({
  get: (key) => {
    if (Platform.OS === 'web') {
      try {
        return Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null);
      } catch {
        return Promise.resolve(null);
      }
    }
    return SecureStore.getItemAsync(key);
  },
  set: (key, value) => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      } catch {}
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  remove: (key) => {
    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch {}
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
});