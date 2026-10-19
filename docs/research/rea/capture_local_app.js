import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const LOCAL_BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.join(process.cwd(), 'docs/research/rea/screenshots/local_regression');

const VIEWPORTS = [
  { name: 'desktop_wide', width: 1920, height: 1080, deviceClass: 'desktop', mobile: false },
  { name: 'desktop_std', width: 1440, height: 900, deviceClass: 'desktop', mobile: false },
  { name: 'tablet_portrait', width: 768, height: 1024, deviceClass: 'tablet', mobile: true },
  { name: 'mobile_ios', width: 390, height: 844, deviceClass: 'mobile', mobile: true },
];

const LOCAL_ROUTES = [
  { path: '/', label: 'home_feed' },
  { path: '/accounts/login', label: 'login' },
  { path: '/accounts/emailsignup', label: 'signup' },
  { path: '/explore', label: 'explore' },
  { path: '/reels', label: 'reels' },
  { path: '/direct/inbox', label: 'direct_inbox' },
  { path: '/profile/alex', label: 'profile_view' },
  { path: '/notifications', label: 'notifications' },
  { path: '/accounts/edit', label: 'settings' }
];

async function captureLocal() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const profileDir = path.join(os.tmpdir(), 'rea_local_' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9223',
    '--headless=new',
    '--user-data-dir=' + profileDir,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  let wsUrl = '';
  await new Promise((resolve) => {
    chrome.stderr.on('data', (d) => {
      const match = d.toString().match(/DevTools listening on (ws:\/\/127\.0\.0\.1:9223\/[^\s]+)/);
      if (match) {
        wsUrl = match[1];
        resolve();
      }
    });
  });

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  ws.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    } catch (e) {}
  });

  await new Promise((r) => ws.addEventListener('open', r));

  const send = (method, params = {}, sessionId = undefined) => new Promise((resolve, reject) => {
    const curId = id++;
    pending.set(curId, { resolve, reject });
    const payload = { id: curId, method, params };
    if (sessionId) payload.sessionId = sessionId;
    ws.send(JSON.stringify(payload));
  });

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  await send('Page.enable', {}, sessionId);

  let captured = 0;

  for (const route of LOCAL_ROUTES) {
    const fullUrl = `${LOCAL_BASE_URL}${route.path}`;
    console.log(`Navigating to local: ${fullUrl}`);

    try {
      await send('Page.navigate', { url: fullUrl }, sessionId);
      await new Promise((r) => setTimeout(r, 1200));

      for (const vp of VIEWPORTS) {
        await send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.mobile
        }, sessionId);

        await send('Emulation.setEmulatedMedia', {
          media: 'screen',
          features: [{ name: 'prefers-color-scheme', value: 'dark' }]
        }, sessionId);

        await new Promise((r) => setTimeout(r, 150));

        const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
        if (shot?.data) {
          const filename = `LOCAL_${route.label}_${vp.name}.png`;
          const filePath = path.join(OUTPUT_DIR, filename);
          fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
          captured++;
          console.log(`Saved local screenshot: ${filename}`);
        }
      }
    } catch (err) {
      console.error(`Error capturing local route ${route.path}:`, err.message);
    }
  }

  console.log(`Captured ${captured} local screenshots.`);
  ws.close();
  chrome.kill();
}

captureLocal().catch(console.error);
