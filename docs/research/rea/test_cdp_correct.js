import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

async function testCDP() {
  const profileDir = path.join(os.tmpdir(), 'rea_cdp_test_' + Date.now());
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9222',
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
      const match = d.toString().match(/DevTools listening on (ws:\/\/127\.0\.0\.1:9222\/[^\s]+)/);
      if (match) {
        wsUrl = match[1];
        resolve();
      }
    });
  });

  console.log('Connected to CDP at:', wsUrl);

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  });

  await new Promise((r) => ws.addEventListener('open', r));
  console.log('WebSocket open.');

  const send = (method, params = {}, sessionId = undefined) => new Promise((resolve, reject) => {
    const curId = id++;
    pending.set(curId, { resolve, reject });
    const payload = { id: curId, method, params };
    if (sessionId) payload.sessionId = sessionId;
    ws.send(JSON.stringify(payload));
  });

  // Create target
  const { targetId } = await send('Target.createTarget', { url: 'https://www.instagram.com/' });
  console.log('Target created:', targetId);

  // Attach with flatten: true
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  console.log('Attached to session:', sessionId);

  // Wait 3 seconds
  await new Promise((r) => setTimeout(r, 3000));

  // Set device metrics
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  }, sessionId);

  // Capture screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  console.log('Captured screenshot data length:', shot.data.length);

  ws.close();
  chrome.kill();
  console.log('Test completed successfully!');
}

testCDP().catch(console.error);
