/**
 * 120-PAGE ROUTE REGISTRY
 * Insta Social Networking Platform
 * 
 * Every route defines:
 * - id: Unique route identifier
 * - path: Unique URL path pattern
 * - title: Human-readable page title
 * - category: Product section / feature group
 * - access: 'public' | 'authenticated' | 'admin' | 'guest'
 * - description: Functional purpose of the route
 * - layout: 'app' | 'auth' | 'admin' | 'minimal'
 */

export const ROUTE_REGISTRY = [
  // ==========================================
  // SECTION A: ONBOARDING & AUTHENTICATION (1–12)
  // ==========================================
  {
    id: 'landing',
    path: '/',
    title: 'Insta',
    category: 'auth',
    access: 'public',
    layout: 'auth',
    description: 'Root entry point routing to authenticated feed or onboarding experience.'
  },
  {
    id: 'welcome',
    path: '/welcome',
    title: 'Welcome to Insta',
    category: 'auth',
    access: 'public',
    layout: 'auth',
    description: 'Welcome and onboarding introduction highlighting core platform capabilities.'
  },
  {
    id: 'auth-login',
    path: '/auth/login',
    title: 'Log In',
    category: 'auth',
    access: 'guest',
    layout: 'auth',
    description: 'Secure user login using username/email and password with rate limiting.'
  },
  {
    id: 'auth-signup',
    path: '/auth/signup',
    title: 'Create Account',
    category: 'auth',
    access: 'guest',
    layout: 'auth',
    description: 'User registration with real-time validation and credential hashing.'
  },
  {
    id: 'auth-forgot-password',
    path: '/auth/forgot-password',
    title: 'Forgot Password',
    category: 'auth',
    access: 'guest',
    layout: 'auth',
    description: 'Password recovery request screen dispatching secure reset links.'
  },
  {
    id: 'auth-reset-password',
    path: '/auth/reset-password',
    title: 'Reset Password',
    category: 'auth',
    access: 'guest',
    layout: 'auth',
    description: 'New password entry authenticated via secure recovery token.'
  },
  {
    id: 'auth-verify-email',
    path: '/auth/verify-email',
    title: 'Verify Email',
    category: 'auth',
    access: 'public',
    layout: 'auth',
    description: 'Email verification confirmation and resend workflow status.'
  },
  {
    id: 'auth-confirm-account',
    path: '/auth/confirm-account',
    title: 'Confirm Account',
    category: 'auth',
    access: 'public',
    layout: 'auth',
    description: 'Account activation screen confirming account security policies.'
  },
  {
    id: 'auth-two-factor',
    path: '/auth/two-factor',
    title: 'Two-Factor Authentication',
    category: 'auth',
    access: 'public',
    layout: 'auth',
    description: 'Time-based one-time passcode verification gate.'
  },
  {
    id: 'auth-recovery-codes',
    path: '/auth/recovery-codes',
    title: 'Recovery Codes',
    category: 'auth',
    access: 'authenticated',
    layout: 'app',
    description: 'Emergency one-time recovery codes generation and management.'
  },
  {
    id: 'auth-session-expired',
    path: '/auth/session-expired',
    title: 'Session Expired',
    category: 'auth',
    access: 'public',
    layout: 'auth',
    description: 'Session expiration notification offering fast re-authentication.'
  },
  {
    id: 'auth-logout',
    path: '/auth/logout',
    title: 'Logging Out',
    category: 'auth',
    access: 'public',
    layout: 'auth',
    description: 'Safe logout handler revoking session cookies and clearing cache.'
  },

  // ==========================================
  // SECTION B: HOME & FEEDS (13–24)
  // ==========================================
  {
    id: 'feed-home',
    path: '/home',
    title: 'Home Feed',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'Personalized main feed featuring followed accounts, story tray, and suggestions.'
  },
  {
    id: 'feed-following',
    path: '/feed/following',
    title: 'Following Feed',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'Posts strictly from accounts the user directly follows.'
  },
  {
    id: 'feed-latest',
    path: '/feed/latest',
    title: 'Latest Feed',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'Pure reverse-chronological feed of platform updates.'
  },
  {
    id: 'feed-saved',
    path: '/feed/saved',
    title: 'Saved Posts',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'Private collection of all posts bookmarked by the user.'
  },
  {
    id: 'feed-liked',
    path: '/feed/liked',
    title: 'Liked Posts',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'Personal archive of all posts previously liked by the user.'
  },
  {
    id: 'feed-mentions',
    path: '/feed/mentions',
    title: 'Mentions Feed',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'Posts in which the authenticated user was tagged or mentioned.'
  },
  {
    id: 'feed-hashtags',
    path: '/feed/hashtags',
    title: 'Hashtag Feed',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'Curated feed aggregated across followed and trending hashtags.'
  },
  {
    id: 'feed-media',
    path: '/feed/media',
    title: 'Media Feed',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'High-density visual media gallery feed focused on imagery.'
  },
  {
    id: 'feed-activity',
    path: '/feed/activity',
    title: 'Activity Feed',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'Chronological summary of user actions, comments, and interactions.'
  },
  {
    id: 'feed-drafts',
    path: '/feed/drafts',
    title: 'Saved Drafts',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'Locally and remotely persisted unpublished post drafts.'
  },
  {
    id: 'feed-archived',
    path: '/feed/archived',
    title: 'Archived Posts',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'User posts hidden from public profiles without deletion.'
  },
  {
    id: 'feed-recently-viewed',
    path: '/feed/recently-viewed',
    title: 'Recently Viewed',
    category: 'feed',
    access: 'authenticated',
    layout: 'app',
    description: 'History of recently inspected posts and creator profiles.'
  },

  // ==========================================
  // SECTION C: PROFILES & CONNECTIONS (25–36)
  // ==========================================
  {
    id: 'profile-user',
    path: '/users/:username',
    title: 'User Profile',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Public or private user profile with posts grid, bio, and social actions.'
  },
  {
    id: 'profile-edit',
    path: '/profile/edit',
    title: 'Edit Profile',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Update display name, bio, personal website, and account visibility.'
  },
  {
    id: 'profile-avatar',
    path: '/profile/avatar',
    title: 'Profile Picture',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Upload, crop, and configure public profile avatar photo.'
  },
  {
    id: 'profile-cover',
    path: '/profile/cover',
    title: 'Profile Appearance',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Customize profile banner header, badge highlights, and theme accent.'
  },
  {
    id: 'profile-posts',
    path: '/profile/posts',
    title: 'My Posts',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Dedicated grid and list view of all published posts by the user.'
  },
  {
    id: 'profile-reels',
    path: '/profile/reels',
    title: 'My Reels',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Dedicated vertical video tab showcasing reels authored by the user.'
  },
  {
    id: 'profile-tagged',
    path: '/profile/tagged',
    title: 'Tagged Content',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Grid of posts published by others in which the user is tagged.'
  },
  {
    id: 'profile-followers',
    path: '/profile/followers',
    title: 'Followers',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Full list of accounts actively following the current user.'
  },
  {
    id: 'profile-following',
    path: '/profile/following',
    title: 'Following',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Full list of accounts the authenticated user currently follows.'
  },
  {
    id: 'profile-requests',
    path: '/profile/requests',
    title: 'Follow Requests',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Pending incoming follow requests with approve and reject actions.'
  },
  {
    id: 'profile-pending',
    path: '/profile/pending',
    title: 'Pending Requests',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Outgoing follow requests awaiting approval by private accounts.'
  },
  {
    id: 'profile-blocked',
    path: '/profile/blocked',
    title: 'Blocked Accounts',
    category: 'profile',
    access: 'authenticated',
    layout: 'app',
    description: 'Management interface for viewing and unblocking restricted accounts.'
  },

  // ==========================================
  // SECTION D: POSTS & COMMENTS (37–48)
  // ==========================================
  {
    id: 'post-create',
    path: '/create/post',
    title: 'Create Post',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Media upload studio supporting captions, hashtag parsing, and location tags.'
  },
  {
    id: 'post-create-preview',
    path: '/create/post/preview',
    title: 'Post Preview',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Pre-flight post inspection before committing to public publication.'
  },
  {
    id: 'post-detail',
    path: '/posts/:postId',
    title: 'Post Detail',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Full post view with interactive comment thread, liking, and sharing.'
  },
  {
    id: 'post-edit',
    path: '/posts/:postId/edit',
    title: 'Edit Post',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Modify caption, tags, and settings of an existing authorized post.'
  },
  {
    id: 'post-comments',
    path: '/posts/:postId/comments',
    title: 'Post Comments',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Focused full-screen comment discussion and reply thread.'
  },
  {
    id: 'post-likers',
    path: '/posts/:postId/likers',
    title: 'Liked By',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'List of all users who liked a specified visible post.'
  },
  {
    id: 'post-shares',
    path: '/posts/:postId/shares',
    title: 'Share Post',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Share post externally, copy link, or forward directly via direct message.'
  },
  {
    id: 'post-insights',
    path: '/posts/:postId/insights',
    title: 'Post Insights',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Author-only analytics showing views, engagement rate, and saves.'
  },
  {
    id: 'post-report',
    path: '/posts/:postId/report',
    title: 'Report Post',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Flag inappropriate content for harassment, spam, or copyright violations.'
  },
  {
    id: 'post-save',
    path: '/posts/:postId/save',
    title: 'Save to Collection',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Organize bookmarked posts into custom or default collections.'
  },
  {
    id: 'collections-index',
    path: '/collections',
    title: 'Collections',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Curated folders and grouped bookmarks created by the user.'
  },
  {
    id: 'collection-detail',
    path: '/collections/:collectionId',
    title: 'Collection Detail',
    category: 'posts',
    access: 'authenticated',
    layout: 'app',
    description: 'Browse, reorder, or remove saved media within a specific collection.'
  },

  // ==========================================
  // SECTION E: STORIES (49–56)
  // ==========================================
  {
    id: 'stories-feed',
    path: '/stories',
    title: 'Stories Feed',
    category: 'stories',
    access: 'authenticated',
    layout: 'app',
    description: 'Active 24-hour stories tray showcasing recent updates from followed users.'
  },
  {
    id: 'stories-create',
    path: '/stories/create',
    title: 'Create Story',
    category: 'stories',
    access: 'authenticated',
    layout: 'app',
    description: 'Ephemeral story composer with media upload, stickers, and filters.'
  },
  {
    id: 'stories-preview',
    path: '/stories/preview',
    title: 'Story Preview',
    category: 'stories',
    access: 'authenticated',
    layout: 'minimal',
    description: 'Full-bleed ephemeral story preview before publishing to followers.'
  },
  {
    id: 'story-viewer',
    path: '/stories/:storyId',
    title: 'Story Viewer',
    category: 'stories',
    access: 'authenticated',
    layout: 'minimal',
    description: 'Interactive timed story player with progress bars and quick emoji reactions.'
  },
  {
    id: 'story-viewers',
    path: '/stories/:storyId/viewers',
    title: 'Story Viewers',
    category: 'stories',
    access: 'authenticated',
    layout: 'app',
    description: 'Creator-only audience viewer list and reaction breakdown for an active story.'
  },
  {
    id: 'stories-archive',
    path: '/stories/archive',
    title: 'Story Archive',
    category: 'stories',
    access: 'authenticated',
    layout: 'app',
    description: 'Private chronological vault of expired stories saved by the user.'
  },
  {
    id: 'stories-highlights',
    path: '/stories/highlights',
    title: 'Story Highlights',
    category: 'stories',
    access: 'authenticated',
    layout: 'app',
    description: 'Manage permanent featured story collections pinned to profile header.'
  },
  {
    id: 'story-highlight-detail',
    path: '/stories/highlights/:highlightId',
    title: 'Highlight Detail',
    category: 'stories',
    access: 'authenticated',
    layout: 'minimal',
    description: 'View and manage media items pinned inside a permanent profile highlight.'
  },

  // ==========================================
  // SECTION F: REELS & VIDEO (57–64)
  // ==========================================
  {
    id: 'reels-feed',
    path: '/reels',
    title: 'Reels',
    category: 'reels',
    access: 'authenticated',
    layout: 'app',
    description: 'Full-screen vertical short-form video feed with autoplay and audio controls.'
  },
  {
    id: 'reels-following',
    path: '/reels/following',
    title: 'Following Reels',
    category: 'reels',
    access: 'authenticated',
    layout: 'app',
    description: 'Reels feed filtered strictly to followed creators.'
  },
  {
    id: 'reels-trending',
    path: '/reels/trending',
    title: 'Trending Reels',
    category: 'reels',
    access: 'authenticated',
    layout: 'app',
    description: 'Algorithmic curation of top engagement and trending audio reels.'
  },
  {
    id: 'reels-create',
    path: '/reels/create',
    title: 'Create Reel',
    category: 'reels',
    access: 'authenticated',
    layout: 'app',
    description: 'Video upload studio supporting captioning, sound tracks, and cover selection.'
  },
  {
    id: 'reel-detail',
    path: '/reels/:reelId',
    title: 'Reel Detail',
    category: 'reels',
    access: 'authenticated',
    layout: 'app',
    description: 'Dedicated permalink view for an individual short-form video.'
  },
  {
    id: 'reel-comments',
    path: '/reels/:reelId/comments',
    title: 'Reel Comments',
    category: 'reels',
    access: 'authenticated',
    layout: 'app',
    description: 'Full comment thread and real-time replies on vertical video.'
  },
  {
    id: 'reel-insights',
    path: '/reels/:reelId/insights',
    title: 'Reel Insights',
    category: 'reels',
    access: 'authenticated',
    layout: 'app',
    description: 'Creator analytics including plays, watch time, shares, and completion rate.'
  },
  {
    id: 'reels-saved',
    path: '/reels/saved',
    title: 'Saved Reels',
    category: 'reels',
    access: 'authenticated',
    layout: 'app',
    description: 'Private collection of bookmarked short-form videos.'
  },

  // ==========================================
  // SECTION G: SEARCH & EXPLORE (65–74)
  // ==========================================
  {
    id: 'search-global',
    path: '/search',
    title: 'Search',
    category: 'search',
    access: 'authenticated',
    layout: 'app',
    description: 'Global search hub supporting people, tags, and media queries.'
  },
  {
    id: 'search-people',
    path: '/search/people',
    title: 'Search People',
    category: 'search',
    access: 'authenticated',
    layout: 'app',
    description: 'User directory search filtered by username, full name, and bio keywords.'
  },
  {
    id: 'search-posts',
    path: '/search/posts',
    title: 'Search Posts',
    category: 'search',
    access: 'authenticated',
    layout: 'app',
    description: 'Find public posts by caption content, hashtags, and keywords.'
  },
  {
    id: 'search-hashtags',
    path: '/search/hashtags',
    title: 'Search Hashtags',
    category: 'search',
    access: 'authenticated',
    layout: 'app',
    description: 'Discover trending topics and hashtag popularity statistics.'
  },
  {
    id: 'search-places',
    path: '/search/places',
    title: 'Search Places',
    category: 'search',
    access: 'authenticated',
    layout: 'app',
    description: 'Geographic discovery for posts tagged with specific cities or venues.'
  },
  {
    id: 'search-recent',
    path: '/search/recent',
    title: 'Recent Searches',
    category: 'search',
    access: 'authenticated',
    layout: 'app',
    description: 'Manage and clear recently executed queries and visited profiles.'
  },
  {
    id: 'explore-landing',
    path: '/explore',
    title: 'Explore',
    category: 'explore',
    access: 'authenticated',
    layout: 'app',
    description: 'Curated masonry grid of trending media, posts, and creators.'
  },
  {
    id: 'explore-people',
    path: '/explore/people',
    title: 'Discover People',
    category: 'explore',
    access: 'authenticated',
    layout: 'app',
    description: 'Recommended creators and community members based on social graph connections.'
  },
  {
    id: 'explore-topics',
    path: '/explore/topics',
    title: 'Explore Topics',
    category: 'explore',
    access: 'authenticated',
    layout: 'app',
    description: 'Browse popular content categorized by design, photography, travel, and tech.'
  },
  {
    id: 'explore-category',
    path: '/explore/:category',
    title: 'Category Feed',
    category: 'explore',
    access: 'authenticated',
    layout: 'app',
    description: 'Deep dive discovery view focused on a specific interest topic category.'
  },

  // ==========================================
  // SECTION H: DIRECT MESSAGING (75–86)
  // ==========================================
  {
    id: 'direct-inbox',
    path: '/direct',
    title: 'Direct Messages',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Direct messaging inbox showing recent chats, unread indicators, and active contacts.'
  },
  {
    id: 'direct-conversation',
    path: '/direct/:conversationId',
    title: 'Direct Conversation',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Real-time WebSocket chat conversation with message history and typing indicators.'
  },
  {
    id: 'direct-new',
    path: '/direct/new',
    title: 'New Message',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Initiate a new direct or group conversation by searching recipients.'
  },
  {
    id: 'direct-requests',
    path: '/direct/requests',
    title: 'Message Requests',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Screen incoming messages from accounts you do not follow.'
  },
  {
    id: 'direct-archived',
    path: '/direct/archived',
    title: 'Archived Chats',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Vault of conversations archived from the primary inbox.'
  },
  {
    id: 'direct-starred',
    path: '/direct/starred',
    title: 'Starred Messages',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Quick access to important messages flagged with a star.'
  },
  {
    id: 'direct-conv-details',
    path: '/direct/:conversationId/details',
    title: 'Chat Details',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Participant list, notification mutes, and conversation customization.'
  },
  {
    id: 'direct-conv-media',
    path: '/direct/:conversationId/media',
    title: 'Shared Media',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Gallery of images, clips, and links exchanged inside a conversation.'
  },
  {
    id: 'direct-conv-members',
    path: '/direct/:conversationId/members',
    title: 'Chat Members',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Add, remove, and manage administrative privileges of group chat members.'
  },
  {
    id: 'direct-conv-search',
    path: '/direct/:conversationId/search',
    title: 'Search in Chat',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Search full message history and timestamps within a specific conversation.'
  },
  {
    id: 'direct-conv-requests',
    path: '/direct/:conversationId/requests',
    title: 'Group Requests',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Review pending requests from users wishing to join a group chat.'
  },
  {
    id: 'direct-settings',
    path: '/direct/settings',
    title: 'Direct Settings',
    category: 'messaging',
    access: 'authenticated',
    layout: 'app',
    description: 'Configure message privacy, read receipts, and who can send you direct messages.'
  },

  // ==========================================
  // SECTION I: NOTIFICATIONS & ACTIVITY (87–94)
  // ==========================================
  {
    id: 'notifications-all',
    path: '/notifications',
    title: 'Notifications',
    category: 'notifications',
    access: 'authenticated',
    layout: 'app',
    description: 'Complete notification center with real-time updates and unread badges.'
  },
  {
    id: 'notifications-following',
    path: '/notifications/following',
    title: 'Follow Activity',
    category: 'notifications',
    access: 'authenticated',
    layout: 'app',
    description: 'Notifications specifically regarding new followers and follow requests.'
  },
  {
    id: 'notifications-posts',
    path: '/notifications/posts',
    title: 'Post Likes & Interactions',
    category: 'notifications',
    access: 'authenticated',
    layout: 'app',
    description: 'Notifications of likes, saves, and shares across your published posts.'
  },
  {
    id: 'notifications-comments',
    path: '/notifications/comments',
    title: 'Comments & Replies',
    category: 'notifications',
    access: 'authenticated',
    layout: 'app',
    description: 'Alerts when someone comments on your posts or replies to your remarks.'
  },
  {
    id: 'notifications-mentions',
    path: '/notifications/mentions',
    title: 'Mentions & Tags',
    category: 'notifications',
    access: 'authenticated',
    layout: 'app',
    description: 'Notifications whenever your @handle is cited in a post, comment, or story.'
  },
  {
    id: 'notifications-messages',
    path: '/notifications/messages',
    title: 'Message Alerts',
    category: 'notifications',
    access: 'authenticated',
    layout: 'app',
    description: 'Alerts regarding new incoming direct messages and chat invitations.'
  },
  {
    id: 'notifications-requests',
    path: '/notifications/requests',
    title: 'Requests & Approvals',
    category: 'notifications',
    access: 'authenticated',
    layout: 'app',
    description: 'Follow requests requiring your immediate action or confirmation.'
  },
  {
    id: 'activity-history',
    path: '/activity',
    title: 'Your Activity',
    category: 'notifications',
    access: 'authenticated',
    layout: 'app',
    description: 'Comprehensive audit of your time spent, likes given, and search history.'
  },

  // ==========================================
  // SECTION J: ACCOUNT, PRIVACY & SETTINGS (95–108)
  // ==========================================
  {
    id: 'settings-index',
    path: '/settings',
    title: 'Settings Overview',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Main settings navigation portal providing access to all preferences.'
  },
  {
    id: 'settings-account',
    path: '/settings/account',
    title: 'Account Center',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Manage personal details, registered email address, and account creation metadata.'
  },
  {
    id: 'settings-profile',
    path: '/settings/profile',
    title: 'Profile Settings',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Configure bio, website, full name, and pronoun settings.'
  },
  {
    id: 'settings-privacy',
    path: '/settings/privacy',
    title: 'Account Privacy',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Toggle private account status, activity status, and mentions permissions.'
  },
  {
    id: 'settings-security',
    path: '/settings/security',
    title: 'Security Center',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Security overview including password health, 2FA status, and trusted devices.'
  },
  {
    id: 'settings-password',
    path: '/settings/password',
    title: 'Change Password',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Update account password with current credential verification.'
  },
  {
    id: 'settings-sessions',
    path: '/settings/sessions',
    title: 'Active Sessions',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Inspect authenticated devices, IP addresses, and revoke active sessions.'
  },
  {
    id: 'settings-two-factor',
    path: '/settings/two-factor',
    title: 'Two-Factor Configuration',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Enable, configure, or disable authenticator app two-factor verification.'
  },
  {
    id: 'settings-notifications',
    path: '/settings/notifications',
    title: 'Notification Preferences',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Customize push and in-app alerts for likes, comments, follows, and direct messages.'
  },
  {
    id: 'settings-appearance',
    path: '/settings/appearance',
    title: 'Appearance',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Theme customization supporting Dark Mode, Light Mode, and System Default.'
  },
  {
    id: 'settings-accessibility',
    path: '/settings/accessibility',
    title: 'Accessibility',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Configure high contrast, reduced motion, and media autoplay settings.'
  },
  {
    id: 'settings-language',
    path: '/settings/language',
    title: 'Language',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Select preferred locale, display language, and numeral systems.'
  },
  {
    id: 'settings-data',
    path: '/settings/data',
    title: 'Download Your Data',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Export structured JSON/HTML archive of posts, messages, and profile history.'
  },
  {
    id: 'settings-delete-account',
    path: '/settings/delete-account',
    title: 'Delete Account',
    category: 'settings',
    access: 'authenticated',
    layout: 'app',
    description: 'Permanent account deletion and data anonymization flow with password confirmation.'
  },

  // ==========================================
  // SECTION K: SAFETY, HELP & LEGAL (109–116)
  // ==========================================
  {
    id: 'safety-center',
    path: '/safety',
    title: 'Safety Center',
    category: 'safety',
    access: 'public',
    layout: 'app',
    description: 'Community guidelines, safety tips, anti-harassment tools, and resources.'
  },
  {
    id: 'safety-blocked',
    path: '/safety/blocked',
    title: 'Safety Blocked Accounts',
    category: 'safety',
    access: 'authenticated',
    layout: 'app',
    description: 'Detailed blocked accounts management and mutual severance controls.'
  },
  {
    id: 'safety-restricted',
    path: '/safety/restricted',
    title: 'Restricted Accounts',
    category: 'safety',
    access: 'authenticated',
    layout: 'app',
    description: 'Manage accounts with silent comment filtering without alerting the target.'
  },
  {
    id: 'reports-new',
    path: '/reports/new',
    title: 'Submit a Report',
    category: 'safety',
    access: 'authenticated',
    layout: 'app',
    description: 'File a formal violation report against a user, post, message, or reel.'
  },
  {
    id: 'reports-history',
    path: '/reports/history',
    title: 'My Report History',
    category: 'safety',
    access: 'authenticated',
    layout: 'app',
    description: 'Track the status and resolution of previously filed moderation tickets.'
  },
  {
    id: 'help-center',
    path: '/help',
    title: 'Help Center',
    category: 'help',
    access: 'public',
    layout: 'app',
    description: 'Searchable knowledge base, FAQs, and platform troubleshooting documentation.'
  },
  {
    id: 'help-contact',
    path: '/help/contact',
    title: 'Contact Support',
    category: 'help',
    access: 'public',
    layout: 'app',
    description: 'Direct inquiry and bug submission form with ticket persistence.'
  },
  {
    id: 'legal-index',
    path: '/legal',
    title: 'Terms & Policies',
    category: 'legal',
    access: 'public',
    layout: 'app',
    description: 'Terms of Service, Privacy Policy, Community Standards, and Cookie policies.'
  },

  // ==========================================
  // SECTION L: ADMINISTRATION & MODERATION (117–120)
  // ==========================================
  {
    id: 'admin-dashboard',
    path: '/admin',
    title: 'Admin Dashboard',
    category: 'admin',
    access: 'admin',
    layout: 'admin',
    description: 'Administrative portal with platform metrics, user counts, and system status.'
  },
  {
    id: 'admin-users',
    path: '/admin/users',
    title: 'User Management',
    category: 'admin',
    access: 'admin',
    layout: 'admin',
    description: 'Moderator controls to search, inspect, ban, unban, or verify users.'
  },
  {
    id: 'admin-reports',
    path: '/admin/reports',
    title: 'Moderation Queue',
    category: 'admin',
    access: 'admin',
    layout: 'admin',
    description: 'Review and resolve reported posts, reels, comments, and abusive accounts.'
  },
  {
    id: 'admin-audit',
    path: '/admin/audit',
    title: 'Audit Logs',
    category: 'admin',
    access: 'admin',
    layout: 'admin',
    description: 'Immutable trail of administrative decisions, bans, and policy enforcements.'
  }
];

/**
 * Helper to fetch a route definition by its unique identifier.
 */
export function getRouteById(id) {
  return ROUTE_REGISTRY.find((r) => r.id === id);
}

/**
 * Helper to fetch all routes under a given category.
 */
export function getRoutesByCategory(category) {
  return ROUTE_REGISTRY.filter((r) => r.category === category);
}

/**
 * Returns list of distinct categories with count.
 */
export function getCategorySummary() {
  const counts = {};
  for (const route of ROUTE_REGISTRY) {
    counts[route.category] = (counts[route.category] || 0) + 1;
  }
  return counts;
}

export default ROUTE_REGISTRY;
