# Traceable Implementation Plan & Architecture Blueprint

## 1. Traceability Matrix: Research -> Requirements -> Code -> Tests

| Research Observation | Requirement | Route / Page Component | Backend Endpoint | Database Model | Automated Test |
|---|---|---|---|---|---|
| **Login / Sign Up** (`/accounts/emailsignup/`, `/accounts/password/reset/`) | PRD-01, AC-AUTH-1,2,3 | `/auth/login` (`LoginPage.jsx`), `/auth/signup` (`SignupPage.jsx`) | `POST /api/auth/register`, `POST /api/auth/login` | `User` | `backend/tests/auth.test.js` (12 tests) |
| **Profile & Stats** (686M followers, 308 following, Bio) | PRD-02, AC-SOC-1,2 | `/users/:username` (`ProfilePage.jsx`), `/profile/edit` (`EditProfilePage.jsx`) | `GET /api/users/:username`, `PUT /api/users/profile` | `User`, `Follow` | `backend/tests/social.test.js` (5 tests) |
| **Story Tray & Highlights** (24h ephemeral circles, highlights albums) | PRD-04, AC-STORY-1,2,3 | `/stories` (`StoriesFeedPage.jsx`), `/stories/:storyId` (`StoryViewerPage.jsx`), `/stories/highlights` | `GET /api/stories/feed`, `POST /api/stories/:id/view` | `Story`, `Highlight` | `backend/tests/stories.test.js` (2 tests) |
| **Post Cards & Actions** (Likes, comments, shares, collections) | PRD-03, AC-POST-1,2,3 | `/home` (`FeedPage.jsx`), `/posts/:postId` (`PostDetailPage.jsx`), `/create/post` | `POST /api/posts`, `POST /api/posts/:id/like`, `POST /api/posts/:id/comments` | `Post`, `Comment`, `Bookmark`, `Collection` | `backend/tests/posts.test.js` (7 tests) |
| **Reels Vertical Feed** (9:16 layout, overlay engagement) | PRD-05, AC-REEL-1,2 | `/reels` (`ReelsPage.jsx`), `/reels/trending` (`ReelsTrendingPage.jsx`) | `GET /api/reels`, `POST /api/reels/:id/views` | `Reel` | `backend/tests/reels.test.js` (3 tests) |
| **Search & Explore** (Debounced search, topic categories) | PRD-06 | `/search` (`SearchPage.jsx`), `/explore` (`ExploreLandingPage.jsx`) | `GET /api/search/users`, `GET /api/search/posts`, `GET /api/explore` | `User`, `Post` | `backend/tests/posts.test.js` (search) |
| **Direct Messaging** (Split-pane inbox, message attachments) | PRD-07, AC-MSG-1,2 | `/direct` (`MessagesPage.jsx`), `/direct/:conversationId` | `GET /api/conversations`, `POST /api/messages` + Socket.IO | `Conversation`, `Message` | `backend/tests/messages.test.js` (2 tests) |
| **Settings & Security** (Sessions list, password change) | PRD-09, AC-SET-1,2 | `/settings` (`SettingsPage.jsx`), `/settings/sessions`, `/settings/password` | `PUT /api/settings/preferences`, `GET /api/settings/sessions` | `User.preferences`, `Session` | `backend/tests/settings.test.js` (3 tests) |
| **Admin & Moderation** (Privileged queue, audit logs) | PRD-10, AC-AUTH-4 | `/admin` (`AdminDashboardPage.jsx`), `/admin/reports`, `/admin/audit` | `GET /api/admin/stats`, `PUT /api/admin/reports/:id` | `Report`, `AuditLog` | `backend/tests/admin.test.js` (2 tests) |

---

## 2. Checkpoint Execution Roadmap

1. **Checkpoint A:** REA Skill Instructions & Tool Inventory (Complete).
2. **Checkpoint B:** Structured Public Instagram Research via REA Scenarios (Complete — landing, profile, reels, explore captures saved).
3. **Checkpoint C:** Research Documentation & Specifications (Complete — 5 research docs + 3 spec docs authored).
4. **Checkpoint D:** 120-Route Registry & Layouts (Complete — 120 routes in `routeRegistry.js` and `ROUTE_INVENTORY.md`).
5. **Checkpoint E:** Authentication & Session Infrastructure (Complete — HTTP-only cookies, bcrypt, 12 passing tests).
6. **Checkpoint F:** Profiles, Social Graph, Follow Requests & Blocking (Complete — 5 passing tests).
7. **Checkpoint G:** Posts, Feed, Comments, Likes & Collections (Complete — 7 passing tests).
8. **Checkpoint H:** Stories, Expiration & Video Reels (Complete — 5 passing tests).
9. **Checkpoint I:** Search, Explore & Topic Discovery (Complete).
10. **Checkpoint J:** Direct Messaging & Real-Time Notifications (Complete — 3 passing tests).
11. **Checkpoint K:** Settings, Safety, Help & Reporting (Complete — 3 passing tests).
12. **Checkpoint L:** Administration & Moderation Queue (Complete — 2 passing tests).
13. **Checkpoint M:** Route Wiring & Layout Assembly (Complete — 120 routes wired).
14. **Checkpoint N:** Automated Test Matrix & Production Build (Complete — 47/47 passing tests, clean build).
15. **Checkpoint O:** Final Auditing & Documentation Delivery (Complete).
