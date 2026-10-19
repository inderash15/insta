# Instagram UI Design Patterns & Component Reference

## 1. Visual Design Language

### Color Palette
- **Canvas / Backgrounds:**
  - Dark Mode (Primary): Deep neutral blacks (`#000000`, `#121212`, `#1a1a1a`, `#262626`).
  - Dark Mode Accents: Subtle border dividers (`#262626`, `#363636`).
  - Light Mode: Clean optical white (`#ffffff`, `#fafafa`, `#f0f2f5`).
- **Brand Gradients (Story Ring & Highlights):**
  - Linear gradient from yellow to fuchsia to purple (`linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)`).
- **Accent & Interactive Colors:**
  - Primary Action / Link: Sky blue (`#0095f6`, `#1877f2`).
  - Active Like State: Vibrant Crimson (`#ed4956`).
  - Success Badge: Verified Blue (`#0095f6`).

---

## 2. Typography Hierarchy
- **Primary Typeface:** Clean humanist sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).
- **Font Scale:**
  - Headers / Page Titles: `20px` - `24px`, bold (`font-weight: 700`).
  - Usernames: `14px`, semibold (`font-weight: 600`).
  - Body / Captions: `14px`, regular (`font-weight: 400`, `line-height: 18px`).
  - Timestamps & Subtext: `11px` - `12px`, muted gray (`#737373` / `#a8a8a8`).
  - Interactive Action Labels: `14px`, semibold (`font-weight: 600`).

---

## 3. Layout Grids & Sizing

### Desktop Structure
- **Persistent Sidebar Navigation:**
  - Width: `244px` expanded (viewport width > 1264px); `72px` icon-only compact rail (viewport width 768px - 1264px).
  - Navigation Items: Home, Search, Explore, Reels, Messages, Notifications, Create, Profile, More/Settings.
- **Main Feed Column:**
  - Maximum width: `630px` centered.
  - Story tray height: `116px` with horizontal overflow scroll.
- **Right Context Sidebar (Desktop):**
  - Width: `320px` positioned `64px` right of main feed.
  - Hosts current user profile preview, "Suggested for you" accounts, and secondary footer links.
- **Profile Page Layout:**
  - Container max width: `935px` centered with `20px` lateral padding.
  - 3-column media grid with `4px` - `28px` gutter spacing.

### Mobile Structure (Viewport < 768px)
- **Top Bar:** Brand wordmark, notification heart icon, direct message inbox icon.
- **Bottom Navigation Bar:** Height `50px` fixed, displaying Home, Explore, Create (+), Reels, and Profile avatar icon.
- **Media Presentation:** Full edge-to-edge 100% width display without horizontal gutters.

---

## 4. Component Patterns

### A. Story Circle Indicator
- Avatar container with `2px` padding border.
- Gradient border applied via conic-gradient or SVG mask when story is unviewed.
- Subtle `1px` white or black spacing gap between ring and inner photo.

### B. Media Post Card
- Border radius: `12px` (desktop boxed cards) or `0px` (mobile stream).
- Border: `1px solid rgba(255, 255, 255, 0.1)`.
- Smooth hover animations on interaction icons (1.1x scale transition on click).
- Double-tap heart animation: Transient expanding white heart icon overlay on media container.

### C. Dialogs & Modals
- Backdrop: `rgba(0, 0, 0, 0.65)` backdrop-filter blur (`4px`).
- Modal Card: `rounded-2xl` with border and drop shadow (`shadow-2xl`).
- Action lists: Stacked buttons with border dividers, red highlight for destructive operations (Unfollow, Delete, Block).

### D. Skeleton Loading States
- Animated shimmer gradient (`linear-gradient(90deg, #262626 25%, #333333 50%, #262626 75%)`).
- Circular skeletons for avatars, rectangular skeletons with rounded corners for media cards and text lines.
