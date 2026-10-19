import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

async function testCDP() {
  const profileDir = path.join(os.tmpdir(), 'rea_cdp_' + Date.now());
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
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise((r) => ws.addEventListener('open', r));
  console.log('WebSocket open.');

  // Create page target
  const { targetId } = await send('Target.createTarget', { url: 'https://www.instagram.com/' });
  console.log('Target created:', targetId);

  // Connect to page target
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  console.log('Attached to session:', sessionId);

  const sendSession = (method, params = {}) => send('Target.sendMessageToTarget', {
    sessionId,
    message: JSON.stringify({ id: id++, method, params })
  });

  // Wait 3 seconds for load
  await new Promise((r) => setTimeout(r, 3000));

  // Capture screenshot via Page.captureScreenshot
  const sendPage = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (event) => {
      const outer = JSON.parse(event.data);
      if (outer.method === 'Target.receivedMessageFromTarget' && outer.params?.sessionId === sessionId) {
        const inner = JSON.parse(outer.params.message);
        if (inner.id === curId) {
          ws.removeEventListener('message', handler);
          if (inner.error) reject(inner.error);
          else resolve(inner.result);
        }
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({
      id: id++,
      method: 'Target.sendMessageToTarget',
      sessionId,
      message: JSON.stringify({ id: curId, method, params })
    }));
  });

  const screenshot = await sendPage('Page.captureScreenshot', { format: 'png' });
  console.log('Captured screenshot bytes (base64 len):', screenshot?.data?.length);

  ws.close();
  chrome.kill();
  console.log('Cleaned up Chrome process.');
}

testCDP().catch(console.error);
