# Project Aurora — Design Tokens & Visual Specification

## 1. Overview & Identity Rationale
Project Aurora implements an original social platform design language. While drawing UX conventions (left-rail navigation, full-bleed media, responsive sheets, horizontal stories tray) from modern social platforms, Aurora features its own typography hierarchy, curated color palette (Aurora Violet, Electric Coral, Deep Obsidian, and Frosted Glass), crisp iconography, and fluid physics-based micro-interactions.

---

## 2. Color System

### Dark Mode (Primary Palette)
- **Background Primary**: `#090A0F` (Deep Obsidian / Midnight Void)
- **Background Secondary / Surface**: `#12151F` (Elevated Card / Modal)
- **Background Tertiary / Hover**: `#1B2030` (Interactive List Hover)
- **Border Subtle**: `#22283A` (Dividers, card outlines)
- **Border Focus / Active**: `#6366F1` (Indigo Glow)
- **Text Primary**: `#F8FAFC` (High contrast pure white)
- **Text Secondary / Muted**: `#94A3B8` (Slate Muted)
- **Text Tertiary / Disabled**: `#64748B` (Subtle metadata)

### Light Mode (Secondary Palette)
- **Background Primary**: `#FFFFFF` (Pure Crisp White)
- **Background Secondary / Surface**: `#F8FAFC` (Soft Slate)
- **Background Tertiary**: `#F1F5F9` (Hover background)
- **Border Subtle**: `#E2E8F0` (Card dividers)
- **Text Primary**: `#0F172A` (Rich Dark Slate)
- **Text Secondary**: `#475569` (Muted Slate)

### Aurora Accent Gradients & Semantic Colors
- **Aurora Primary Brand**: `linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F59E0B 100%)` (Aurora Sunrise)
- **Story Ring (Unread)**: `conic-gradient(from 180deg at 50% 50%, #8B5CF6 0deg, #EC4899 120deg, #F59E0B 240deg, #8B5CF6 360deg)`
- **Story Ring (Viewed)**: `#334155` (Slate Dim)
- **Story Ring (Close Friends)**: `linear-gradient(135deg, #10B981 0%, #059669 100%)` (Emerald Green)
- **Like / Heart Active**: `#EF4444` (Ruby Crimson)
- **Bookmark / Save Active**: `#F59E0B` (Amber Gold)
- **Verified Badge**: `#38BDF8` (Sky Cerulean)

---

## 3. Typography Hierarchy

| Style Token | Font Family | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| `display-xl` | Inter, system-ui | 28px (1.75rem) | 800 | 1.2 | -0.025em | Main Hero / Aurora Brandmark |
| `heading-lg` | Inter, system-ui | 20px (1.25rem) | 700 | 1.3 | -0.02em | Profile Names, Modal Titles |
| `heading-md` | Inter, system-ui | 16px (1.0rem) | 600 | 1.4 | -0.01em | Post Card Usernames, Sheet Headers |
| `body-base` | Inter, system-ui | 14px (0.875rem)| 400 | 1.5 | 0 | Captions, Comments, Direct Messages |
| `body-medium`| Inter, system-ui | 14px (0.875rem)| 500 | 1.5 | 0 | Navigation Items, Button Labels |
| `caption-sm` | Inter, system-ui | 12px (0.75rem) | 400 | 1.4 | +0.01em | Timestamps, Secondary Metrics |
| `micro-xs` | Inter, system-ui | 11px (0.6875rem)| 600 | 1.2 | +0.02em | Unread Badges, Story Owner Labels |

---

## 4. Spacing, Radii & Depth

### Spacing Scale
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-5`: 20px
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px

### Border Radii
- `rounded-sm`: 6px (Input tags, badges)
- `rounded-md`: 10px (Buttons, interactive items)
- `rounded-lg`: 16px (Cards, modal dialogs, preview sheets)
- `rounded-xl`: 24px (Story viewers, full-bleed containers)
- `rounded-full`: 9999px (Avatars, story rings, reaction pills)

### Elevation & Shadows
- `shadow-subtle`: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)`
- `shadow-elevated`: `0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)`
- `shadow-glow`: `0 0 20px -2px rgba(139, 92, 246, 0.35)`

---

## 5. Animation Timing & Transitions

- **Standard Ease**: `cubic-bezier(0.16, 1, 0.3, 1)` (Fluid spring decelerate)
- **Fast Micro-interaction**: `150ms ease-out` (Button presses, hover highlights)
- **Modal / Overlay Transitions**: `250ms cubic-bezier(0.16, 1, 0.3, 1)`
- **Story Segment Auto-advance**: `5000ms linear`
- **Like Heart Pop**: `scale(0) -> scale(1.3) -> scale(1.0)` over `300ms ease-out`
