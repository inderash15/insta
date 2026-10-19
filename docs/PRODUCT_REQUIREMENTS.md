# Product Requirements Document (PRD) — Insta Social Platform

## 1. Executive Product Vision
**Insta** is an authentic, production-grade social networking application inspired by Instagram's major user-facing capabilities. The platform delivers an original, high-performance visual experience across 120 dedicated routes covering onboarding, feeds, profiles, posts, reels, stories, direct messaging, search/explore, notifications, settings, safety, and administration.

---

## 2. Core Functional Requirements by Feature Area

### A. Authentication & User Lifecycle (PRD-01)
- **FR-01.1 Registration:** New users can create an account with email, full name, username, and password. Real-time validation checks for username availability and format.
- **FR-01.2 Authentication:** Secure login using username or email with password verification via bcrypt. Session managed via HTTP-only, SameSite secure JWT cookies.
- **FR-01.3 Password Recovery:** Token-based forgot password and reset password workflow.
- **FR-01.4 Two-Factor Security:** Configurable 2FA supporting TOTP authenticator challenge on login and emergency recovery codes.
- **FR-01.5 Session Management:** Listing of active user sessions with IP, user agent, and remote revocation capability.

### B. Social Graph & Connections (PRD-02)
- **FR-02.1 Follow / Unfollow:** Users can follow and unfollow public accounts with atomic follower/following counter synchronization.
- **FR-02.2 Private Accounts:** Users can designate their account as private. Follow attempts create a pending follow request requiring approval.
- **FR-02.3 Blocking & Restricting:** Users can block accounts, immediately severing mutual follow relationships and preventing future communication.

### C. Content Publishing & Feeds (PRD-03)
- **FR-03.1 Post Composer:** Multipart media upload supporting square, portrait, and landscape ratios, caption text, hashtags, and location tagging.
- **FR-03.2 Feed Modalities:**
  - Personalized Home Feed: Blended ranking of followed creators.
  - Following Feed: Chronological stream of followed accounts.
  - Latest Feed: Strictly chronological global stream.
  - Saved & Liked Feeds: Private collections of bookmarked and liked content.
- **FR-03.3 Engagement:** Atomic liking/unliking with duplicate prevention, threaded comments and replies, and bookmarking into collections.

### D. Ephemeral Stories & Highlights (PRD-04)
- **FR-04.1 Story Composer:** 24-hour ephemeral photo and video upload.
- **FR-04.2 Story Viewer:** Full-screen viewer with progress indicators, tap navigation, and viewer tracking for creators.
- **FR-04.3 Expiration:** Automatic expiration at 24 hours via MongoDB TTL and query filters.
- **FR-04.4 Highlights:** Permanent collections of stories displayed on the user's public profile.

### E. Short-Form Video Reels (PRD-05)
- **FR-05.1 Vertical Video Player:** 9:16 aspect ratio video feed with snap scrolling, auto-looping, and audio controls.
- **FR-05.2 Trending Algorithm:** Ranking based on video play duration, likes, and comment velocity.
- **FR-05.3 Creator Insights:** Analytics tracking view counts, likes, and engagement metrics.

### F. Search, Explore & Discovery (PRD-06)
- **FR-06.1 Instant Search:** Debounced search across user directory, post captions, and hashtags.
- **FR-06.2 Explore Grid:** Algorithmic recommendation grid highlighting high-performing photos and reels.
- **FR-06.3 Topics Directory:** Categorized browsing by topic (Design, Tech, Travel, Photography).

### G. Direct Messaging (PRD-07)
- **FR-07.1 1-on-1 & Group Chats:** Real-time message exchange powered by Socket.IO.
- **FR-07.2 Media Sharing:** Photo and video attachments within conversations.
- **FR-07.3 Message Requests:** Segregated inbox for incoming chats from non-followed accounts.

### H. Notifications (PRD-08)
- **FR-08.1 Activity Alerts:** Real-time push notifications for follows, likes, comments, and mentions.
- **FR-08.2 Filtered Views:** Notification center filters by category (following, posts, comments, requests).

### I. Settings, Safety & Help (PRD-09)
- **FR-09.1 Comprehensive Settings:** 14 dedicated settings pages (Account, Privacy, Security, Theme, Accessibility, Language, Data Export).
- **FR-09.2 Safety & Help:** Safety center, blocked accounts, report submission, and support contact form.

### J. Administration & Moderation (PRD-10)
- **FR-10.1 Role-Based Access:** Server-verified admin and moderator permissions.
- **FR-10.2 Moderation Queue:** Reviewing and resolving user reports, content deletion, and account suspension.
- **FR-10.3 Audit Log:** Persistent immutable ledger recording all privileged administrative operations.
