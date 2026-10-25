#!/usr/bin/env node

/**
 * Hypertrophy-X — Tek Komutla Hem Backend Hem Expo Tüneli Başlatıcı
 * Hotspot, hücresel veri (Türk Telekom vb.) ve farklı ağlarda telefondan
 * Expo Go ile anında test edebilmeniz için backend'i ve Expo'yu otomatik tüneller.
 * bash 
 * npm run tunnel
 * npm run web
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const cloudflaredBin = path.join(os.homedir(), '.local/bin/cloudflared');

console.log('⏳ 1/2 Backend için güvenli Cloudflare tüneli oluşturuluyor...');

const cloudflared = spawn(cloudflaredBin, ['tunnel', '--url', 'http://127.0.0.1:8000']);

let expoProcess = null;
let tunnelEstablished = false;

function cleanup() {
  if (cloudflared && !cloudflared.killed) {
    try {
      cloudflared.kill('SIGINT');
    } catch {}
  }
  if (expoProcess && !expoProcess.killed) {
    try {
      expoProcess.kill('SIGINT');
    } catch {}
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

const handleOutput = (data) => {
  const text = data.toString();
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (match && !tunnelEstablished) {
    tunnelEstablished = true;
    const tunnelUrl = match[0];
    console.log(`✅ Backend Tüneli Hazır: ${tunnelUrl}`);
    console.log('⏳ 2/2 Expo Tüneli başlatılıyor (QR kod üretilecek)...\n');

    expoProcess = spawn('npx', ['expo', 'start', '--tunnel', '-c'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        EXPO_PUBLIC_API_URL: tunnelUrl,
      },
    });

    expoProcess.on('exit', (code) => {
      cleanup();
    });
  }
};

cloudflared.stderr.on('data', handleOutput);
cloudflared.stdout.on('data', handleOutput);

cloudflared.on('error', (err) => {
  console.error('❌ Cloudflared başlatılamadı:', err.message);
  cleanup();
});
