# Instagram Public Product Audit

## 1. Executive Summary
This document records the empirical product audit of Instagram's publicly observable web experience, conducted using Google Antigravity and REA (Reverse Engineer Anything) browser scenario tools. The purpose is to establish an evidence-based foundation of user-facing workflows, layout structures, and behavioral characteristics to guide the architecture of the Insta social platform.

---

## 2. Product Surface Audit

### A. Landing & Authentication
* **Directly Observed:**
  - Landing state presents a centered desktop viewport layout containing brand logo, single input field for username/phone/email (`name="email"`, `autocomplete="username webauthn"`), password input (`name="pass"`), and "Log in" action button.
  - Secondary authentication entry points include "Forgot password?" linking directly to `/accounts/password/reset/` and "Don't have an account? Sign up" linking to `/accounts/emailsignup/`.
  - Comprehensive footer navigation providing direct access to Meta company pages, About, Blog, Careers, Help Center, API documentation, Privacy Policy (`/legal/privacy/`), Terms of Service (`/legal/terms/`), Locations (`/explore/locations/`), and Meta Verified info.
* **Behavioral Nuances:**
  - Form validation activates prior to submission (disabling submit until minimum character lengths are satisfied).
  - WebAuthn credential manager hooks are declared on the username input.
  - Logged-out users attempting to view private or sensitive profiles are redirected to `/accounts/login/?next={target_url}`.

---

### B. Home & Feeds
* **Directly Observed & Documented:**
  - Three distinct feed modalities:
    1. **Personalized Home Feed:** Blended feed of followed accounts, suggested creators, and sponsored content ranked by affinity.
    2. **Following Feed:** Strictly accounts the user explicitly follows, removing recommendation clutter.
    3. **Chronological / Favorites Feed:** Pure reverse-chronological order of selected high-priority accounts.
  - **Post Composition:**
    - Header: Author avatar, clickable username, location tag, right-aligned options menu (three dots icon: Report, Unfollow, Add to favorites, Copy link).
    - Media Container: Square (1:1), vertical portrait (4:5), or landscape (1.91:1) aspect ratio with double-tap like interaction.
    - Engagement Row: Heart (like), Speech bubble (comment), Paper plane (share to DM/external), and Bookmark (save to collection).
    - Likes Count: Expandable modal listing accounts who liked the post.
    - Caption Block: Bold username followed by text, clickable `#hashtags`, and `@mentions`.
    - Comments Snippet: "View all {n} comments" with timestamp and inline comment submission input.

---

### C. Profile Pages
* **Directly Observed (Evidence: `instagram_profile_rea.png` & `instagram_profile_dom.html`):**
  - **Header Region:**
    - High-resolution circular avatar (150x150px desktop) with active story ring indicator if stories are published.
    - Username header with verification badge (blue checkmark) and primary action buttons (Follow/Following, Message, Options).
    - Metric counters: Total Posts, Followers count, and Following count.
    - Bio Section: Full name, category badge (e.g. Creator / Photographer), multi-line biography text, external hyperlinks (`rel="nofollow"`).
  - **Story Highlights Bar:**
    - Horizontal scrollable tray of permanent circular story albums with custom cover images and descriptive labels (e.g. "close friends", "what's new", "creatives").
  - **Tabbed Content Navigation:**
    - `POSTS` (`/{username}/`): 3-column square grid of uploaded media with hover overlays showing like and comment counts.
    - `REELS` (`/{username}/reels/`): 4-column 9:16 vertical video thumbnails showing play counts.
    - `TAGGED` (`/{username}/tagged/`): Posts created by other users that tag this account.

---

### D. Post Details & Interactions
* **Directly Observed (Evidence: `instagram_reel_rea.png` & `instagram_reel_dom.html`):**
  - Desktop modal presentation with 2-column layout: left column dedicated to media (image carousel or video player), right column dedicated to author identity, full caption, threaded comments, and interaction bar.
  - **Threaded Comments:** Top-level comments support nested 1-level replies ("View replies (3)"). Author comments display dedicated "Creator" tags.
  - **Likes & Shares:** Like counter opens a searchable modal of liking users. Share action opens direct message recipient selector and URL copy clipboard trigger.
  - **Save & Collections:** Bookmarking triggers a floating confirmation toast with an option to "Save to Collection".

---

### E. Stories & Highlights
* **Directly Observed & Documented:**
  - **Story Tray:** Located at top of home feed. Unviewed stories have a gradient ring (pink/purple/yellow); viewed stories have a subtle gray border.
  - **Viewer Modal:** Auto-advancing segmented progress bar at top (5 seconds for images, duration of video for clips).
  - **Playback Controls:** Pause on tap/hold, keyboard left/right arrow navigation, swipe down to dismiss.
  - **Ephemeral Lifecycle:** Hard 24-hour expiration from timestamp of creation.
  - **Viewer Tracking:** Only story author has access to the viewers list and total view count.
  - **Highlights:** Authors can save expired or active stories into themed permanent collections shown on their public profile.

---

### F. Reels & Vertical Video
* **Directly Observed:**
  - Full-viewport vertical scrolling interface (9:16 aspect ratio).
  - Right-side vertical overlay action buttons: Like (heart), Comment count (speech bubble), Send/Share (paper plane), Save (bookmark), Audio album disc icon.
  - Bottom metadata overlay: Creator avatar, username, "Follow" button, caption with auto-truncation ("more"), and audio track title with music note icon.
  - Continuous loop playback with audio mute/unmute toggle.

---

### G. Search & Explore
* **Directly Observed (Evidence: `instagram_explore_rea.png` & `instagram_explore_dom.html`):**
  - **Search Input:** Debounced instant search dropdown providing categorized results: Accounts (avatar, full name, username), Hashtags (`#tag` with post volume), and Locations.
  - **Explore Grid:** Algorithmic discovery stream featuring mixed-size media blocks (2x2 reel highlights interspersed among standard 1x1 post squares).
  - **Filter Chips:** Horizontal topic categories (Style, Architecture, Food, Travel, Art, Fitness).

---

### H. Direct Messaging & Notifications
* **Directly Observed & Documented:**
  - Split-pane interface on desktop: left pane shows searchable inbox with active conversation threads, unread counters, and online presence dots; right pane hosts active chat window.
  - Message types: Plain text, media attachments (photos, videos), voice clips, post reshares, and emoji reactions.
  - Message Requests: Segregated inbox tab for communications initiated by non-followed accounts with Accept/Decline/Block options.
  - Real-time events: Instant message delivery, typing indicators, and read receipts ("Seen").

---

### I. Settings, Privacy & Moderation
* **Documented Surfaces:**
  - Account privacy toggles: Private vs. Public account status.
  - Security controls: Two-Factor Authentication (SMS / Authenticator App / Recovery codes), Password change, Active login sessions list with remote logout.
  - Interactions controls: Comment filtering (hidden words, offensive comment blocking), Story sharing permissions, Tagging controls.
  - Moderation & Safety: Blocked users directory, Restricted accounts list, Report content workflow with categorized abuse taxonomy.
