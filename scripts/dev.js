#!/usr/bin/env node

/**
 * Hypertrophy-X — Backend + Expo Eşzamanlı Başlatıcı
 * 
 * Bu script tek komutla:
 * 1. Hypertrophy-X backend'ini (FastAPI / Uvicorn) arka planda çalıştırır (veya zaten çalışıyorsa algılar).
 * 2. Expo geliştirme sunucusunu (React Native) başlatır.
 * 3. Ctrl+C ile kapatıldığında tüm servisleri güvenle ve temiz bir şekilde sonlandırır.
 * 
 * Kullanım:
 *   npm run dev              -> Yerel ağ / emülatör için (http://localhost:8000)
 *   npm run dev:tunnel       -> Hotspot / Mobil veri / Uzaktan test için (Cloudflare + Expo Tunnel)
 *   ./dev.sh
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');
const os = require('os');

// Renk kodları
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  purple: '\x1b[35m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

const mobileDir = path.resolve(__dirname, '..');
const backendDir = process.env.BACKEND_DIR || path.resolve(mobileDir, '../Hypertrophy-X-v4.0/backend');
const venvUvicorn = path.resolve(backendDir, '../venv/bin/uvicorn');
const venvPython = path.resolve(backendDir, '../venv/bin/python');
const cloudflaredBin = path.join(os.homedir(), '.local/bin/cloudflared');

const userArgs = process.argv.slice(2);
const isTunnelMode = userArgs.includes('--tunnel');

let backendProcess = null;
let cloudflaredProcess = null;
let expoProcess = null;
let isCleaningUp = false;

function checkPort(port, host = '127.0.0.1', timeoutMs = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function waitForPort(port, host = '127.0.0.1', maxAttempts = 30, intervalMs = 300) {
  return new Promise(async (resolve) => {
    for (let i = 0; i < maxAttempts; i++) {
      const open = await checkPort(port, host);
      if (open) return resolve(true);
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    resolve(false);
  });
}

function cleanup() {
  if (isCleaningUp) return;
  isCleaningUp = true;
  console.log(`\n${C.yellow}🛑 Kapatılıyor: Süreçler temiz bir şekilde sonlandırılıyor...${C.reset}`);

  if (cloudflaredProcess && !cloudflaredProcess.killed) {
    try {
      cloudflaredProcess.kill('SIGINT');
    } catch {}
  }

  if (backendProcess && !backendProcess.killed) {
    try {
      if (backendProcess.pid) {
        process.kill(-backendProcess.pid, 'SIGINT');
      }
    } catch {
      try {
        backendProcess.kill('SIGINT');
      } catch {}
    }
  }

  if (expoProcess && !expoProcess.killed) {
    try {
      expoProcess.kill('SIGINT');
    } catch {}
  }

  setTimeout(() => {
    process.exit(0);
  }, 300);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => {
  if (!isCleaningUp) cleanup();
});

async function startBackend() {
  const isAlreadyRunning = await checkPort(8000);
  if (isAlreadyRunning) {
    console.log(`${C.green}✔ [BACKEND]${C.reset} Port 8000 üzerinde backend zaten çalışıyor: ${C.cyan}http://127.0.0.1:8000${C.reset}`);
    return;
  }

  if (!fs.existsSync(backendDir)) {
    console.error(`${C.red}✖ [BACKEND] Hata:${C.reset} Backend dizini bulunamadı: ${backendDir}`);
    console.error(`  Lütfen BACKEND_DIR ortam değişkenini ayarlayın veya Hypertrophy-X-v4.0 klasörünün konumunu kontrol edin.`);
    process.exit(1);
  }

  let cmd = 'uvicorn';
  let args = ['main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'];

  if (fs.existsSync(venvUvicorn)) {
    cmd = venvUvicorn;
  } else if (fs.existsSync(venvPython)) {
    cmd = venvPython;
    args = ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'];
  }

  console.log(`${C.purple}⚡ [BACKEND]${C.reset} Backend başlatılıyor (${C.dim}${cmd}${C.reset})...`);

  backendProcess = spawn(cmd, args, {
    cwd: backendDir,
    detached: true,
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',
    },
  });

  backendProcess.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${C.purple}[BACKEND]${C.reset} ${line}`);
      }
    }
  });

  backendProcess.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.error(`${C.yellow}[BACKEND]${C.reset} ${line}`);
      }
    }
  });

  backendProcess.on('error', (err) => {
    console.error(`${C.red}✖ [BACKEND] Başlatma hatası:${C.reset}`, err.message);
  });

  backendProcess.on('exit', (code, signal) => {
    if (!isCleaningUp) {
      console.log(`${C.yellow}[BACKEND] Backend kapandı (kod: ${code || signal})${C.reset}`);
    }
  });

  const ready = await waitForPort(8000);
  if (ready) {
    console.log(`${C.green}✔ [BACKEND]${C.reset} Backend hazır: ${C.cyan}http://127.0.0.1:8000${C.reset}\n`);
  } else {
    console.warn(`${C.yellow}⚠ [BACKEND] Port 8000 henüz yanıt vermedi, yine de devam ediliyor...${C.reset}\n`);
  }
}

async function startTunnel() {
  return new Promise((resolve) => {
    if (!fs.existsSync(cloudflaredBin)) {
      console.warn(`${C.yellow}⚠ [TUNNEL] cloudflared bulunamadı (${cloudflaredBin}). Yerel mod ile devam edilecek.${C.reset}`);
      return resolve(null);
    }

    console.log(`${C.blue}🌐 [TUNNEL]${C.reset} Backend için Cloudflare tüneli oluşturuluyor...`);
    cloudflaredProcess = spawn(cloudflaredBin, ['tunnel', '--url', 'http://127.0.0.1:8000']);

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn(`${C.yellow}⚠ [TUNNEL] Tünel zaman aşımına uğradı, yerel URL kullanılacak.${C.reset}`);
        resolve(null);
      }
    }, 15000);

    const onData = (data) => {
      const text = data.toString();
      const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        const tunnelUrl = match[0];
        console.log(`${C.green}✔ [TUNNEL]${C.reset} Backend Tüneli Hazır: ${C.cyan}${tunnelUrl}${C.reset}\n`);
        resolve(tunnelUrl);
      }
    };

    cloudflaredProcess.stdout.on('data', onData);
    cloudflaredProcess.stderr.on('data', onData);
  });
}

async function startExpo(customApiUrl) {
  console.log(`${C.cyan}🚀 [EXPO]${C.reset} Expo başlatılıyor...\n`);

  const expoEnv = { ...process.env };
  if (customApiUrl) {
    expoEnv.EXPO_PUBLIC_API_URL = customApiUrl;
  }

  // Kullanıcı argümanlarını Expo'ya ilet (örn. --tunnel, -c, --android vb.)
  const expoArgs = ['expo', 'start', ...userArgs];

  expoProcess = spawn('npx', expoArgs, {
    cwd: mobileDir,
    stdio: 'inherit',
    env: expoEnv,
  });

  expoProcess.on('exit', () => {
    cleanup();
  });
}

async function main() {
  console.log(`\n${C.bold}======================================================${C.reset}`);
  console.log(`${C.bold}   Hypertrophy-X (Backend + Expo Eşzamanlı Başlatıcı)${C.reset}`);
  console.log(`${C.bold}======================================================${C.reset}`);
  console.log(`Backend : ${C.dim}${backendDir}${C.reset}`);
  console.log(`Mobile  : ${C.dim}${mobileDir}${C.reset}`);
  console.log(`Mod     : ${C.cyan}${isTunnelMode ? 'Tünel Modu (Cloudflare + Expo Tunnel)' : 'Yerel Ağ Modu (Local)'}${C.reset}`);
  console.log(`${C.bold}------------------------------------------------------${C.reset}\n`);

  await startBackend();

  let tunnelUrl = null;
  if (isTunnelMode) {
    tunnelUrl = await startTunnel();
  }

  await startExpo(tunnelUrl);
}

main().catch((err) => {
  console.error(`${C.red}Kritik Hata:${C.reset}`, err);
  cleanup();
});
