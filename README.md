# Insta — Instagram-Level Social Network (REA Reverse-Engineered)

An authentic, fully featured social network reverse-engineered directly from observable Instagram surfaces using the Google Antigravity REA (Reverse Engineer Anything) framework and Chrome DevTools Protocol (CDP).

Built with a high-fidelity React + Vite frontend, deep OLED dark mode (`#000000`), and a full-stack Node.js + Express + MongoDB backend with real-time Socket.IO communication.

---

## 1. REA Reverse-Engineering Architecture & Deliverables

This codebase was developed following rigorous empirical UI reverse-engineering of live Instagram web surfaces, featuring an auditable reference library of screenshots, tokenized design specifications, and visual regression verification:

* [`docs/research/rea/screenshot-manifest.csv`](docs/research/rea/screenshot-manifest.csv): Master manifest of authentic reference screenshots cataloged with IDs (`IGREF-XXXX`), URLs, viewports, device classes, schemes, and interaction states.
* [`docs/research/rea/rea-tool-inventory.md`](docs/research/rea/rea-tool-inventory.md): REA framework inspection, Chrome executable detection, and CDP WebSocket automation engine.
* [`docs/research/instagram-ui-specification.md`](docs/research/instagram-ui-specification.md): Design system specifications including layout geometry (244px/72px shell, 630px feed), typography scale, pure `#000000` surface palette, 24px icon paths, and Tailwind CSS design tokens.
* [`docs/research/instagram-route-inventory.md`](docs/research/instagram-route-inventory.md): 120-route architecture inventory with component mappings, loading states, and verification IDs.
* [`docs/research/instagram-component-inventory.md`](docs/research/instagram-component-inventory.md): Component hierarchy and atomic design anatomy (StoriesTray, FeedPostCard, ProfileMediaGrid, DirectChatPane, etc.).
* [`docs/research/instagram-interaction-matrix.md`](docs/research/instagram-interaction-matrix.md): Micro-interactions, optimistic UI updates, keyboard shortcuts, and Socket.IO real-time delivery.
* [`docs/research/instagram-responsive-matrix.md`](docs/research/instagram-responsive-matrix.md): Multi-viewport responsive adaptation (Desktop Wide, Standard, Tablet, and Mobile Web).
* [`docs/research/instagram-observed-vs-inferred.md`](docs/research/instagram-observed-vs-inferred.md): Clear demarcation between empirical browser facts and architectural inferences.
* [`docs/research/visual-regression-report.md`](docs/research/visual-regression-report.md): Side-by-side visual regression audit comparing local implementation captures against references.
* [`docs/research/implementation-progress.md`](docs/research/implementation-progress.md): Milestone progress and verification ledger.
* [`docs/research/known-limitations.md`](docs/research/known-limitations.md): Operational considerations and production deployment advice.

---

## 2. Technology Stack

* **Frontend:** React 19, Vite 6, Tailwind CSS v4, Lucide Icons, Socket.IO Client.
* **Backend:** Node.js, Express, Socket.IO, Mongoose, Multer, bcryptjs, jsonwebtoken, helmet, cors.
* **Database:** Dual-mode MongoDB (connects to external MongoDB or automatically starts `mongodb-memory-server` for zero-configuration development and automated testing).
* **Testing:** Vitest, Supertest (100% pass rate: 47/47 passing tests).

---

## 3. Getting Started

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Run Local Development (Frontend + Backend)
```bash
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)
* **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3.3 Run Automated Tests
```bash
# Run all backend and frontend tests (47/47 passing)
npm run test:all

# Run backend tests only (37/37 passing)
npm run test

# Run frontend tests only (10/10 passing)
npm run test --prefix frontend
```

### 3.4 Production Build
```bash
npm run build:frontend
```

---

## 4. Demo Accounts (Auto-Seeded)

When running locally with the embedded in-memory MongoDB, three demo accounts are automatically initialized:
* **Administrator:** `admin` / `password123` (Access to `/admin`, `/admin/users`, `/admin/reports`, `/admin/audit`)
* **Creator:** `alex` / `password123` (Preloaded with posts, stories, reels, followers, and active chats)
* **Designer:** `maya` / `password123` (Preloaded with social graph connections)

---

## 5. Visual Fidelity Highlights

* **Pure `#000000` Canvas**: Authentic Instagram OLED dark theme with subtle `#262626` dividers.
* **Responsive Sidebar**: Expanded 244px desktop sidebar with logo and text labels, collapsing cleanly to 72px icon rail on compact screens and bottom navigation bar on mobile viewports.
* **Instagram Direct Messaging**: Exact 2-pane master-detail chat with Instagram purple-magenta gradient sent bubbles (`linear-gradient(90deg, #7000ff, #9400d3, #c800ff)`), grouped message spacing, rounded pill input bar, and deduplicated socket messaging.
* **Feed & Stories**: 630px max width feed with 58px avatar story circles, authentic 5-stop Instagram gradient rings, post action bars, inline comments, and carousel pagination.
* **Profile Media Grid**: Strictly 3-column `aspect-square` grid with desktop hover stats overlays, Reels video badges, and carousel badges.
* **Reels Viewer**: 9:16 vertical video feed with floating right-side action rail and audio track attribution.
