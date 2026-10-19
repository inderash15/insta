# Project Aurora — Stories & Social Notes Architecture

## 1. Overview
Stories and Social Notes represent ephemeral, high-engagement communication formats in Project Aurora. Both features are designed with strict 24-hour expiration lifecycles, audience permission controls, seamless direct-messaging integration, and real-time Socket.IO synchronization.

---

## 2. Stories System Architecture

### 2.1 Data Model & Lifecycle
- **Storage**: Mongoose `Story` model (`backend/src/models/Story.js`).
- **Media**: JPEG/PNG images or MP4 videos, served statically via `/uploads/stories/`.
- **24-Hour Expiration**:
  - `expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)` calculated server-side.
  - Active queries filter `expiresAt: { $gt: now }`.
  - MongoDB TTL index `{ expiresAt: 1 }, { expireAfterSeconds: 0 }` purges documents as a supplementary cleanup mechanism.
- **Audience Privacy**:
  - `audience: 'everyone' | 'close_friends'`.
  - When `audience === 'close_friends'`, only the author or users enumerated in the author's `closeFriends` array can retrieve the story or see the author's ring in their feed tray.

### 2.2 Story Viewer & Interaction Specs
- **Horizontal Tray**: Renders at the top of the feed and direct messages. Distinguishes unviewed (vibrant gradient), viewed (slate dim), and close friends (emerald green ring).
- **Segmented Progression**: 5.0 seconds per segment with CSS linear progression.
- **Pause on Hold**: `pointerdown` / `touchstart` pauses the progress interval and hides chrome overlays.
- **Direct Message Replies**: `POST /api/stories/:id/reply` creates a direct message in the conversation thread with a rich `storyReply` preview card.
- **Author Viewer Analytics**: `GET /api/stories/:id/viewers` is strictly protected by owner-only authorization ($403\text{ Forbidden}$ for non-authors), returning real timestamps and viewer user entities.

---

## 3. Social Notes System Architecture

### 3.1 Data Model & Constraints
- **Storage**: Mongoose `Note` model (`backend/src/models/Note.js`).
- **Character Constraint**: Strictly enforced at $\le 60$ characters on both client and server. Requests with $>60$ characters are rejected with HTTP 400 Bad Request.
- **Audience Scope**:
  - `followers_follow_back` (Mutual followers only).
  - `close_friends` (Users in creator's close friends list).
- **Single Active Note Policy**: Posting a new note atomically replaces any existing active note by that author.
- **Speech Bubble UI**: Renders floating speech balloons with directional pointer tails over creator avatars.

### 3.2 Real-Time Note Synchronization
- **Publishing**: Emits `note:created` to connected mutual friends, instantly rendering the speech bubble in their tray without page reload.
- **Deletion**: Emits `note:deleted`, purging the bubble immediately.
- **Direct Message Replies**: Clicking any note opens the reply modal; sending a message triggers `POST /api/notes/:id/reply` and emits `message:created` into the recipient's DM inbox.
