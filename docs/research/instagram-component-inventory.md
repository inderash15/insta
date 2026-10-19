# Instagram Component Inventory & Design Anatomy

## 1. Component Hierarchy & Atomic Architecture

This document catalogs the component hierarchy, props interface, visual anatomy, states, and accessibility considerations for the Instagram web application.

```
App
├── AppShell
│   ├── NavigationSidebar (Desktop / Tablet)
│   │   ├── BrandWordmark / MiniLogo
│   │   ├── NavItem (Home, Search, Explore, Reels, Messages, Notifications, Create, Profile, More)
│   │   └── SearchFlyout / NotificationFlyout
│   ├── MobileTopBar
│   ├── MobileBottomNav
│   └── MainContentArea
│       ├── FeedSurface
│       │   ├── StoriesTray
│       │   │   ├── StoryRingItem (Unseen / Seen / CloseFriends / OwnAdd)
│       │   ├── FeedPostCard
│       │   │   ├── PostHeader (Avatar, Username, Timestamp, MoreMenu)
│       │   │   ├── PostMediaCarousel (Image, Video, IndicatorDots, NavArrows)
│       │   │   ├── PostActionBar (LikeHeart, CommentBubble, ShareAirplane, SaveRibbon)
│       │   │   ├── PostLikesMetadata
│       │   │   ├── PostCaptionBlock
│       │   │   ├── PostCommentsPreview
│       │   │   └── PostCommentComposer
│       │   └── SuggestedUsersAside
│       ├── ProfileSurface
│       │   ├── ProfileHeader (Avatar, Bio, Stats, ActionButtons)
│       │   ├── HighlightBar
│       │   ├── ProfileTabNav (Posts, Reels, Saved, Tagged)
│       │   └── ProfileMediaGrid
│       ├── ExploreSurface
│       │   ├── CategoryPills
│       │   └── ExploreMasonryGrid (Standard 1x1 + Featured 2x2 spans)
│       ├── ReelsSurface
│       │   ├── ReelVerticalScrollContainer
│       │   ├── ReelPlayer
│       │   ├── ReelActionRail (Like, Comment, Share, Save, Audio)
│       │   └── ReelBottomMeta (Creator, Caption, AudioTrackMarquee)
│       ├── DirectSurface
│       │   ├── ConversationListPane
│       │   ├── ChatHeader
│       │   ├── MessageStream (Grouped bubbles, sent/received)
│       │   └── ChatPillComposer
│       └── CreateModal
│           ├── CreateHeader
│           ├── MediaDropzone
│           ├── AspectRatioPicker
│           └── CaptionAndDetailsPanel
```

---

## 2. Component Specifications

### 2.1 NavigationSidebar
- **Location**: `frontend/src/components/NavigationSidebar.jsx` (or within `AppShell.jsx`).
- **Props**: `currentRoute`, `unreadMessagesCount`, `unreadNotificationsCount`, `currentUser`.
- **States**:
  - `Expanded`: 244px wide, full wordmark, icon + text label.
  - `Collapsed`: 72px wide, mini camera/glyph logo, centered icons, tooltips on hover.
  - `SearchOpen`: Flyout panel slides out from left (397px wide).
  - `NotificationsOpen`: Flyout panel slides out from left (397px wide).
- **Accessibility**: ARIA `role="navigation"`, `aria-label="Main Navigation"`, keyboard tab index and focus rings.

### 2.2 StoriesTray & StoryRingItem
- **Location**: `frontend/src/components/StoriesTray.jsx`.
- **Anatomy**:
  - Outer ring gradient: `linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)` (unseen), `#363636` (seen), `#10B981` (close friends).
  - Avatar image: `w-[58px] h-[58px] rounded-full object-cover p-[2px] bg-black`.
  - Username label: `text-xs text-[#F5F5F5] truncate max-w-[74px] text-center`.
- **Interactions**: Click opens StoryViewer full-screen modal at index; horizontal navigation arrow buttons appear when scrollable.

### 2.3 FeedPostCard
- **Location**: `frontend/src/components/FeedPostCard.jsx`.
- **Anatomy**:
  - Header: Avatar (`32px`), Username (`font-semibold`), Time ago (`text-secondary`), More options modal trigger.
  - Media: Aspect ratio container (`aspect-square` or `aspect-[4/5]`), double-tap to like trigger with heart pop animation.
  - Action Row: Like heart (animates and turns `#ED4956` when liked), Comment button, Share button, Bookmark button.
  - Likes counter: e.g. "1,240 likes".
  - Caption: Username in bold + caption text + "more" toggle for captions longer than 120 chars.
  - Comment composer: Inline input with auto-growing textarea and "Post" submit button.

### 2.4 ProfileMediaGrid
- **Location**: `frontend/src/components/ProfileMediaGrid.jsx`.
- **Layout**: CSS Grid `grid-cols-3 gap-1 md:gap-7`.
- **Tiles**: Strictly `aspect-square`, lazy-loaded images, hover overlay displaying like count and comment count icons.
- **Corner Badges**: Multi-image icon (stacked squares) or Reel video icon (camera) positioned at `top-2 right-2`.

### 2.5 DirectChatPane & MessageBubble
- **Location**: `frontend/src/pages/DirectConversationPage.jsx`.
- **Anatomy**:
  - Message bubble:
    - Sent: `bg-gradient-to-r from-[#7000ff] via-[#9400d3] to-[#c800ff] text-white rounded-[20px] rounded-br-[4px]`.
    - Received: `bg-[#262626] text-white rounded-[20px] rounded-bl-[4px]`.
  - Double tap to like: Adds small heart badge to bottom-right of bubble.
  - Input: Pill container with smile emoji button, file upload button, microphone icon, text input, and heart instant reaction button.

### 2.6 CreatePostModal
- **Location**: `frontend/src/components/CreatePostModal.jsx`.
- **Steps**:
  1. `Media Selection`: Drag and drop or browse files.
  2. `Crop & Aspect`: 1:1 square, 4:5 portrait, 16:9 landscape options with visual preview.
  3. `Details & Caption`: Side-by-side preview with caption textarea, character counter, location picker, and "Share" submit action.
