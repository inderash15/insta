# Real-Time Presence & Read Receipts Implementation Report

## Executive Summary
This document reports on the production-grade implementation of genuine real-time presence detection and Instagram-style read receipts across the full-stack social network at `C:\Users\minde\OneDrive\Desktop\insta`.

---

## 1. Files Changed

### Backend Core
- [`backend/src/models/User.js`](file:///C:/Users/minde/OneDrive/Desktop/insta/backend/src/models/User.js):
  - Added `lastActiveAt: { type: Date, default: Date.now }`.
  - Added `preferences.showActivityStatus: { type: Boolean, default: true }`.
  - Added `preferences.showReadReceipts: { type: Boolean, default: true }`.
- [`backend/src/models/Message.js`](file:///C:/Users/minde/OneDrive/Desktop/insta/backend/src/models/Message.js):
  - Added `sentAt: { type: Date, default: Date.now }`.
  - Added `deliveredTo: [{ user: ObjectId, deliveredAt: Date }]`.
  - Maintained `readBy: [{ user: ObjectId, readAt: Date }]`.
- [`backend/src/config/socket.js`](file:///C:/Users/minde/OneDrive/Desktop/insta/backend/src/config/socket.js):
  - Implemented authenticated handshake middleware with JWT verification.
  - Built an in-memory presence registry `Map<string, Set<string>>` tracking active socket IDs per user.
  - Multi-connection handling: users remain online if any tab/device remains connected; offline only when all sockets disconnect.
  - Server-generated timestamps for `lastActiveAt`.
  - Implemented events: `join_user`, `presence:online`, `presence:offline`, `presence:update`, `online_users_list`, `message:send`, `message:sent`, `message:delivered`, `message:read`, `message:receipt`, `typing_start`, `typing_stop`.
- [`backend/src/controllers/messageController.js`](file:///C:/Users/minde/OneDrive/Desktop/insta/backend/src/controllers/messageController.js):
  - Integrated `isUserOnline` check to populate `deliveredTo` on message creation.
  - Added real-time emissions for `message:sent`, `message:delivered`, `messages_read`, and `message:receipt`.
  - Marked messages read before querying in `getMessages` and reset unread counts atomically.
- [`backend/src/controllers/userController.js`](file:///C:/Users/minde/OneDrive/Desktop/insta/backend/src/controllers/userController.js):
  - Respects `preferences.showActivityStatus` by stripping `lastActiveAt` from public profile payload when false.
- [`backend/src/controllers/settingsController.js`](file:///C:/Users/minde/OneDrive/Desktop/insta/backend/src/controllers/settingsController.js):
  - Enabled updating `showActivityStatus` and `showReadReceipts` preferences in `PUT /api/settings/preferences`.

### Frontend Core
- [`frontend/src/context/SocketContext.jsx`](file:///C:/Users/minde/OneDrive/Desktop/insta/frontend/src/context/SocketContext.jsx):
  - Reconnection recovery with automatic re-subscription (`join_user` and `presence:subscribe`).
  - Added `lastSeenMap` tracking user disconnection timestamps.
  - Supported presence aliases (`presence:online`, `presence:offline`, `presence:update`).
- [`frontend/src/pages/messages/DirectConversationPage.jsx`](file:///C:/Users/minde/OneDrive/Desktop/insta/frontend/src/pages/messages/DirectConversationPage.jsx):
  - Implemented complete message lifecycle: `Sending…` -> `Sent` -> `Delivered` -> `Seen` / `Failed to send (Retry)`.
  - Optimistic message rendering with immediate client feedback.
  - Safe inline retry mechanism for failed messages.
  - Real-time `Seen [time]` with recipient's 14px mini-avatar.
  - Accurate presence display: green dot strictly when recipient is online; relative time (`Active 5m ago`, `Active 2h ago`, `Active yesterday`) when offline.
  - 30-second live ticker for in-place relative time updates.
  - Triple-bounce animated typing bubble matching Instagram Web.
- [`frontend/src/pages/messages/MessagesPage.jsx`](file:///C:/Users/minde/OneDrive/Desktop/insta/frontend/src/pages/messages/MessagesPage.jsx):
  - Synchronized conversation list and active chat panel with the same message status lifecycle and presence system.

### Test Suites
- [`backend/tests/presenceAndReceipts.test.js`](file:///C:/Users/minde/OneDrive/Desktop/insta/backend/tests/presenceAndReceipts.test.js):
  - 6 new automated end-to-end integration tests using `socket.io-client` and `supertest`.

---

## 2. Presence Architecture & Event Flow

### Presence Registry
```
Client A (Tab 1)  ──┐
                    ├──> Socket.IO Server [onlineUsers Map]
Client A (Tab 2)  ──┘       Key: userId -> Set([socketA1, socketA2])
```
1. **Connection & Handshake:**
   - Socket handshake verifies session token from cookies or auth headers.
   - Handshake sets `socket.userId` securely. Client identity cannot be forged.
   - User socket ID added to `onlineUsers.get(userId)`.
   - If user had 0 active sockets, broadcast `presence:online` / `user_online` to all connected clients.
   - Initial snapshot of all online users emitted back to connecting socket via `online_users_list` / `presence:update`.
2. **Multi-Tab / Multi-Device Integrity:**
   - When Tab 1 disconnects, `userSockets.delete(tab1.id)`. Since Tab 2 is still in the set (`size > 0`), the user remains **online**.
   - When Tab 2 disconnects, `size === 0`. The user is deleted from `onlineUsers`. A server-generated `lastActiveAt` timestamp is saved to MongoDB, and `presence:offline` / `user_offline` is broadcast with `{ userId, lastActiveAt }`.
3. **No False Online States:**
   - `isOnline: true` is **never persisted in MongoDB as unquestioned truth**. Online status is derived purely from in-memory active sockets. Upon server restart, presence is rebuilt dynamically as sockets reconnect.

---

## 3. Message Status Lifecycle

```
[User Types] ──> [Optimistic Message (Sending…)]
                       │
                       ▼
                 [POST /api/conversations/:id/messages] 
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[Server DB Error]           [Server DB Success]
      │                              │
[Status: Failed]              [Status: Sent]
[Action: Retry]                      │
                                     ▼
                      [Recipient Socket Connected?]
                            │              │
                           Yes             No
                            │              │
                   [Status: Delivered]     │
                            │              │
                            └──────┬───────┘
                                   ▼
                    [Recipient Opens Conversation]
                                   │
                                   ▼
                          [Status: Seen [time]]
                          [+ Recipient Avatar]
```

---

## 4. Database Changes

### `User` Schema
```javascript
{
  lastActiveAt: { type: Date, default: Date.now },
  preferences: {
    showActivityStatus: { type: Boolean, default: true },
    showReadReceipts: { type: Boolean, default: true },
    // ... existing preferences
  }
}
```

### `Message` Schema
```javascript
{
  conversation: { type: ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, default: '', trim: true },
  mediaUrl: { type: String, default: null },
  mediaType: { type: String, enum: ['image', 'video', null], default: null },
  sentAt: { type: Date, default: Date.now },
  deliveredTo: [{
    user: { type: ObjectId, ref: 'User' },
    deliveredAt: { type: Date, default: Date.now }
  }],
  readBy: [{
    user: { type: ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  isDeleted: { type: Boolean, default: false }
}
```

---

## 5. Privacy & Authentication Protections

1. **Authentication Verification:** Handshake authenticates users using HTTP-only session cookies and rejects impersonation attempts.
2. **Conversation Authorization:** Socket and REST message endpoints verify conversation membership before delivering messages, marking read, or joining rooms.
3. **Sender ID Forgery Prevention:** Sender IDs are derived strictly from `req.user._id` or verified `socket.userId`.
4. **Activity Status Opt-Out:** When a user sets `showActivityStatus: false`, `lastActiveAt` is stripped from public profile responses and their active status is suppressed.
5. **Idempotent Read Receipts:** Read receipts are recorded atomically with `$push` conditional on `'readBy.user': { $ne: currentUserId }`, preventing duplicate entries.

---

## 6. Tests Executed & Actual Results

### Full Test Suite Run: `npm run test:all`
```
Backend Test Files: 10 passed (10)
Backend Tests:      43 passed (43)
Duration:           88.52s

Frontend Test Files: 2 passed (2)
Frontend Tests:     10 passed (10)
Duration:           6.72s

Total Tests:        53 passed out of 53 (100% pass rate)
```

### Dedicated Integration Tests (`backend/tests/presenceAndReceipts.test.js`)
- `1. Connects user socket, marks online, and tracks presence snapshot`: **PASSED**
- `2. Multi-connection: Closing 1 of 2 tabs keeps user online; closing both marks offline with lastActiveAt`: **PASSED**
- `3. Reconnecting a socket restores user presence`: **PASSED**
- `4. Real-time Sent, Delivered, and Seen message receipt lifecycle`: **PASSED**
- `5. Enforces conversation authorization and privacy rules`: **PASSED**
- `6. Respects showActivityStatus privacy preference by hiding lastActiveAt for other users`: **PASSED**

### Production Build
```
vite build:
✓ 1829 modules transformed.
dist/index.html                   1.19 kB
dist/assets/index-DXpagufy.css   84.85 kB
dist/assets/index-hrNqC08J.js   889.69 kB
✓ built in 9.07s (0 errors)
```

---

## 7. Remaining Limitations & Production Deployment Requirements
- **Horizontal Scaling:** When scaling to multiple backend instances behind a load balancer, attach Redis Adapter (`@socket.io/redis-adapter`) to synchronize the `onlineUsers` presence registry and broadcast across cluster nodes.
- **Push Notifications:** For mobile or backgrounded browser sessions, combine delivery events with Web Push (Service Worker) notifications when recipient sockets are offline.
