# Project Aurora — Behavioral Specification & Observable Reference Analysis

## 1. Overview
This document specifies the observable behaviors, states, transitions, failure recovery, and real-time synchronizations verified through direct REA browser sessions, network inspection, and reverse-engineering of modern social reference surfaces.

---

## 2. Feature Behavior Specifications

### 2.1 Stories Tray & Viewer
- **Initial State**:
  - Horizontal tray displayed at the top of the Home Feed and Direct Inbox.
  - Avatar items categorized into: (a) Current User Add-Story action with `+` pill, (b) Followed users with unread stories (vibrant gradient ring), (c) Followed users with viewed stories (muted gray ring), (d) Close Friends stories (emerald green ring).
- **Available Actions**:
  - Click any user avatar in the tray to enter fullscreen Story Viewer.
  - In Viewer: Tap/click right half to advance segment; tap/click left half to regress segment.
  - Press and hold (pointerdown/touchstart) to pause segment timer and hide overlay UI.
  - Send quick emoji reaction or text reply in footer reply bar.
  - If viewer is the story owner: Click Viewer List button to reveal viewer accounts with exact timestamps.
  - Swipe down or press `Escape` / `X` button to dismiss viewer.
- **Resulting Visible State**:
  - Active segment fills screen with high-resolution image/video.
  - Segment progress bars at top: completed bars filled 100%, active bar animates 0% to 100% over 5.0 seconds, pending bars at 0%.
  - When all segments for a user complete, viewer auto-advances to the next user in tray.
- **Persistence Across Refresh**:
  - Viewed state persisted in backend `StoryView` / `Story.viewers` record.
  - On page refresh, user's ring transitions from vibrant gradient to muted gray.
- **Real-time Synchronization**:
  - When followed user posts a story: `story:published` socket event adds their ring to the tray live without page reload.
  - When owner opens viewer list: live socket `story:viewed` updates count and appends viewer.
- **Failure & Recovery**:
  - If media fails to load, segment displays retry button with fallback placeholder and pauses timer.
- **Responsive Differences**:
  - Desktop: Centered 9:16 aspect-ratio viewer with darkened modal backdrop and navigation arrows.
  - Mobile: Fullscreen native viewport with touch gestures (swipe-to-dismiss, long-press pause).
- **Confidence Level**: High (Verified via REA local browser and reference captures).

---

### 2.2 Social Notes
- **Initial State**:
  - Notes horizontal tray positioned at the top of Direct Messages and optionally atop Feed.
  - First bubble displays logged-in user's active note or a "+ Share a thought..." creation prompt.
  - Subsequent bubbles show mutual followers' active notes (up to 60 characters) floating in a rounded speech balloon above their avatars.
- **Available Actions**:
  - Click "+" to open Note Creator modal. Enter note text (max 60 chars), select audience (Followers you follow back / Close Friends), and click Share.
  - Click on another user's note bubble to open Note Reply sheet. Enter text message; sending forwards directly into conversation thread with a note context quote.
  - Click on own active note to delete or replace.
- **Resulting Visible State**:
  - Speech bubble floats above avatar with subtle tail pointer.
  - Bubble truncates cleanly with ellipsis if necessary, expanding on click/hover.
- **Persistence Across Refresh**:
  - Note record stores `expiresAt` set to 24 hours from creation. Server filters out expired notes via query index.
- **Real-time Synchronization**:
  - Note creation emits `note:created` to eligible followers, instantly popping the speech bubble into their tray.
  - Note deletion emits `note:deleted`, removing the bubble immediately without refresh.
- **Failure & Recovery**:
  - Character counter strictly enforces 60 character limit client-side and validates server-side with 400 Bad Request if exceeded.
- **Confidence Level**: High (Observed across verified mobile and web sessions).

---

### 2.3 Reels & PulseRank Recommendations
- **Initial State**:
  - Vertical snap-scroll feed showing ranked 9:16 short-form video items.
  - Right action rail: Creator Avatar (with follow button if not following), Like Button with count, Comment Button with count, Share Button, Bookmark Button, and Three-Dot Overflow Menu ("Not Interested", "Why Am I Seeing This?").
  - Bottom-left overlay: Creator handle, verified badge, caption with expand toggle, sound/audio ticker.
- **Available Actions**:
  - Scroll down (Wheel, Touch Swipe, Down Arrow) to advance to next ranked candidate.
  - Single tap video to toggle Play / Pause.
  - Double tap video to trigger heart animation and like.
  - Click "Not Interested" to immediately hide video and apply negative topic penalty to PulseRank.
  - Click "Why am I seeing this?" to view explainability factors (e.g., "Because you follow @x", "You engaged with #design").
- **Persistence Across Refresh**:
  - Watched status, likes, saves, and negative feedback persist in database and telemetry logs.
- **Real-time Synchronization**:
  - Like, comment, and save counts update live across connected sessions.
- **Failure & Recovery**:
  - If a video fails to load, player displays retry icon and smoothly skips to next candidate on scroll.
- **Responsive Differences**:
  - Desktop: Centered 9:16 container with right-side action rail.
  - Mobile: Fullscreen 100vw/100vh with overlaid bottom controls.
- **Confidence Level**: High (Observable UI verified; ranking logic is our original PulseRank algorithm).

---

### 2.4 Feed & Post Interactions
- **Initial State**:
  - Chronological + relevance blended feed of posts from followed accounts and recommended creators.
  - Post card includes: Author header, carousel/single media, like/comment/share/bookmark action bar, like count, caption, comment preview, and comment input.
- **Available Actions**:
  - Click Heart / Double click media: Like post.
  - Click Bookmark: Save to bookmarks collection.
  - Submit Comment: Appends comment instantly.
- **Real-time Synchronization**:
  - Real-time updates via Socket.IO: `post:liked`, `post:unliked`, `post:commented`, `post:deleted`.
- **Confidence Level**: High (Verified by 52 passing backend tests and REA browser tests).

---

### 2.5 Direct Messages & Presence
- **Initial State**:
  - Conversation list sorted by most recent message.
  - Online indicators (green dot) on active users with activity status enabled.
- **Available Actions**:
  - Click conversation to open thread.
  - Type message: Emits `typing:start` and updates recipient's typing indicator.
  - Send message: Appends message, broadcasts `message:created`, marks delivered, marks seen when opened.
- **Confidence Level**: High (Verified by test suite and live sessions).
