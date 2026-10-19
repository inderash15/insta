# Instagram Interaction Matrix & Micro-Interactions

## 1. Interaction System Architecture

This matrix details the triggers, feedback mechanisms, optimistic client updates, API network payloads, error rollbacks, and accessibility handling for every major user interaction in the Instagram application.

---

## 2. Comprehensive Interaction Matrix

| Interaction ID | User Action | Trigger / Event | UI Micro-Interaction | Optimistic State Update | Backend API Call | Error Rollback Behavior | Keyboard / A11y Shortcut |
|---|---|---|---|---|---|---|---|
| **INT-001** | Like Feed Post | Click heart icon or double-tap media | Heart icon pops (scale 1.25 -> 1.0) and turns `#ED4956`; on double-tap, large white heart appears centered with fade-out animation | Increment likes count by 1, mark `isLiked: true` immediately | `POST /api/posts/:id/like` | Revert heart to outline, decrement likes count, show toast | Space or Enter on focused heart button |
| **INT-002** | Unlike Feed Post | Click filled heart icon | Icon changes from red filled to outline | Decrement likes count by 1, mark `isLiked: false` | `POST /api/posts/:id/unlike` | Revert to filled red, increment count | Space or Enter on focused heart button |
| **INT-003** | Bookmark / Save Post | Click ribbon icon | Ribbon icon turns filled `#F5F5F5` | Toggle `isSaved: true` | `POST /api/posts/:id/save` | Revert to outline | Space or Enter on bookmark button |
| **INT-004** | Post Inline Comment | Click "Post" or press Enter in composer | Inline spinner in button, comment immediately added to bottom of preview list | Add comment to local list with `pending: true` badge | `POST /api/posts/:id/comments` | Remove comment from list, restore comment text in input, show error banner | Enter key submits (Shift+Enter for newline) |
| **INT-005** | Send Direct Message | Type in pill input and press Enter | Send button activates; bubble renders immediately on right side in purple gradient | Message added to conversation stream with timestamp "Just now" | Socket.IO `send_message` + `POST /api/conversations/:id/messages` | Display red retry badge next to bubble | Enter key submits; ESC exits thread |
| **INT-006** | Follow User | Click "Follow" button | Button changes from Blue (`#0095F6`) to Gray (`#363636`) with label "Following" | Increment following count on current user and follower count on target | `POST /api/users/:id/follow` | Revert button to Blue "Follow", restore counters | Space or Enter |
| **INT-007** | Advance Stories | Click right side or press ArrowRight | Progress bar of current story completes; next story transitions with slide/crossfade | Current story marked as viewed; next story index activated | `POST /api/stories/:id/view` | Fallback to current story if load fails | ArrowRight / ArrowLeft / Space to pause |
| **INT-008** | Reel Navigation | Scroll mouse wheel or ArrowDown | Current reel snaps upward; next vertical reel starts autoplay with audio | Update active reel index | `GET /api/reels?cursor=...` | Snap back to previous reel | ArrowDown / ArrowUp / M to mute |
| **INT-009** | Open Search Panel | Click Search in sidebar | Left sidebar collapses to rail (72px); 397px search drawer slides in from left with auto-focused input | `isSearchOpen: true` | Debounced `GET /api/search?q=...` (300ms) | Display "No results found" placeholder | `/` shortcut to focus search, ESC to close |
| **INT-010** | Open Notifications | Click Heart in sidebar | Sidebar collapses to rail; 397px notifications flyout opens with categorized tabs | `isNotificationsOpen: true`, mark unread count as 0 | `GET /api/notifications` + `POST /api/notifications/mark-read` | Revert badge count | ESC to close flyout |
| **INT-011** | Open Create Modal | Click "Create" in sidebar | Dark backdrop blur fades in; centered modal opens with drag-and-drop zone | `isCreateModalOpen: true` | Pre-signed upload url or direct multipart form | Display upload error toast | ESC to dismiss modal |
| **INT-012** | Carousel Next/Prev | Click left/right arrows on post | Image translates 100% horizontally; active dot indicator shifts | Update carousel index | Local component state | N/A | ArrowLeft / ArrowRight when focused |

---

## 3. Optimistic UI & Socket.IO Real-time Architecture

1. **Deduplication Strategy**: Every locally generated message or comment is assigned a temporary unique ID (`temp-${Date.now()}`). When the backend Socket.IO broadcast or HTTP response arrives, messages are deduplicated using `message._id` to prevent double-rendering.
2. **Network Resilience**: In case of transient disconnects, Socket.IO reconnects automatically with exponential backoff and syncs the latest message offset from the REST endpoint.
