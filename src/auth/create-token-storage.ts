export type StorageAdapter = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  remove: (key: string) => Promise<void>;
};

export function createTokenStorage(adapter: StorageAdapter, key = "hx_token") {
  // undefined = henüz okunmadı, null = token yok
  let cached: string | null | undefined;

  async function getToken(): Promise<string | null> {
    if (cached !== undefined) return cached;
    try {
      cached = await adapter.get(key);
    } catch {
      return null;
    }
    return cached;
  }

  async function saveToken(token: string): Promise<void> {
    if (token.trim() === "") {
      throw new Error("Boş token kaydedilemez.");
    }
    await adapter.set(key, token);
    cached = token;
  }

  async function clearToken(): Promise<void> {
    cached = null;
    try {
      await adapter.remove(key);
    } catch {
      // silme başarısız olsa da bu oturumda token artık kullanılmaz
    }
  }

  return { getToken, saveToken, clearToken };
}