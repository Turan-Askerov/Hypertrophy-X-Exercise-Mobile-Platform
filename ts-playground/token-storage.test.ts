import assert from "node:assert/strict";
import { createTokenStorage, type StorageAdapter } from "../src/auth/create-token-storage.ts";

function fakeAdapter() {
  const data = new Map<string, string>();
  const stats = { reads: 0, failGet: false, failSet: false, failRemove: false };
  const adapter: StorageAdapter = {
    get: async (key) => {
      stats.reads += 1;
      if (stats.failGet) throw new Error("keystore okunamadı");
      return data.get(key) ?? null;
    },
    set: async (key, value) => {
      if (stats.failSet) throw new Error("keystore yazılamadı");
      data.set(key, value);
    },
    remove: async (key) => {
      if (stats.failRemove) throw new Error("keystore silinemedi");
      data.delete(key);
    },
  };
  return { adapter, data, stats };
}

// 1. boşken null
{
  const f = fakeAdapter();
  const s = createTokenStorage(f.adapter);
  assert.equal(await s.getToken(), null);
}

// 2. kaydet → oku; kaydettikten sonra depoya tekrar gitmez (önbellek)
{
  const f = fakeAdapter();
  const s = createTokenStorage(f.adapter);
  await s.saveToken("abc");
  assert.equal(await s.getToken(), "abc");
  assert.equal(f.stats.reads, 0);
  assert.equal(f.data.get("hx_token"), "abc");
}

// 3. uygulama yeniden açıldı: yeni örnek depodan okur, ikinci okuma önbellekten
{
  const f = fakeAdapter();
  await createTokenStorage(f.adapter).saveToken("abc");
  const s2 = createTokenStorage(f.adapter);
  assert.equal(await s2.getToken(), "abc");
  assert.equal(await s2.getToken(), "abc");
  assert.equal(f.stats.reads, 1);
}

// 4. temizle: hem bu örnekte hem yeniden açılışta null
{
  const f = fakeAdapter();
  const s = createTokenStorage(f.adapter);
  await s.saveToken("abc");
  await s.clearToken();
  assert.equal(await s.getToken(), null);
  assert.equal(f.data.has("hx_token"), false);
  assert.equal(await createTokenStorage(f.adapter).getToken(), null);
}

// 5. boş token kaydedilmez
{
  const f = fakeAdapter();
  const s = createTokenStorage(f.adapter);
  await assert.rejects(s.saveToken(""), /Boş token/);
  await assert.rejects(s.saveToken("   "), /Boş token/);
  assert.equal(f.data.size, 0);
}

// 6. okuma hatası → null döner, çökmez; hata önbelleğe yazılmaz, sonra tekrar denenir
{
  const f = fakeAdapter();
  f.data.set("hx_token", "abc");
  f.stats.failGet = true;
  const s = createTokenStorage(f.adapter);
  assert.equal(await s.getToken(), null);
  f.stats.failGet = false;
  assert.equal(await s.getToken(), "abc");
}

// 7. yazma hatası → saveToken hata fırlatır, token kaydedilmiş sayılmaz
{
  const f = fakeAdapter();
  f.stats.failSet = true;
  const s = createTokenStorage(f.adapter);
  await assert.rejects(s.saveToken("abc"), /yazılamadı/);
  f.stats.failSet = false;
  assert.equal(await s.getToken(), null);
}

// 8. silme hatası → clearToken çökmez, bu oturumda token null
{
  const f = fakeAdapter();
  const s = createTokenStorage(f.adapter);
  await s.saveToken("abc");
  f.stats.failRemove = true;
  await s.clearToken();
  assert.equal(await s.getToken(), null);
}

// 9. özel anahtar adı
{
  const f = fakeAdapter();
  await createTokenStorage(f.adapter, "baska_anahtar").saveToken("abc");
  assert.equal(f.data.get("baska_anahtar"), "abc");
  assert.equal(f.data.has("hx_token"), false);
}

console.log("token-storage testleri geçti ✅");