# Bug Fix Report: Story Ownership & Story Tray Association

**Status:** Resolved & Verified  
**Date:** 2026-10-19  
**Target Application:** `C:\Users\minde\OneDrive\Desktop\insta`  

---

## 1. Executive Summary & Confirmed Root Cause

### The Symptom
When the logged-in user (e.g. `inderash`) published a new Story:
1. The leftmost bubble labeled **"Your story"** remained rendered with a static, empty, dashed border and a `+` badge.
2. An additional story bubble titled with the user's username (`inderash`) was rendered right next to "Your story" with the glowing gradient active story ring (as visible in user screenshot `media_1792427005673.png`).
3. Clicking "Your story" opened the creation modal (defaulting to Post creation), whereas clicking `inderash` opened the story viewer modal.
4. This created the exact visual illusion that the published story was either assigned to another user or caused a duplicate user profile bubble to appear in the tray.

### The Underlying Root Cause
The root cause was located in `frontend/src/components/feed/StoryTray.jsx`:
- **Static First Bubble**: `StoryTray.jsx` (lines 50–66) unconditionally rendered a static, empty "Your story" dashed bubble with `onClick={onOpenCreateStory}`, completely disconnected from the fetched `tray` state.
- **Unfiltered Tray Loop**: The backend endpoint `GET /api/stories/tray` intentionally includes the current user's story group (flagged with `isSelf: true`) and places it at index 0 of `tray`. However, `StoryTray.jsx` then iterated over the entire `tray` array using `{tray.map(group => ...)}` **without filtering out the authenticated user (`isSelf` / matching author ID)**.
- **Profile Page Disconnect**: In `frontend/src/pages/profile/ProfilePage.jsx`, the profile header avatar had a static decorative story gradient ring that had no connection to whether active stories actually existed, and clicking it did not open active stories in the `StoryViewerModal`.

---

## 2. Source of Truth & Fix Implementation

### A. Frontend Story Tray (`frontend/src/components/feed/StoryTray.jsx`)
1. **Isolated Self-Group & Followed Groups**:
   - Extracted `myStoryGroup` using `isGroupSelf` (checking `group.isSelf`, `group.author._id === user._id`, or username match).
   - Filtered out `myStoryGroup` from `otherStoryGroups = tray.filter((group) => !isGroupSelf(group))`.
2. **Illuminated "Your story" Bubble**:
   - If `hasMyStories`:
     - Renders active story ring: Emerald gradient (`from-emerald-500 to-green-400`) if close friends audience is present; otherwise vibrant Instagram gradient (`insta-story-gradient`).
     - Clicking the avatar directly opens `StoryViewerModal` for `myStoryGroup`.
     - The bottom-right `+` badge has `e.stopPropagation()` and triggers `onOpenCreateStory?.()`, allowing the user to add another story to their active story sequence.
   - If `!hasMyStories`:
     - Renders dashed border with `+` badge, clicking opens `onOpenCreateStory?.()`.
3. **No Duplicate Bubble**:
   - `otherStoryGroups` only maps other followed creators (`indhu`, etc.). The authenticated user is never rendered twice.

### B. Backend Active Stories Endpoint (`backend/src/controllers/storyController.js` & `backend/src/routes/stories.js`)
- Added `GET /api/stories/user/:userId`:
  - Retrieves all active stories for a given user ID or username (`expiresAt > Date.now()`).
  - Enforces authorization: if stories have `audience: 'close_friends'`, only the author or approved members on the author's `closeFriends` list can view them.
  - Checks mutual blocking filters.
  - Returns `storyGroup: { author, stories, hasUnviewed, hasCloseFriends, isSelf }`.
- Registered route `router.get('/user/:userId', requireAuth, getUserActiveStories)` before `router.get('/:id')`.

### C. Profile Page Integration (`frontend/src/pages/profile/ProfilePage.jsx`)
- Fetches active stories for the profiled user via `GET /api/stories/user/:userId`.
- When active stories exist:
  - Illuminates the profile avatar with the active story ring (`insta-story-gradient` or emerald for close friends).
  - Clicking the avatar immediately opens `StoryViewerModal`.
  - For the account owner (`isSelf`), a dedicated camera action button on the bottom-right corner allows uploading a new profile avatar without hijacking the story viewer click.
- Subscribes to real-time socket events `story:created` and `story:deleted` to dynamically update the profile ring without requiring a page refresh.

---

## 3. Files Changed

| File Path | Description of Changes |
| :--- | :--- |
| `frontend/src/components/feed/StoryTray.jsx` | Partitioned tray into `myStoryGroup` and `otherStoryGroups`; illuminated "Your story" avatar; enabled click-to-view and `+` to add more; removed duplicate bubble. |
| `frontend/src/pages/profile/ProfilePage.jsx` | Added `getUserActiveStories` fetch, dynamic active story ring on profile avatar, click-to-view `StoryViewerModal`, camera badge for avatar upload, and socket update listeners. |
| `backend/src/controllers/storyController.js` | Added `getUserActiveStories` controller with close friends privacy, block checking, and expiration filtering. |
| `backend/src/routes/stories.js` | Registered `GET /api/stories/user/:userId` route before generic `/:id`. |
| `backend/tests/storiesAndNotes.test.js` | Added automated integration test for `GET /api/stories/user/:userId`. |
| `frontend/src/test/storyAndCreation.test.jsx` | Added automated unit test verifying "Your story" illumination and duplicate bubble prevention in `StoryTray`. |

---

## 4. Automated Tests & Verification Results

### Backend Vitest Results (`backend`)
```bash
✓ tests/storiesAndNotes.test.js (6 tests) 4345ms
  ✓ 1. Stories: Enforces close_friends audience privacy
  ✓ 2. Stories: Authorizes viewer list inspection and records view with timestamps
  ✓ 3. Stories: Replies to story route directly into DM conversation
  ✓ 4. Highlights: Creates and retrieves user profile highlights
  ✓ 5. Notes: Enforces 60-character limit and audience filtering
  ✓ 6. Stories: User active stories API (GET /api/stories/user/:userId) correctly returns active stories for profile display
Total: 13 test files passed, 62/62 tests passing cleanly (100%).
```

### Frontend Vitest Results (`frontend`)
```bash
✓ src/test/storyAndCreation.test.jsx (4 tests)
  ✓ 1. StoryTray: Illuminates Your story and does NOT duplicate current user in tray
  ✓ 2. CreateModal: When locked to story mode, shows only New Story flow without Post/Reel tabs
  ✓ 3. CreateModal: When locked to reel mode, shows only Reel composer and audio track input
  ✓ 4. CreateModal: When locked to post mode, shows only Post composer
Total: 3 test files passed, 14/14 tests passing cleanly (100%).
```

### Production Build Verification (`frontend`)
```bash
npm run build
✓ 1833 modules transformed.
dist/index.html                   1.19 kB
dist/assets/index-BRYKrUCU.css   91.21 kB
dist/assets/index-C7RFe8wC.js   932.20 kB
✓ built in 3.18s
```

---

## 5. Acceptance Criteria Checklist

- [x] **Every Story belongs to the account that published it**: Guaranteed by server-side `author: req.user._id` extraction from authenticated JWT session cookie.
- [x] **Story appears under that account's avatar/profile**: Displayed inside "Your story" in the Story Tray and illuminated with active ring on the user's Profile avatar.
- [x] **No duplicate bubbles**: Current user never appears as a separate bubble in the story tray.
- [x] **Clicking "Your story" opens the correct owner's Story viewer**: Triggers `StoryViewerModal` for `myStoryGroup`.
- [x] **Adding additional stories**: Clicking `+` badge calls `onOpenCreateStory` without confusing or splitting active stories.
- [x] **Real-time updates**: `story:created` and `story:deleted` update the tray and profile ring immediately via Socket.IO without page refresh.
