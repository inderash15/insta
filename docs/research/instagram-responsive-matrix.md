# Instagram Responsive Design Matrix

## 1. Breakpoint Grid System & Device Classes

The responsive system is mapped across three canonical device tiers observed in Instagram Web's responsive layout engine:

```
[ Desktop: >= 1264px ] ─── 244px Sidebar ─── 630px Feed ─── 64px gap ─── 319px Aside
[ Tablet / Laptop: 768px - 1263px ] ─── 72px Rail ─── 630px Centered Content (Aside Hidden)
[ Mobile Web: < 768px ] ─── 44px Top Bar ─── 100vw Content ─── 48px Bottom Nav Bar
```

---

## 2. Cross-Device Component Adaptation Matrix

| UI Component | Desktop Wide (> 1440px) | Desktop Standard (1264px - 1440px) | Tablet / Laptop (768px - 1263px) | Mobile Phone (< 768px) |
|---|---|---|---|---|
| **Global Navigation** | 244px fixed sidebar with full text labels and Instagram wordmark | 244px fixed sidebar | 72px fixed rail with centered icons and tooltip labels | Top header (44px) with wordmark + bottom navigation bar (48px) |
| **Search & Notifications** | Left sliding drawer (397px) overlaid on content | Left sliding drawer (397px) overlaid on content | Left sliding drawer expanding next to 72px rail | Full-screen page routes (`/search`, `/notifications`) |
| **Home Feed** | 630px max width centered with 319px sticky right suggestions aside | 630px max width with sticky aside | 630px centered, aside hidden | 100vw full-width feed, 0px horizontal padding, no aside |
| **Post Cards** | Max-width 470px, rounded corners (4px), borders visible | Max-width 470px, rounded corners | Max-width 470px | Full width (100%), no card borders, edge-to-edge media |
| **Stories Tray** | Horizontal carousel with left/right circular arrow buttons | Horizontal carousel with arrows | Horizontal carousel with arrows | Native touch swipe scroll, arrows hidden |
| **Profile Header** | Horizontal row: 150px avatar, stats row, action buttons side-by-side | Horizontal row: 150px avatar | Horizontal row: 120px avatar | Vertical stack: 77px avatar left, stats right; action buttons full-width below |
| **Profile Grid** | 3 columns, 28px gaps (`gap-7`) | 3 columns, 28px gaps | 3 columns, 16px gaps | 3 columns, 1.5px gaps (`gap-0.5`), edge-to-edge |
| **Explore Grid** | 3 columns with 2x2 featured tile every 6 items | 3 columns with 2x2 tile | 3 columns | 3 columns, edge-to-edge |
| **Direct Messaging** | 2-pane master-detail (350px thread list + active chat) | 2-pane master-detail | 2-pane master-detail | 1-pane: thread list (`/direct/inbox`) or chat (`/direct/t/:id`) |
| **Reels Viewer** | Centered vertical card (max 420px width), dark background, right-side action rail | Centered vertical card | Centered vertical card | Fullscreen mobile viewport (100vw x 100vh), overlay actions |
| **Create Post** | Centered modal (700px width), dark backdrop blur | Centered modal | Centered modal | Fullscreen mobile sheet |

---

## 3. Responsive Touch & Pointer Adaptations

1. **Hover vs Touch Targets**:
   - On desktop pointers (`@media (hover: hover)`): Profile grid tiles reveal overlay with likes and comment counts on hover.
   - On touch devices (`@media (hover: none)`): Grid tiles tap directly into post detail view without persistent hover overlays.
2. **Safe Area Insets**:
   - Mobile top and bottom bars include `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` padding for iOS notch and home indicator bar.
