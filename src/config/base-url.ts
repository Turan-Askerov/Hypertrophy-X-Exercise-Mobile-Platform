import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function normalizeBaseUrl(raw: string | undefined): string {
  // 1. Web tarayıcısında çalışırken her zaman doğrudan yerel backend'e bağlan
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }

  const value = (raw ?? '').trim();

  // 2. Eğer açıkça bir genel tünel veya HTTPS adresi verilmişse onu kullan
  if (value.startsWith('https://') || (value.startsWith('http://') && !value.includes('localhost') && !value.includes('127.0.0.1'))) {
    return value.replace(/\/+$/, '');
  }

  // 3. Telefondaysa ve localhost verilmişse, Expo'nun bağlandığı bilgisayar IP'sini otomatik algıla
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000`;
    }
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value.replace(/\/+$/, '');
  }

  return 'http://localhost:8000';
}