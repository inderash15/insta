# Complete Social Content Lifecycle Audit: Stories, Posts, Reels & Notes

**Document:** `docs/audit/story-post-reel-notes-audit.md`  
**Application Root:** `C:\Users\minde\OneDrive\Desktop\insta`  
**Status:** Complete, Implemented & Verified  

---

## 1. Architecture Overview: Strict Separation of Content Lifecycles

In Project Aurora, each content type represents a distinct social intent with its own data model, storage requirements, lifecycle policies, viewer interfaces, and distribution mechanics:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CONTENT TYPE LIFECYCLES                                       │
├─────────────────┬──────────────────┬──────────────────────┬─────────────────────────────────────┤
│ Content Type    │ Primary Model    │ Expiration / TTL     │ Primary Surface & Viewer            │
├─────────────────┼──────────────────┼──────────────────────┼─────────────────────────────────────┤
│ 1. Story        │ Story.js         │ 24 Hours (strict)    │ Story Tray -> StoryViewerModal      │
│ 2. Post         │ Post.js          │ Permanent            │ Feed Stream, Profile Grid -> Modal  │
│ 3. Reel         │ Reel.js          │ Permanent            │ Reels Feed (PulseRank Engine)       │
│ 4. Social Note  │ Note.js          │ 24 Hours (strict)    │ Notes Tray (Direct DMs) & Bubble    │
└─────────────────┴──────────────────┴──────────────────────┴─────────────────────────────────────┘
```

---

## 2. Detailed Lifecycle Breakdown

### A. Stories Lifecycle
1. **Creation & Media Storage**:
   - Media: Photo or video uploaded via `multer` (`/uploads/stories/`).
   - Server-derived `author: req.user._id` (never trusts client-supplied owner ID).
   - Server-enforced expiration timestamp: `expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)`.
   - Optional caption (max 300 characters).
   - Audience policy: `everyone` (all followers) vs `close_friends` (only users in author's `closeFriends` array).
2. **Persistence & Data Model (`backend/src/models/Story.js`)**:
   - Fields: `author`, `mediaUrl`, `mediaType`, `audience`, `caption`, `expiresAt`, `viewers` (array of `{ user, viewedAt }`), `reactions` (array of `{ user, emoji, createdAt }`).
3. **Tray Rendering (`StoryTray.jsx`)**:
   - Authenticated user's active story group is bound to **"Your story"**.
   - If active stories exist: illuminated with Instagram story gradient (or emerald green if close friends).
   - Clicking avatar opens `StoryViewerModal`.
   - Clicking `+` badge calls `onOpenCreateStory` in Story-only mode.
   - Filtered `otherStoryGroups` ensures the user is never duplicated as a second bubble.
4. **Viewer Modal (`StoryViewerModal.jsx`)**:
   - Segmented progress bars with 5-second automatic progression.
   - Pause on press/hold, resume on release.
   - Next/Previous segment tapping.
   - Video mute/unmute control.
   - Reaction buttons (`❤️`, `🔥`, `😂`, `👏`).
   - DM reply input sending direct message tagged with story thumbnail.
   - Author-only viewer inspection sheet with viewed timestamps (forbidden to non-authors).
5. **Profile Integration (`ProfilePage.jsx`)**:
   - Displays story ring around avatar when active stories exist via `GET /api/stories/user/:userId`.
   - Clicking avatar opens `StoryViewerModal`. Dedicated camera badge enables avatar upload.

---

### B. Posts Lifecycle
1. **Creation & Media Storage**:
   - Media: Images or videos uploaded via `multer` (`/uploads/posts/`).
   - Caption & hashtags up to 2,200 characters with live character counter.
   - Persisted in `Post.js` collection with `author: req.user._id`.
2. **Distribution & Surfaces**:
   - Displayed in chronologically sorted and paginated Feed Stream (`/home`).
   - Displayed in Profile 3-column Grid (`/users/:username`).
   - Never displayed in the Story Tray or Reels Feed.
3. **Interactions & Modals**:
   - Atomic Like/Unlike with socket synchronization.
   - Commenting and comment deletion.
   - Bookmarking and Bookmark Collections integration (`/feed/saved`).
   - Full post modal (`PostDetailModal.jsx`).

---

### C. Reels Lifecycle
1. **Creation & Validation**:
   - Video upload only (`video/mp4`, `video/webm`).
   - Validated mimetype: rejects images or invalid files with explicit user feedback.
   - Audio track title input (defaults to `'Original Audio'`).
   - Caption & hashtags up to 2,200 characters.
   - Persisted in `Reel.js` collection.
2. **PulseRank Recommendation Engine**:
   - Powered by Aurora's original multi-objective ranking pipeline:
     1. Candidate Retrieval (unseen reels, eligible following + discovery).
     2. Safety & Moderation Filter (excludes blocked users, reported content, explicit negative feedback).
     3. Feature Extraction (engagement rate, completion rate, freshness half-life decay, topic affinity).
     4. Scoring Function: $\text{Score} = w_1 \cdot P(\text{like}) + w_2 \cdot P(\text{comment}) + w_3 \cdot P(\text{finish}) + w_4 \cdot \text{Freshness} - w_5 \cdot \text{SkipPenalty}$.
     5. Diversity & Exploration Reranker (author fatigue penalty, genre diversification).
3. **Playback & Telemetry**:
   - Vertical fullscreen format with snap scrolling.
   - Play/pause toggle, mute/unmute.
   - Watch time telemetry (`POST /api/reels/:id/watch-time`).
   - "Why am I seeing this?" modal displaying transparent score breakdown.

---

### D. Notes Lifecycle
1. **Creation & Constraints**:
   - Text entry strictly capped at 60 characters.
   - Optional mood emoji.
   - Audience: Mutual follows (`followers_follow_back`) or Close Friends (`close_friends`).
   - Server-enforced 24-hour expiration (`expiresAt: Date.now() + 24h`).
2. **Surfaces & Viewer**:
   - Rendered in horizontal Notes Tray at the top of Direct Messages (`/direct`).
   - Clicking a friend's note opens `NoteReplyModal.jsx` to send a direct message reply.
   - Clicking own note allows editing thought or deleting note.

---

## 3. Creation Entrypoint Audit & Isolation

### Before: Unified Composer Confusion
Previously, clicking `+` on "Your story" in `FeedPage` opened a single generic modal with 3 tabs (`Post`, `Reel`, `Story`) defaulting to `Post`. The user saw "CREATE NEW POST" instead of story creation, causing confusion and risk of posting stories to the feed.

### After: Strict One Action -> One Flow
Every creation trigger opens an isolated, dedicated composer locked to the intended content type:

1. **`StoryTray '+' Badge`** → Calls `setCreateModalState({ isOpen: true, mode: 'story', lockMode: true })`.
   - Tab switcher is hidden.
   - Modal title is "NEW STORY", subtitle explains 24h expiration.
   - Media picker accepts photos and videos up to 50MB.
   - Audience selector displays "Everyone" and "Close Friends" options.
   - Submit button is "Share to Story" (or "Share to Close Friends").
2. **`Sidebar Create -> Create Post`** → Opens `CreateModal` with `mode: 'post', lockMode: true`.
   - Title: "CREATE NEW POST".
   - Caption & hashtags up to 2200 chars.
   - Media up to 100MB.
   - Submits to `POST /api/posts`.
3. **`Sidebar Create -> Create Reel`** → Opens `CreateModal` with `mode: 'reel', lockMode: true`.
   - Title: "CREATE NEW REEL".
   - Requires video file; validates mimetype.
   - Audio track title input.
   - Submits to `POST /api/reels`.
4. **`Sidebar Create -> Share a Note`** → Opens `CreateNoteModal`.
   - Title: "Share a thought".
   - Max 60 characters with live counter.
   - Submits to `POST /api/notes`.

---

## 4. Socket.IO Real-Time Synchronization

The platform uses event-driven Socket.IO broadcasts for instantaneous UI updates without manual refreshes:

| Event Name | Trigger | Recipients | UI Reaction |
| :--- | :--- | :--- | :--- |
| `story:created` | New story published | All connected clients | Re-fetches story tray & profile ring |
| `story:deleted` | Story deleted or expired | All connected clients | Removes story from tray & updates profile |
| `story:viewed` | Viewer watches story | Story author | Increments author's live viewer count |
| `post:created` | New feed post | Followers & author | Prepends post to feed & profile |
| `post:deleted` | Post deleted | All clients | Removes post card from feed |
| `note:created` | Note shared | Eligible mutuals | Updates Notes tray in Direct Messages |
| `note:deleted` | Note deleted | Eligible mutuals | Removes note bubble |

---

## 5. Verification Summary

- **Backend Integration Tests**: 13 test files passed, 62/62 tests passing (100%).
- **Frontend Unit Tests**: 3 test files passed, 14/14 tests passing (100%).
- **Production Build**: `vite build` completed in 3.18s with 0 errors.
- **Story Ownership**: Resolved. "Your story" lights up directly, and user is never duplicated.
