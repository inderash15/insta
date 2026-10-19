# Acceptance Criteria — Insta Social Platform

## 1. Global Platform Acceptance Criteria
- **AC-01 Route Completeness:** Exactly 120 distinct routes must be registered in `routeRegistry.js` and reachable via React Router without dead links.
- **AC-02 Zero Generic Placeholders:** Every route must render dedicated, feature-specific UI with actual controls, forms, or data presentation.
- **AC-03 Client & Server Validation:** Every form submission must validate inputs on the client before submission and on the server via Zod schemas.
- **AC-04 Real Data Persistence:** All create, update, and delete actions must persist to MongoDB and reflect immediately across page reloads.
- **AC-05 Backend Authorization:** Protected operations (editing posts, deleting comments, viewing private accounts, accessing admin routes) must be enforced by server-side middleware.
- **AC-06 Error & Empty States:** Every data-driven page must gracefully handle loading skeletons, empty lists, and network errors.

---

## 2. Feature-Specific Acceptance Criteria

### A. Authentication & Security
- **AC-AUTH-1:** Password hashing uses bcrypt with at least 12 salt rounds.
- **AC-AUTH-2:** Authentication tokens are issued exclusively via `httpOnly`, `SameSite=Lax` cookies; zero tokens stored in `localStorage`.
- **AC-AUTH-3:** Protected routes redirect unauthenticated users to `/auth/login` with `?next=` return target.
- **AC-AUTH-4:** Admin routes (`/admin/*`) return 403 Forbidden for non-admin accounts.

### B. Social Graph & Privacy
- **AC-SOC-1:** Following a public account immediately increments follower/following counts.
- **AC-SOC-2:** Following a private account creates a pending follow request and does not expose private posts until approved.
- **AC-SOC-3:** Blocking a user immediately dissolves existing follow relationships in both directions and hides profiles from search.

### C. Posts & Media Feeds
- **AC-POST-1:** Uploads validate file MIME types (`image/*`, `video/*`) and enforce 15MB/50MB file size limits.
- **AC-POST-2:** Liking a post updates the like button state, increments `likesCount` atomically, and prevents duplicate likes.
- **AC-POST-3:** Deleting a post removes the post document, decrements user `postsCount`, and removes associated bookmarks.

### D. Stories & Ephemeral Content
- **AC-STORY-1:** Stories automatically cease appearing in queries after 24 hours (`expiresAt <= Date.now()`).
- **AC-STORY-2:** Story viewer records views with deduplication (a user is recorded in `viewers` only once).
- **AC-STORY-3:** Viewer lists are visible only to the story author.

### E. Reels & Video
- **AC-REEL-1:** Reels render native HTML5 video players with continuous loop and mute toggles.
- **AC-REEL-2:** Viewing a reel increments its `viewsCount` metric on the backend.

### F. Messaging & Real-Time
- **AC-MSG-1:** Messages sent in a conversation persist to MongoDB and broadcast via Socket.IO to connected participants.
- **AC-MSG-2:** Blocked users cannot send direct messages to the blocking user.

### G. Settings & Preferences
- **AC-SET-1:** Modifying preferences (theme, private account, notification toggles) persists to `User.preferences` in MongoDB.
- **AC-SET-2:** Revoking a session immediately invalidates the corresponding session token.
