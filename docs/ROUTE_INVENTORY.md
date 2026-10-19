# Complete 120-Page Route Inventory

This inventory documents all 120 distinct navigable route entries across the entire Insta application.

| # | Route ID | Path | Page Title | Category | Access | Layout | Status |
|---|---|---|---|---|---|---|---|
| 1 | `landing` | `/` | Home Router | Onboarding | Public | Auth | Verified |
| 2 | `welcome` | `/welcome` | Welcome & Onboarding | Onboarding | Public | Auth | Verified |
| 3 | `auth-login` | `/auth/login` | Log In | Auth | Guest | Auth | Verified |
| 4 | `auth-signup` | `/auth/signup` | Create Account | Auth | Guest | Auth | Verified |
| 5 | `auth-forgot-password` | `/auth/forgot-password` | Forgot Password | Auth | Guest | Auth | Verified |
| 6 | `auth-reset-password` | `/auth/reset-password` | Reset Password | Auth | Guest | Auth | Verified |
| 7 | `auth-verify-email` | `/auth/verify-email` | Verify Email | Auth | Public | Auth | Verified |
| 8 | `auth-confirm-account` | `/auth/confirm-account` | Confirm Account | Auth | Public | Auth | Verified |
| 9 | `auth-two-factor` | `/auth/two-factor` | Two-Factor Authentication | Auth | Public | Auth | Verified |
| 10 | `auth-recovery-codes` | `/auth/recovery-codes` | Recovery Codes | Auth | Authenticated | App | Verified |
| 11 | `auth-session-expired` | `/auth/session-expired` | Session Expired | Auth | Public | Auth | Verified |
| 12 | `auth-logout` | `/auth/logout` | Logging Out | Auth | Public | Auth | Verified |
| 13 | `feed-home` | `/home` | Home Feed | Feed | Authenticated | App | Verified |
| 14 | `feed-following` | `/feed/following` | Following Feed | Feed | Authenticated | App | Verified |
| 15 | `feed-latest` | `/feed/latest` | Latest Feed | Feed | Authenticated | App | Verified |
| 16 | `feed-saved` | `/feed/saved` | Saved Posts | Feed | Authenticated | App | Verified |
| 17 | `feed-liked` | `/feed/liked` | Liked Posts | Feed | Authenticated | App | Verified |
| 18 | `feed-mentions` | `/feed/mentions` | Mentions Feed | Feed | Authenticated | App | Verified |
| 19 | `feed-hashtags` | `/feed/hashtags` | Hashtag Feed | Feed | Authenticated | App | Verified |
| 20 | `feed-media` | `/feed/media` | Media Feed | Feed | Authenticated | App | Verified |
| 21 | `feed-activity` | `/feed/activity` | Activity Feed | Feed | Authenticated | App | Verified |
| 22 | `feed-drafts` | `/feed/drafts` | Saved Drafts | Feed | Authenticated | App | Verified |
| 23 | `feed-archived` | `/feed/archived` | Archived Posts | Feed | Authenticated | App | Verified |
| 24 | `feed-recently-viewed` | `/feed/recently-viewed` | Recently Viewed | Feed | Authenticated | App | Verified |
| 25 | `profile-user` | `/users/:username` | User Profile | Profile | Authenticated | App | Verified |
| 26 | `profile-edit` | `/profile/edit` | Edit Profile | Profile | Authenticated | App | Verified |
| 27 | `profile-avatar` | `/profile/avatar` | Profile Photo | Profile | Authenticated | App | Verified |
| 28 | `profile-cover` | `/profile/cover` | Profile Appearance | Profile | Authenticated | App | Verified |
| 29 | `profile-posts` | `/profile/posts` | My Posts | Profile | Authenticated | App | Verified |
| 30 | `profile-reels` | `/profile/reels` | My Reels | Profile | Authenticated | App | Verified |
| 31 | `profile-tagged` | `/profile/tagged` | Tagged Posts | Profile | Authenticated | App | Verified |
| 32 | `profile-followers` | `/profile/followers` | Followers | Profile | Authenticated | App | Verified |
| 33 | `profile-following` | `/profile/following` | Following | Profile | Authenticated | App | Verified |
| 34 | `profile-requests` | `/profile/requests` | Follow Requests | Profile | Authenticated | App | Verified |
| 35 | `profile-pending` | `/profile/pending` | Pending Requests | Profile | Authenticated | App | Verified |
| 36 | `profile-blocked` | `/profile/blocked` | Blocked Accounts | Profile | Authenticated | App | Verified |
| 37 | `post-create` | `/create/post` | Create Post | Posts | Authenticated | App | Verified |
| 38 | `post-create-preview` | `/create/post/preview` | Post Preview | Posts | Authenticated | App | Verified |
| 39 | `post-detail` | `/posts/:postId` | Post Detail | Posts | Authenticated | App | Verified |
| 40 | `post-edit` | `/posts/:postId/edit` | Edit Post | Posts | Authenticated | App | Verified |
| 41 | `post-comments` | `/posts/:postId/comments` | Post Comments | Posts | Authenticated | App | Verified |
| 42 | `post-likers` | `/posts/:postId/likers` | Liked By | Posts | Authenticated | App | Verified |
| 43 | `post-shares` | `/posts/:postId/shares` | Share Post | Posts | Authenticated | App | Verified |
| 44 | `post-insights` | `/posts/:postId/insights` | Post Insights | Posts | Authenticated | App | Verified |
| 45 | `post-report` | `/posts/:postId/report` | Report Post | Posts | Authenticated | App | Verified |
| 46 | `post-save` | `/posts/:postId/save` | Save to Collection | Posts | Authenticated | App | Verified |
| 47 | `collections-index` | `/collections` | Collections | Posts | Authenticated | App | Verified |
| 48 | `collection-detail` | `/collections/:collectionId` | Collection Detail | Posts | Authenticated | App | Verified |
| 49 | `stories-feed` | `/stories` | Stories Feed | Stories | Authenticated | App | Verified |
| 50 | `stories-create` | `/stories/create` | Create Story | Stories | Authenticated | App | Verified |
| 51 | `stories-preview` | `/stories/preview` | Story Preview | Stories | Authenticated | Minimal | Verified |
| 52 | `story-viewer` | `/stories/:storyId` | Story Viewer | Stories | Authenticated | Minimal | Verified |
| 53 | `story-viewers` | `/stories/:storyId/viewers` | Story Viewers | Stories | Authenticated | App | Verified |
| 54 | `stories-archive` | `/stories/archive` | Story Archive | Stories | Authenticated | App | Verified |
| 55 | `stories-highlights` | `/stories/highlights` | Story Highlights | Stories | Authenticated | App | Verified |
| 56 | `story-highlight-detail` | `/stories/highlights/:highlightId` | Highlight Detail | Stories | Authenticated | Minimal | Verified |
| 57 | `reels-feed` | `/reels` | Reels | Reels | Authenticated | App | Verified |
| 58 | `reels-following` | `/reels/following` | Following Reels | Reels | Authenticated | App | Verified |
| 59 | `reels-trending` | `/reels/trending` | Trending Reels | Reels | Authenticated | App | Verified |
| 60 | `reels-create` | `/reels/create` | Create Reel | Reels | Authenticated | App | Verified |
| 61 | `reel-detail` | `/reels/:reelId` | Reel Detail | Reels | Authenticated | App | Verified |
| 62 | `reel-comments` | `/reels/:reelId/comments` | Reel Comments | Reels | Authenticated | App | Verified |
| 63 | `reel-insights` | `/reels/:reelId/insights` | Reel Insights | Reels | Authenticated | App | Verified |
| 64 | `reels-saved` | `/reels/saved` | Saved Reels | Reels | Authenticated | App | Verified |
| 65 | `search-global` | `/search` | Search | Search | Authenticated | App | Verified |
| 66 | `search-people` | `/search/people` | Search People | Search | Authenticated | App | Verified |
| 67 | `search-posts` | `/search/posts` | Search Posts | Search | Authenticated | App | Verified |
| 68 | `search-hashtags` | `/search/hashtags` | Search Hashtags | Search | Authenticated | App | Verified |
| 69 | `search-places` | `/search/places` | Search Places | Search | Authenticated | App | Verified |
| 70 | `search-recent` | `/search/recent` | Recent Searches | Search | Authenticated | App | Verified |
| 71 | `explore-landing` | `/explore` | Explore | Explore | Authenticated | App | Verified |
| 72 | `explore-people` | `/explore/people` | Discover People | Explore | Authenticated | App | Verified |
| 73 | `explore-topics` | `/explore/topics` | Explore Topics | Explore | Authenticated | App | Verified |
| 74 | `explore-category` | `/explore/:category` | Category Feed | Explore | Authenticated | App | Verified |
| 75 | `direct-inbox` | `/direct` | Direct Messages | Messaging | Authenticated | App | Verified |
| 76 | `direct-conversation` | `/direct/:conversationId` | Direct Conversation | Messaging | Authenticated | App | Verified |
| 77 | `direct-new` | `/direct/new` | New Message | Messaging | Authenticated | App | Verified |
| 78 | `direct-requests` | `/direct/requests` | Message Requests | Messaging | Authenticated | App | Verified |
| 79 | `direct-archived` | `/direct/archived` | Archived Chats | Messaging | Authenticated | App | Verified |
| 80 | `direct-starred` | `/direct/starred` | Starred Messages | Messaging | Authenticated | App | Verified |
| 81 | `direct-conv-details` | `/direct/:conversationId/details` | Chat Details | Messaging | Authenticated | App | Verified |
| 82 | `direct-conv-media` | `/direct/:conversationId/media` | Shared Media | Messaging | Authenticated | App | Verified |
| 83 | `direct-conv-members` | `/direct/:conversationId/members` | Chat Members | Messaging | Authenticated | App | Verified |
| 84 | `direct-conv-search` | `/direct/:conversationId/search` | Search in Chat | Messaging | Authenticated | App | Verified |
| 85 | `direct-conv-requests` | `/direct/:conversationId/requests` | Group Requests | Messaging | Authenticated | App | Verified |
| 86 | `direct-settings` | `/direct/settings` | Direct Settings | Messaging | Authenticated | App | Verified |
| 87 | `notifications-all` | `/notifications` | Notifications | Notifications | Authenticated | App | Verified |
| 88 | `notifications-following` | `/notifications/following` | Follow Activity | Notifications | Authenticated | App | Verified |
| 89 | `notifications-posts` | `/notifications/posts` | Post Likes & Interactions | Notifications | Authenticated | App | Verified |
| 90 | `notifications-comments` | `/notifications/comments` | Comments & Replies | Notifications | Authenticated | App | Verified |
| 91 | `notifications-mentions` | `/notifications/mentions` | Mentions & Tags | Notifications | Authenticated | App | Verified |
| 92 | `notifications-messages` | `/notifications/messages` | Message Alerts | Notifications | Authenticated | App | Verified |
| 93 | `notifications-requests` | `/notifications/requests` | Requests & Approvals | Notifications | Authenticated | App | Verified |
| 94 | `activity-history` | `/activity` | Your Activity | Notifications | Authenticated | App | Verified |
| 95 | `settings-index` | `/settings` | Settings Overview | Settings | Authenticated | App | Verified |
| 96 | `settings-account` | `/settings/account` | Account Center | Settings | Authenticated | App | Verified |
| 97 | `settings-profile` | `/settings/profile` | Profile Settings | Settings | Authenticated | App | Verified |
| 98 | `settings-privacy` | `/settings/privacy` | Account Privacy | Settings | Authenticated | App | Verified |
| 99 | `settings-security` | `/settings/security` | Security Center | Settings | Authenticated | App | Verified |
| 100 | `settings-password` | `/settings/password` | Change Password | Settings | Authenticated | App | Verified |
| 101 | `settings-sessions` | `/settings/sessions` | Active Sessions | Settings | Authenticated | App | Verified |
| 102 | `settings-two-factor` | `/settings/two-factor` | Two-Factor Configuration | Settings | Authenticated | App | Verified |
| 103 | `settings-notifications` | `/settings/notifications` | Notification Preferences | Settings | Authenticated | App | Verified |
| 104 | `settings-appearance` | `/settings/appearance` | Appearance | Settings | Authenticated | App | Verified |
| 105 | `settings-accessibility` | `/settings/accessibility` | Accessibility | Settings | Authenticated | App | Verified |
| 106 | `settings-language` | `/settings/language` | Language | Settings | Authenticated | App | Verified |
| 107 | `settings-data` | `/settings/data` | Download Your Data | Settings | Authenticated | App | Verified |
| 108 | `settings-delete-account` | `/settings/delete-account` | Delete Account | Settings | Authenticated | App | Verified |
| 109 | `safety-center` | `/safety` | Safety Center | Safety | Public | App | Verified |
| 110 | `safety-blocked` | `/safety/blocked` | Safety Blocked Accounts | Safety | Authenticated | App | Verified |
| 111 | `safety-restricted` | `/safety/restricted` | Restricted Accounts | Safety | Authenticated | App | Verified |
| 112 | `reports-new` | `/reports/new` | Submit a Report | Safety | Authenticated | App | Verified |
| 113 | `reports-history` | `/reports/history` | My Report History | Safety | Authenticated | App | Verified |
| 114 | `help-center` | `/help` | Help Center | Help | Public | App | Verified |
| 115 | `help-contact` | `/help/contact` | Contact Support | Help | Public | App | Verified |
| 116 | `legal-index` | `/legal` | Terms & Policies | Legal | Public | App | Verified |
| 117 | `admin-dashboard` | `/admin` | Admin Dashboard | Admin | Admin | Admin | Verified |
| 118 | `admin-users` | `/admin/users` | User Management | Admin | Admin | Admin | Verified |
| 119 | `admin-reports` | `/admin/reports` | Moderation Queue | Admin | Admin | Admin | Verified |
| 120 | `admin-audit` | `/admin/audit` | Audit Logs | Admin | Admin | Admin | Verified |
