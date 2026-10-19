# Testing Matrix & Verification Strategy

This document details automated test suites, testing methodology, and instructions for verifying the full stack.

## Test Suites Summary

### Backend Vitest Integration Tests (`backend/tests`)
1. **`health.test.js`**: Health check endpoints, database status report, 404 handler, and CORS pre-flight. (2 tests)
2. **`auth.test.js`**: User registration, bcrypt hash verification, duplicate prevention, login, JWT httpOnly cookie issuance, `/api/auth/me` session recovery, and logout. (12 tests)
3. **`social.test.js`**: Public/private follow workflows, pending request approvals, atomic follower count sync, user blocking, and relationship status queries. (5 tests)
4. **`posts.test.js`**: Post creation, image upload simulation, hashtags and mention parsing, home feed retrieval, like/unlike toggling, comment lifecycle, bookmarks, and privacy boundaries. (7 tests)
5. **`reels.test.js`**: Video reel uploads, views count increment, vertical feed retrieval, and creator deletion. (3 tests)
6. **`messages.test.js`**: Direct messaging thread creation, message dispatch, participant authorization, and blocked user communication prevention. (2 tests)
7. **`notifications.test.js`**: Generation of notifications on follow and post like, unread counts, and marking notifications as read. (1 test)
8. **`admin.test.js`**: Password updates, content report submission, admin role authorization, report resolution, and audit log generation. (2 tests)
9. **`settings.test.js`**: User preferences mutation & persistence, active session listing and revocation, collection creation and post bookmarking, and contact support ticket submission. (3 tests)

**Total Backend Tests: 37 tests across 9 suites (100% passing).**

### Frontend Vitest Verification (`frontend/src/test`)
1. **`routeRegistry.test.js`**:
   - Exactly 120 documented route entries.
   - Zero duplicate route IDs.
   - Zero duplicate path patterns.
   - Complete field specifications (`id`, `path`, `title`, `category`, `access`, `layout`, `description`).
   - All 15 functional categories represented and summing to 120.
   - Helper retrieval functions (`getRouteById`, `getRoutesByCategory`, `getCategorySummary`). (7 tests)
2. **`appRoutes.test.js`**:
   - Verifies all 120 routes are mapped to valid, existing page components.
   - Confirms route guards (`ProtectedRoute`, `AdminRoute`, `GuestRoute`) and layout wrappers (`AppShell`, `AuthLayout`, `AdminLayout`, `MinimalLayout`).
   - Verifies wildcard `*` catch-all route correctly maps to `NotFoundPage`. (3 tests)

**Total Frontend Tests: 10 tests across 2 suites (100% passing).**

### Browser & End-to-End Workflow Verification
- Automated headless browser runner (Playwright driver download via external CDN) encountered sandbox environment network access constraints (`404` downloading driver binary).
- **Alternative Verification Performed:**
  - Automated integration testing via Supertest against real Express endpoints and in-memory MongoDB (37/37 passing).
  - Vitest React route structure and component mapping verification for all 120 routes (10/10 passing).
  - Live server HTTP API request verification (`/api/health`, `/api/auth/login`, `/api/posts/feed`, `/api/stories/feed`, etc.).
  - Production build bundle generation via Vite with zero compilation errors.

## Running the Tests

### 1. Run All Tests
```bash
# In the root repository
npm test
```

### 2. Run Backend Tests
```bash
cd backend
npm test
# Equivalent to: npx vitest run --fileParallelism=false
```

### 3. Run Frontend Tests
```bash
cd frontend
npm test
```
