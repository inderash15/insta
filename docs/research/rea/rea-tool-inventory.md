# REA Tool Inventory & Runtime Environment

## 1. Runtime Environment
- **Platform:** Windows x64 (PowerShell / Node.js v24.18.0 / npm 11.16.0)
- **Project Root:** `c:\Users\minde\OneDrive\Desktop\insta`
- **REA Version:** `rea-agents@6.7.0`, Skill version `42`
- **MCP Server:** `rea` with 207 connected tools
- **Browser Binary:** `C:\Program Files\Google\Chrome\Application\chrome.exe` (Chromium 155.0.8059.80)
- **Local Application Ports:**
  - Frontend: `http://localhost:5173/` (Vite 6 + React 19 + Tailwind CSS v4)
  - Backend: `http://localhost:5000/` (Express + Mongoose + Socket.IO)

---

## 2. REA Browser & Visual Inspection Capabilities

The connected MCP server `rea` provides comprehensive tools for browser automation, inspection, and visual comparison:

### A. Core Browser Automation & Scenario Execution
- **`capture_browser_scenario`**: Primary tool for deterministic browser workflows in launch mode.
  - Parameters:
    - `browser`: `{ mode: "launch", executable_path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true }`
    - `start_url`: `{ url: string, query: [] }`
    - `environment`: Viewport dimensions (`width`, `height`, `device_scale_factor`), `color_scheme` (`dark` / `light`), `locale`, `reduced_motion`
    - `actions`: Sequential operations (`goto`, `click`, `fill`, `press`, `wait_for`, `wait_for_timeout`)
    - `capture`: Artifact collection at steps or end (`screenshot`, `dom`, `accessibility`, `url`, `storage`, `network`)
  - Output: High-resolution PNG base64, full DOM HTML, accessibility tree, and HTTP event logs.

### B. Live Session & Target Discovery
- **`list_browser_targets`**: Discovers open tabs/targets on a loopback CDP endpoint (`http://127.0.0.1:9222`).
- **`inspect_web_page`**: Direct inspection of frames, scripts, and DOM trees on an active CDP session.
- **`observe_web_session`**: Real-time passive observation of navigation, network requests, and console events.

### C. Visual Comparison & Verification
- **`compare_web_screenshots`**: Direct image-diffing between two screenshot buffers or file references.
- **`compare_web_captures`**: Structural and DOM-level diffing between two captured states.
- **`capture_web_screenshot`**: Viewport-specific rasterization.

### D. DOM & Script Inspection
- **`inspect_web_event_listeners`**: Extracts attached event listeners on specific CSS selectors.
- **`analyze_web_bundle`**: Analyzes webpack/vite chunk distributions and module dependencies.
- **`recover_javascript_sources`**: Extracts and reconstructs client-side source files from source maps.
