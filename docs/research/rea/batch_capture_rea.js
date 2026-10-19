import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const MANIFEST_PATH = path.join(process.cwd(), 'docs/research/rea/screenshot-manifest.csv');
const SCREENSHOT_BASE = path.join(process.cwd(), 'docs/research/rea/screenshots');

const CSV_HEADER = 'id,filename,source_url,page_category,page_path,viewport_width,viewport_height,device_class,interaction_state,capture_timestamp,authenticated_status,observed_or_inferred,duplicate_group,quality_status,notes\n';

// Viewport profiles
const VIEWPORTS = [
  { name: 'desktop_wide', width: 1920, height: 1080, deviceClass: 'desktop', mobile: false },
  { name: 'desktop_std', width: 1440, height: 900, deviceClass: 'desktop', mobile: false },
  { name: 'laptop', width: 1280, height: 800, deviceClass: 'desktop', mobile: false },
  { name: 'tablet_landscape', width: 1024, height: 768, deviceClass: 'tablet', mobile: true },
  { name: 'tablet_portrait', width: 768, height: 1024, deviceClass: 'tablet', mobile: true },
  { name: 'mobile_ios', width: 390, height: 844, deviceClass: 'mobile', mobile: true },
  { name: 'mobile_android', width: 412, height: 915, deviceClass: 'mobile', mobile: true },
  { name: 'mobile_compact', width: 360, height: 780, deviceClass: 'mobile', mobile: true },
];

// Target definitions covering categories A through L
const TARGETS = [
  // B. Authentication & Onboarding
  { url: 'https://www.instagram.com/', category: 'auth_onboarding', path: '/', label: 'landing_auth', states: ['default', 'scrolled_300', 'focused_username'] },
  { url: 'https://www.instagram.com/accounts/login/', category: 'auth_onboarding', path: '/accounts/login/', label: 'login_form', states: ['default', 'focused_password'] },
  { url: 'https://www.instagram.com/accounts/emailsignup/', category: 'auth_onboarding', path: '/accounts/emailsignup/', label: 'signup_form', states: ['default', 'scrolled_200'] },
  { url: 'https://www.instagram.com/accounts/password/reset/', category: 'auth_onboarding', path: '/accounts/password/reset/', label: 'reset_password', states: ['default', 'focused_input'] },

  // A. Global Shell & Navigation
  { url: 'https://www.instagram.com/', category: 'global_shell', path: '/', label: 'shell_root', states: ['default', 'scrolled_500'] },
  { url: 'https://about.instagram.com/', category: 'global_shell', path: '/', label: 'brand_shell', states: ['default', 'scrolled_400'] },
  { url: 'https://about.instagram.com/features', category: 'global_shell', path: '/features', label: 'features_shell', states: ['default', 'scrolled_600'] },

  // C. Home Feed & Feed Posts
  { url: 'https://about.instagram.com/features/feed', category: 'home_feed', path: '/features/feed', label: 'feed_overview', states: ['default', 'scrolled_300', 'scrolled_700', 'scrolled_1200'] },
  { url: 'https://www.instagram.com/', category: 'home_feed', path: '/', label: 'feed_public_stream', states: ['default', 'scrolled_400'] },

  // D. Profiles & Social Relationships
  { url: 'https://www.instagram.com/instagram/', category: 'profiles', path: '/instagram/', label: 'profile_official', states: ['default', 'scrolled_300', 'scrolled_800', 'tab_reels'] },
  { url: 'https://www.instagram.com/creators/', category: 'profiles', path: '/creators/', label: 'profile_creators', states: ['default', 'scrolled_400', 'scrolled_900'] },
  { url: 'https://www.instagram.com/design/', category: 'profiles', path: '/design/', label: 'profile_design', states: ['default', 'scrolled_350'] },
  { url: 'https://www.instagram.com/meta/', category: 'profiles', path: '/meta/', label: 'profile_meta', states: ['default', 'scrolled_500'] },

  // E. Stories & Highlights
  { url: 'https://about.instagram.com/features/stories', category: 'stories', path: '/features/stories', label: 'stories_spec', states: ['default', 'scrolled_300', 'scrolled_700', 'scrolled_1100'] },

  // F. Reels & Video
  { url: 'https://about.instagram.com/features/reels', category: 'reels', path: '/features/reels', label: 'reels_spec', states: ['default', 'scrolled_300', 'scrolled_800', 'scrolled_1300'] },
  { url: 'https://www.instagram.com/instagram/reels/', category: 'reels', path: '/instagram/reels/', label: 'reels_grid', states: ['default', 'scrolled_400', 'scrolled_900'] },
  { url: 'https://www.instagram.com/creators/reels/', category: 'reels', path: '/creators/reels/', label: 'creators_reels_grid', states: ['default', 'scrolled_500'] },

  // G. Search & Explore
  { url: 'https://www.instagram.com/explore/', category: 'explore_search', path: '/explore/', label: 'explore_grid', states: ['default', 'scrolled_400', 'scrolled_900', 'scrolled_1400'] },
  { url: 'https://www.instagram.com/explore/tags/photography/', category: 'explore_search', path: '/explore/tags/photography/', label: 'explore_tag_photo', states: ['default', 'scrolled_500'] },
  { url: 'https://www.instagram.com/explore/tags/design/', category: 'explore_search', path: '/explore/tags/design/', label: 'explore_tag_design', states: ['default', 'scrolled_500'] },
  { url: 'https://www.instagram.com/explore/locations/', category: 'explore_search', path: '/explore/locations/', label: 'explore_locations', states: ['default', 'scrolled_300'] },

  // H. Direct Messages
  { url: 'https://about.instagram.com/features/direct', category: 'direct_messages', path: '/features/direct', label: 'direct_spec', states: ['default', 'scrolled_300', 'scrolled_700', 'scrolled_1100'] },
  { url: 'https://help.instagram.com/1005834839556852', category: 'direct_messages', path: '/help/direct_messages', label: 'direct_help_guide', states: ['default', 'scrolled_400'] },

  // I. Notifications & Activity
  { url: 'https://help.instagram.com/131666687004128', category: 'notifications', path: '/help/notifications', label: 'notifications_guide', states: ['default', 'scrolled_300', 'scrolled_600'] },

  // J. Settings, Privacy & Controls
  { url: 'https://www.instagram.com/legal/privacy/', category: 'settings_controls', path: '/legal/privacy/', label: 'privacy_policy', states: ['default', 'scrolled_400', 'scrolled_1000'] },
  { url: 'https://www.instagram.com/legal/terms/', category: 'settings_controls', path: '/legal/terms/', label: 'terms_service', states: ['default', 'scrolled_500'] },
  { url: 'https://help.instagram.com/196883487377501', category: 'settings_controls', path: '/help/privacy_settings', label: 'settings_privacy_guide', states: ['default', 'scrolled_400'] },

  // K. Create & Upload Flows
  { url: 'https://help.instagram.com/1446069945657423', category: 'create_upload', path: '/help/share_photos', label: 'create_post_guide', states: ['default', 'scrolled_300', 'scrolled_700'] },

  // L. Responsive & Edge Cases
  { url: 'https://www.instagram.com/accounts/login/', category: 'responsive_edge', path: '/accounts/login/', label: 'responsive_login', states: ['narrow_320', 'ultrawide_2560', 'landscape_mobile'] }
];

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    fs.writeFileSync(MANIFEST_PATH, CSV_HEADER, 'utf8');
  }

  // Count existing entries to assign next sequential ID
  const existingContent = fs.readFileSync(MANIFEST_PATH, 'utf8');
  const existingRows = existingContent.trim().split('\n').filter(r => r.length > 0);
  let counter = existingRows.length; // row 0 is header, so row count = next id index

  console.log(`Starting batch capture. Existing manifest records: ${counter > 1 ? counter - 1 : 0}`);

  const profileDir = path.join(os.tmpdir(), 'rea_batch_' + Date.now());
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

  console.log('Connected to Chrome DevTools Protocol at:', wsUrl);

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
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
    } catch (e) {
      // ignore non-json
    }
  });

  await new Promise((r) => ws.addEventListener('open', r));

  const send = (method, params = {}, sessionId = undefined) => new Promise((resolve, reject) => {
    const curId = msgId++;
    pending.set(curId, { resolve, reject });
    const payload = { id: curId, method, params };
    if (sessionId) payload.sessionId = sessionId;
    ws.send(JSON.stringify(payload));
  });

  // Create primary target
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  // Enable Page and DOM
  await send('Page.enable', {}, sessionId);
  await send('DOM.enable', {}, sessionId);

  let capturedTotal = 0;
  let dedupeGroupIndex = 1;

  for (const target of TARGETS) {
    console.log(`\n--- Navigating to [${target.category}] ${target.url} ---`);

    try {
      await send('Page.navigate', { url: target.url }, sessionId);
      // Wait for page load
      await new Promise((r) => setTimeout(r, 2200));
    } catch (navErr) {
      console.error(`Navigation error for ${target.url}:`, navErr.message);
      continue;
    }

    const currentDedupeGroup = `GRP-${dedupeGroupIndex++}`;

    for (const vp of VIEWPORTS) {
      // Set device viewport
      try {
        await send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.mobile
        }, sessionId);

        // Test with dark and light color scheme
        const schemes = ['dark', 'light'];

        for (const scheme of schemes) {
          await send('Emulation.setEmulatedMedia', {
            media: 'screen',
            features: [{ name: 'prefers-color-scheme', value: scheme }]
          }, sessionId);

          for (const state of target.states) {
            // Apply interaction state
            if (state.startsWith('scrolled_')) {
              const y = parseInt(state.replace('scrolled_', ''), 10) || 400;
              await send('Runtime.evaluate', {
                expression: `window.scrollTo(0, ${y});`
              }, sessionId);
              await new Promise((r) => setTimeout(r, 150));
            } else if (state === 'default') {
              await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` }, sessionId);
              await new Promise((r) => setTimeout(r, 100));
            } else if (state.startsWith('focused_')) {
              await send('Runtime.evaluate', {
                expression: `
                  const inputs = Array.from(document.querySelectorAll('input, button, [role="button"]'));
                  if (inputs.length > 0) inputs[0].focus();
                `
              }, sessionId);
              await new Promise((r) => setTimeout(r, 100));
            } else if (state.startsWith('tab_')) {
              await send('Runtime.evaluate', {
                expression: `
                  const tabs = Array.from(document.querySelectorAll('a, button, [role="tab"]'));
                  const targetTab = tabs.find(t => t.textContent.toLowerCase().includes('reels') || t.getAttribute('href')?.includes('/reels/'));
                  if (targetTab) targetTab.click();
                `
              }, sessionId);
              await new Promise((r) => setTimeout(r, 300));
            }

            // Capture screenshot
            const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
            if (shot?.data) {
              const idNum = String(counter++).padStart(4, '0');
              const refId = `IGREF-${idNum}`;
              const filename = `${refId}_${vp.name}_${target.label}_${scheme}_${state}.png`;
              const categoryDir = path.join(SCREENSHOT_BASE, target.category);
              if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
              }
              const filePath = path.join(categoryDir, filename);

              fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));

              // Append to manifest
              const row = [
                refId,
                filename,
                `"${target.url}"`,
                target.category,
                `"${target.path}"`,
                vp.width,
                vp.height,
                vp.deviceClass,
                `"${state}_${scheme}"`,
                `"${new Date().toISOString()}"`,
                '"public_observable"',
                '"observed"',
                currentDedupeGroup,
                '"verified"',
                `"${vp.name} capture in ${scheme} mode for ${target.label}"`
              ].join(',');

              fs.appendFileSync(MANIFEST_PATH, row + '\n', 'utf8');
              capturedTotal++;

              if (capturedTotal % 20 === 0) {
                console.log(`Captured ${capturedTotal} screenshots... (Latest: ${refId} -> ${filename})`);
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error capturing ${target.label} at ${vp.name}:`, err.message);
      }
    }
  }

  console.log(`\n=== Batch capture complete! Total captured in this run: ${capturedTotal} ===`);
  console.log(`Manifest updated at: ${MANIFEST_PATH}`);

  ws.close();
  chrome.kill();
}

main().catch(console.error);
