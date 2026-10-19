# Instagram UI Specification & Reverse-Engineered Design System

## 1. Executive Summary & Methodology

This specification details the design system, layout geometry, typography, color tokens, component anatomy, and micro-interactions reverse-engineered directly from observable Instagram surfaces (web and mobile responsive breakpoints) using the REA framework and Chrome DevTools Protocol (CDP) inspections.

All specifications are tied directly to visual evidence captured in the reference screenshot library (`docs/research/rea/screenshots/`) and cataloged in `docs/research/rea/screenshot-manifest.csv` under IDs `IGREF-0001` through `IGREF-1000+`.

---

## 2. Layout Geometry & Responsive Breakpoints

### 2.1 Viewport Breakpoints
| Viewport Tier | Width Range | Global Nav Format | Main Content Max Width | Column Structure |
|---|---|---|---|---|
| **Desktop Ultra-Wide** | > 1440px | Expanded Sidebar (244px) | 935px (Feed + Aside: 630px + 305px) | 2 Columns (Feed + Suggested Aside) |
| **Desktop Standard** | 1264px - 1440px | Expanded Sidebar (244px) | 935px | 2 Columns |
| **Tablet / Compact Desktop** | 768px - 1263px | Collapsed Rail (72px) | 630px | 1 Column (Aside collapsed / hidden) |
| **Mobile Web** | < 768px | Top Header (44px/60px) + Bottom Bar (48px) | 100vw (max 480px centered) | 1 Column Full Width |

### 2.2 Shell Geometry
- **Expanded Sidebar Width**: `244px` fixed, border-right: `1px solid #262626`.
- **Collapsed Sidebar Width**: `72px` fixed, center-aligned icon navigation, border-right: `1px solid #262626`.
- **Mobile Top Bar Height**: `44px` on iOS Safari, `60px` with logo and action icons.
- **Mobile Bottom Navigation Height**: `48px` fixed bottom, border-top: `1px solid #262626`.
- **Feed Container**: Max width `630px`, horizontal margin `auto`.
- **Secondary Aside**: Width `319px`, left margin `64px`, sticky position at `top: 36px`.
- **Profile Content Area**: Max width `935px`, horizontal padding `20px` (desktop), `0px` (mobile).

---

## 3. Color & Surface System

### 3.1 Dark Theme (Primary Observed Target)
Instagram Web enforces a strict, deep OLED-optimized dark palette:
- **Canvas / App Background**: `#000000` (Pure Black).
- **Elevated Surfaces (Modals, Flyouts, Cards)**: `#121212` / `#262626`.
- **Borders & Dividers**:
  - Primary Divider: `#262626` (`rgb(38, 38, 38)`).
  - Subtle / Secondary Border: `#363636` (`rgb(54, 54, 54)`).
  - Input Border: `#363636` (resting), `#555555` (hover), `#A8A8A8` (focus).
- **Typography / Text Hierarchy**:
  - Primary Text: `#F5F5F5` (`rgb(245, 245, 245)`) — usernames, post captions, titles.
  - Secondary Text: `#A8A8A8` (`rgb(168, 168, 168)`) — timestamps, follow counts, hints, metadata.
  - Tertiary / Placeholder Text: `#737373` (`rgb(115, 115, 115)`).
- **Interactive & Accent Colors**:
  - Instagram Primary Action Blue: `#0095F6` (resting), `#1877F2` (hover), `#0074CC` (active).
  - Secondary Button Surface: `#363636` (resting), `#262626` (hover).
  - Destructive / Red: `#ED4956`.
  - Story Ring Gradient: `linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)`.
  - Direct Message Bubble (Sent): `linear-gradient(90deg, #7000ff 0%, #9400d3 50%, #c800ff 100%)`.
  - Direct Message Bubble (Received): `#262626`.

### 3.2 Light Theme Reference Tokens
- **Canvas**: `#FFFFFF`.
- **Surface**: `#FAFAFA` / `#FFFFFF`.
- **Border**: `#DBDBDB`.
- **Primary Text**: `#262626`.
- **Secondary Text**: `#737373`.

---

## 4. Typography Specification

### 4.1 Font Family Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

### 4.2 Type Scale & Weights
| Role | Size | Line Height | Weight | Letter Spacing |
|---|---|---|---|---|
| **App Title / Wordmark** | 22px | 28px | 700 / Script | -0.5px |
| **Section Header** | 16px | 24px | 700 (Bold) | -0.15px |
| **Username (Primary)** | 14px | 18px | 600 (Semibold) | 0px |
| **Body / Caption** | 14px | 18px | 400 (Regular) | 0px |
| **Secondary Metadata** | 12px | 16px | 400 (Regular) | 0.2px |
| **Timestamps / Badges** | 10px - 11px | 14px | 500 (Medium) | 0.3px |
| **Button Text** | 14px | 18px | 600 (Semibold) | 0px |

---

## 5. Iconography Specification

- **Grid Size**: `24px x 24px` viewport standard for primary navigation and post actions.
- **Stroke Width**: `2px` or `1.75px` consistent optical stroke.
- **Active vs Inactive States**:
  - Inactive: Outline stroke (`fill="none" stroke="currentColor"`).
  - Active: Solid filled (`fill="currentColor" stroke="none"`).
- **Core Icons Cataloged**:
  - `Home` (Outline / Solid)
  - `Search` (Outline with 45° angled handle)
  - `Explore` (Compass 8-point needle)
  - `Reels` (Clapperboard with play triangle)
  - `Messages` (Paper plane angled 45°)
  - `Notifications` (Heart outline / Solid red or white fill)
  - `Create` (Square with rounded corners + plus symbol)
  - `Bookmark / Save` (Ribbon outline / Solid fill)
  - `Comment` (Speech bubble with tail bottom-right)
  - `Share` (Paper plane)
  - `More Options` (Horizontal 3-dots `···`)

---

## 6. Component Specifications & Anatomies

### 6.1 Stories Tray & Story Ring
- **Tray Height**: `118px` desktop, `84px` mobile.
- **Scroll Behavior**: Horizontal overflow hidden, arrow buttons on desktop hover, smooth touch scroll on mobile.
- **Story Ring Geometry**:
  - Outer Diameter: `66px` (desktop), `56px` (mobile).
  - Gradient Border Thickness: `2px`.
  - White / Black Spacing Gap: `2px` (`#000000`).
  - Avatar Image Diameter: `58px` (desktop), `48px` (mobile), `object-fit: cover`, `border-radius: 9999px`.
- **Text Label**: Username max width `74px`, truncated with ellipsis `...`, font size `12px`, color `#F5F5F5`.

### 6.2 Feed Post Card
- **Container**: Max width `470px` (standard feed presentation), background `#000000`, border-bottom `1px solid #262626` (or no border with `mb-6`).
- **Header (`44px` height)**:
  - Avatar: `32px x 32px` circle with optional mini story gradient.
  - Username: `14px font-semibold text-[#F5F5F5]`.
  - Dot Separator: `·` `text-[#A8A8A8]`.
  - Timestamp: `14px text-[#A8A8A8]` (e.g., `2h`, `1d`).
  - More Button: `ml-auto text-[#F5F5F5] p-2`.
- **Media Container**:
  - Aspect Ratios: `1:1` (square), `4:5` (portrait 1080x1350), `16:9` (landscape).
  - Max display width: `468px`.
  - Border radius: `4px` or `0px` depending on viewport.
  - Carousel Indicator: Overlaid dots at bottom center (`w-1.5 h-1.5 rounded-full bg-white/40 active:bg-white`).
- **Action Bar (`40px` height)**:
  - Left Cluster: Like (Heart), Comment (Bubble), Share (Paper plane) with `gap-4`.
  - Right: Bookmark (Ribbon).
- **Likes Count**: `14px font-semibold text-[#F5F5F5] mt-2 mb-1` (e.g. `1,420 likes`).
- **Caption Block**:
  - Bold username followed immediately by caption text.
  - "more" truncation button for long captions (`text-[#A8A8A8] cursor-pointer`).
- **Comments Preview**:
  - "View all 84 comments" (`text-[#A8A8A8] text-sm cursor-pointer`).
- **Comment Input**:
  - Transparent textarea, placeholder "Add a comment...", right "Post" button (`text-[#0095F6] font-semibold opacity-50` when empty, `opacity-100` when populated).

### 6.3 Profile Page
- **Header**:
  - Avatar: `150px x 150px` (desktop), `77px x 77px` (mobile).
  - Username: `20px font-normal text-[#F5F5F5]`.
  - Edit Profile / Following Buttons: `bg-[#363636] hover:bg-[#262626] rounded-lg px-4 py-1.5 text-sm font-semibold`.
  - Stats Row: `[N] posts  [N] followers  [N] following` (`text-base`).
  - Bio: Name in bold, newline-separated bio text, clickable link (`text-[#E0F1FF] font-semibold`).
- **Highlights Tray**: Circular thumbnails (`87px` outer diameter) with label below.
- **Profile Navigation Tabs**:
  - Tabs: POSTS, REELS, SAVED, TAGGED.
  - Desktop: Centered tabs with top active border `1px solid #F5F5F5`.
  - Mobile: Full-width 3-tab icon bar.
- **Media Grid**:
  - 3 columns, `gap-1` or `gap-7` (desktop), `gap-0.5` (mobile).
  - Aspect ratio: strictly `1:1` square (`aspect-square`).
  - Hover state (desktop): Dark overlay `#00000080` with like count & comment count icons.

### 6.4 Direct Messaging
- **Layout**: 2-pane master-detail (conversation list: `350px`, chat view: `flex-1`).
- **Header**: Avatar + Username + Active status dot / "Active 10m ago".
- **Chat Bubbles**:
  - Sent Message: Gradient `from-[#7000ff] via-[#9400d3] to-[#c800ff]`, text white, `rounded-[20px] rounded-br-[4px] px-4 py-2.5 max-w-[70%]`.
  - Received Message: Surface `#262626`, text white, `rounded-[20px] rounded-bl-[4px] px-4 py-2.5 max-w-[70%]`.
  - Grouped Messages: Sub-messages in same cluster have reduced gap (`gap-0.5`) and rounded corners.
- **Input Bar**:
  - Rounded pill shape (`rounded-full border border-[#363636] bg-[#000000] px-4 py-2 flex items-center gap-3`).
  - Icons: Emoji picker, Voice note, Image upload, Heart reaction.

### 6.5 Reels Viewer
- **Geometry**: Aspect ratio `9:16`, height `calc(100vh - 40px)`, max-width `420px`, centered.
- **Right Action Rail**:
  - Floating vertical column: Like icon + count, Comment icon + count, Share icon, Save icon, More options icon, Audio disc rotation icon.
- **Bottom Overlay**:
  - Avatar + Username + Follow button pill.
  - Caption with expand toggle.
  - Audio track ticker with marquee text.

---

## 7. Reusable Design Tokens (Tailwind CSS Mapping)

```json
{
  "colors": {
    "ig-black": "#000000",
    "ig-elevated": "#121212",
    "ig-surface": "#262626",
    "ig-border": "#262626",
    "ig-border-subtle": "#363636",
    "ig-text-primary": "#F5F5F5",
    "ig-text-secondary": "#A8A8A8",
    "ig-text-tertiary": "#737373",
    "ig-blue": "#0095F6",
    "ig-blue-hover": "#1877F2",
    "ig-destructive": "#ED4956"
  },
  "spacing": {
    "sidebar-expanded": "244px",
    "sidebar-collapsed": "72px",
    "feed-max": "630px",
    "feed-card-max": "470px",
    "aside-width": "319px",
    "profile-max": "935px"
  },
  "borderRadius": {
    "pill": "9999px",
    "bubble": "20px",
    "card": "8px",
    "button": "8px",
    "input": "6px"
  }
}
```

---

## 8. Verification & References

This specification is directly implemented across all frontend components in `frontend/src/` and verified against reference screenshots in `docs/research/rea/screenshot-manifest.csv`.
