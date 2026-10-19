# REA Tool Usage & Investigation Log

## 1. REA Environment Configuration
- **REA Package Version:** 6.7.0 (`rea-agents@6.7.0`)
- **Installed Skill:** `reverse-engineer-anything` (version 42)
- **MCP Server Connection:** `rea` with 207 available tools registered via Antigravity MCP configuration.
- **Runtime Host Environment:** Windows x64 with Node.js v24.18.0, npm 11.16.0.
- **Browser Executable:** `C:\Program Files\Google\Chrome\Application\chrome.exe` (Chromium 155.0.8059.80).

---

## 2. Categorization of Available REA Tools

The 207 connected REA tools provide capabilities across several operational domains:

### A. Browser Connection, Navigation & Scenario Capture
- `capture_browser_scenario`: Controlled browser scenario executor in launch or connect mode. Used to launch Chrome, navigate to target URLs, execute user actions (waits, clicks, fills), capture screenshots, accessibility trees, and DOM snapshots.
- `list_browser_targets`: Enumerates open CDP targets exposed on a loopback Chrome DevTools Protocol port.
- `inspect_web_page`: Direct page and frame inspection on an existing browser target.
- `observe_web_session`: Passive observation of network, console, and frame events during user actions.

### B. DOM Inspection & Event Listeners
- `inspect_web_event_listeners`: Resolves event listener registration sources and bound functions for CSS selectors.
- `observe_web_execution`: Analyzes JavaScript runtime execution coverage without modifying code.
- `discover_webmcp_tools`: Discovers client-side declared tool interfaces.

### C. Network & Traffic Capture
- `inspect_web_network_capture`: Inspects structured HAR, SAZ, mitmproxy, or qlog network recordings.
- `inspect_packet_capture`: Offline packet inspection and filtering using TShark/Wireshark integrations.
- `inspect_pcap_capture`: Analyzes DNS, IP, and SNI protocol distribution summaries.

### D. Visual Analysis & Comparison
- `capture_web_screenshot`: High-fidelity pixel rendering of browser targets.
- `compare_web_screenshots`: Perceptual and pixel-level comparison of two visual states.
- `compare_web_captures`: Structural diffing between two captured web sessions.

### E. JavaScript Application & Bundle Analysis
- `analyze_javascript_application`: Static code property graph analysis for client-side JavaScript and Electron bundles.
- `recover_javascript_sources`: Source map extraction and source unbundling.
- `reconcile_javascript_runtime`: Correlates static bundle structures with active runtime objects.

---

## 3. Operations Executed During Instagram Investigation

| Operation | Tool Used | Target / Parameters | Output Evidence Artifact |
|---|---|---|---|
| **1. Landing & Auth Inspection** | `capture_browser_scenario` | `https://www.instagram.com/`, actions: `wait_for_timeout (2000ms)`, capture: `[url, dom, screenshot]` | `docs/research/rea/instagram_landing_rea.png`, `docs/research/rea/instagram_landing_dom.html` (396 KB) |
| **2. Public Profile Inspection** | `capture_browser_scenario` | `https://www.instagram.com/instagram/`, actions: `wait_for_timeout (3000ms)`, capture: `[url, dom, screenshot]` | `docs/research/rea/instagram_profile_rea.png`, `docs/research/rea/instagram_profile_dom.html` (904 KB) |
| **3. Reel & Video Detail** | `capture_browser_scenario` | `https://www.instagram.com/instagram/reel/Deg7l7AsA1f/`, actions: `wait_for_timeout (3000ms)`, capture: `[url, dom, screenshot]` | `docs/research/rea/instagram_reel_rea.png`, `docs/research/rea/instagram_reel_dom.html` (878 KB) |
| **4. Explore Grid Inspection** | `capture_browser_scenario` | `https://www.instagram.com/explore/`, actions: `wait_for_timeout (3000ms)`, capture: `[url, dom, screenshot]` | `docs/research/rea/instagram_explore_rea.png`, `docs/research/rea/instagram_explore_dom.html` (1.04 MB) |
| **5. DOM Structure Analysis** | Node.js DOM parser | Regular expression and element parsing of inputs, links, forms, tabs, and layout hierarchy | `docs/research/rea/parse_dom.js`, `docs/research/rea/parse_profile_dom.js` |

---

## 4. Key Technical Evidence Recorded
1. **Form Input Naming:**
   - Identity input: `name="email"`, `autocomplete="username webauthn"`, `dir="ltr"`
   - Password input: `name="pass"`, `type="password"`
   - Submission: `<input type="submit">`
2. **Account Navigation Endpoints:**
   - Password reset: `/accounts/password/reset/`
   - Email registration: `/accounts/emailsignup/`
   - Legal & policies: `/legal/privacy/`, `/legal/terms/`
   - Location discovery: `/explore/locations/`
   - Popular reels / posts: `/popular/`
3. **Profile Surface Layout:**
   - Title structure: `{Name} (@{username}) • Instagram photos and videos`
   - Engagement counters: `followers`, `following`, `posts`
   - Highlights tray: `/stories/highlights/{id}/`
   - Navigation tabs: `Posts` (`/{username}/`), `Reels` (`/{username}/reels/`), `Tagged` (`/{username}/tagged/`)
   - Recommendation sidebar / drawer: `/related_profiles/`
