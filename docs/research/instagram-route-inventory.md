# Instagram Route Inventory & Product Architecture

## 1. Route Architecture Overview

This document provides the route catalog, screen entry points, layout shell, data dependencies, loading states, empty states, error handling, and visual verification status for all 120 user-facing routes across the Instagram-inspired application.

All routes are mounted within `frontend/src/AppRoutes.jsx` and consume shared components and tokens defined in `docs/research/instagram-ui-specification.md`.

---

## 2. Core Surface Inventory

| ID | Route Path | Title | Category | Shell Layout | Auth Req | Primary Components | State Variants | Verification Status |
|---|---|---|---|---|---|---|---|---|
| **R-001** | `/` | Home Feed | Feed & Social | MainAppShell | Yes | StoriesTray, FeedPostCard, SuggestedUsersAside | Default, Scrolled, EmptyFeed, PostLoading | Verified (IGREF-0160) |
| **R-002** | `/explore` | Explore | Discovery | MainAppShell | Optional | ExploreGrid, CategoryPills, MediaTile | Default, Scrolled, TagFiltered, TileModal | Verified (IGREF-0300) |
| **R-003** | `/reels` | Reels | Short Video | MainAppShell | Optional | ReelPlayer, ReelActionRail, AudioTicker | Autoplay, Paused, NextReel, CommentsDrawer | Verified (IGREF-0400) |
| **R-004** | `/direct/inbox` | Direct Inbox | Messaging | MainAppShell | Yes | ConversationList, ChatHeroCard, EmptyChatState | Default, ThreadSelected, SearchQuery | Verified (IGREF-0450) |
| **R-005** | `/direct/t/:id` | Direct Conversation | Messaging | MainAppShell | Yes | ChatHeader, MessageBubbleCluster, PillInputBar | Active, Typing, MultiMessage, ImageAttached | Verified (IGREF-0470) |
| **R-006** | `/notifications` | Notifications | Activity | MainAppShell | Yes | ActivityGroupList, NotificationItem, FollowButton | Today, ThisWeek, Earlier, EmptyActivity | Verified (IGREF-0510) |
| **R-007** | `/profile/:username` | User Profile | Identity | MainAppShell | Optional | ProfileHeader, HighlightTray, ProfileTabs, MediaGrid | Owner, Followed, NotFollowed, PrivateLocked | Verified (IGREF-0240) |
| **R-008** | `/profile/:username/reels` | Profile Reels | Video | MainAppShell | Optional | ProfileHeader, ReelsGrid, VideoCard | Default, EmptyReels | Verified (IGREF-0260) |
| **R-009** | `/profile/:username/saved` | Saved Posts | Bookmarks | MainAppShell | Yes (Owner) | ProfileHeader, SavedGrid, CollectionPills | Default, EmptySaved | Verified (IGREF-0280) |
| **R-010** | `/profile/:username/tagged` | Tagged Posts | Media | MainAppShell | Optional | ProfileHeader, TaggedGrid, TagOverlay | Default, EmptyTagged | Verified (IGREF-0290) |
| **R-011** | `/p/:id` | Post Detail | Media | MainAppShell | Optional | PostDetailModal, CommentStream, Composer | Default, ExpandedComments, ShareModal | Verified (IGREF-0200) |
| **R-012** | `/stories/:username/:storyId` | Story Viewer | Ephemeral | FullscreenModal | Optional | StoryProgressBar, StoryMedia, StoryReplyBar | Playing, Paused, NextStory, ReactEmoji | Verified (IGREF-0350) |
| **R-013** | `/accounts/login` | Login | Authentication | AuthShell | No | LoginCard, CredentialsForm, FacebookLoginBtn | Default, InputFocused, ErrorValidation | Verified (IGREF-0010) |
| **R-014** | `/accounts/emailsignup` | Sign Up | Authentication | AuthShell | No | SignupCard, RegistrationForm, TermsNotice | Default, PasswordStrength, Submitting | Verified (IGREF-0090) |
| **R-015** | `/accounts/password/reset` | Reset Password | Authentication | AuthShell | No | PasswordResetCard, ResetEmailForm, BackToLogin | Default, EmailSentConfirmation | Verified (IGREF-0130) |
| **R-016** | `/accounts/edit` | Edit Profile | Settings | SettingsShell | Yes | SettingsNavSidebar, ProfileForm, AvatarUpload | Default, Saving, AvatarUpdating | Verified (IGREF-0550) |
| **R-017** | `/accounts/password/change` | Change Password | Settings | SettingsShell | Yes | SettingsNavSidebar, PasswordChangeForm | Default, SuccessToast, ErrorMismatch | Verified (IGREF-0570) |
| **R-018** | `/accounts/privacy_and_security` | Privacy & Security | Settings | SettingsShell | Yes | PrivacyToggles, 2FASection, AccountDataExport | Default, PrivateAccountToggled | Verified (IGREF-0590) |
| **R-019** | `/accounts/notifications` | Push Notifications | Settings | SettingsShell | Yes | NotificationPreferences, PauseAllToggle | Default, CategoryToggled | Verified (IGREF-0610) |
| **R-020** | `/accounts/blocked_accounts` | Blocked Accounts | Settings | SettingsShell | Yes | BlockedUserList, UnblockActionModal | EmptyBlocked, UserBlockedList | Verified (IGREF-0630) |
| **R-021** | `/accounts/close_friends` | Close Friends | Privacy | SettingsShell | Yes | CloseFriendsList, UserSearchPill, SaveButton | Default, UserAdded, UserRemoved | Verified (IGREF-0650) |
| **R-022** | `/create/select` | Create Media Select | Creation | ModalOverlay | Yes | DragDropZone, FilePickerBtn, MediaValidator | DragOver, FileSelected, InvalidFormat | Verified (IGREF-0680) |
| **R-023** | `/create/crop` | Create Crop & Aspect | Creation | ModalOverlay | Yes | CropViewport, AspectRatioPills (1:1, 4:5, 16:9) | 1:1, 4:5, 16:9, ZoomSlider | Verified (IGREF-0690) |
| **R-024** | `/create/details` | Create Post Details | Creation | ModalOverlay | Yes | MediaPreview, CaptionArea, TagPeople, ShareBtn | TypingCaption, LocationQuery, SharingProgress | Verified (IGREF-0710) |
| **R-025** | `/search` | Search Mobile / Modal | Discovery | MainAppShell | Optional | SearchInputBar, RecentSearchChips, ResultList | EmptyQuery, Typing, AccountsFound, TagsFound | Verified (IGREF-0320) |
| **R-026** | `/tags/:tag` | Hashtag Feed | Discovery | MainAppShell | Optional | TagHeader, PostCount, TopPostsGrid, RecentGrid | Default, Scrolled | Verified (IGREF-0330) |
| **R-027** | `/locations/:id` | Location Feed | Discovery | MainAppShell | Optional | LocationHeader, MapSnippet, LocationMediaGrid | Default, Scrolled | Verified (IGREF-0340) |
| **R-028** | `/legal/terms` | Terms of Use | Legal | LegalShell | No | LegalContentContainer, SectionNav, LanguageSelect | Default, ScrolledSection | Verified (IGREF-0740) |
| **R-029** | `/legal/privacy` | Privacy Policy | Legal | LegalShell | No | PrivacyNoticeContainer, DataRightsAccordion | Default, SectionExpanded | Verified (IGREF-0760) |
| **R-030** | `/help` | Help Center | Support | SupportShell | No | HelpSearchBar, TopicCategories, FAQArticles | Default, QueryResult | Verified (IGREF-0780) |

---

## 3. Extended 120-Route Comprehensive Product Matrix

The full application architecture comprises all 120 functional routes defined in `frontend/src/AppRoutes.jsx`, grouped into:
1. **Authentication & Identity (12 routes)**: Login, Register, Password Reset, Two-Factor Authentication, Session Manager, Logout, Account Recovery, Email Verification, Terms Agreement.
2. **Feed & Social Engagement (18 routes)**: Home Feed, Following Feed, Favorites Feed, Post Details, Likes Overlay, Comments Overlay, Reposts, Share Sheet, Suggested Accounts.
3. **Profiles & Relationships (20 routes)**: User Profile, Followers List, Following List, Mutual Followers, Blocked Profiles, Restricted Profiles, Profile QR Code, Edit Profile, Edit Bio, Highlight Management.
4. **Stories & Ephemeral Media (14 routes)**: Story Viewer, Story Creator, Story Highlights, Archive Stories, Story Reactions, Close Friends Story, Expired Stories.
5. **Reels & Video Discovery (12 routes)**: Reels Infinite Feed, Reel Detail, Audio Track Page, Trending Reels, Saved Audio, Remix Reel, Video Player Controls.
6. **Search & Explore (10 routes)**: Explore Grid, Hashtag Discovery, Location Discovery, Search Results Filter, Recent Searches Manager.
7. **Direct Messaging & Realtime (14 routes)**: Inbox, Direct Thread, Group Conversation, Media Message Viewer, Voice Message Player, Thread Settings, Pending Requests, Video Call Placeholder.
8. **Settings, Controls & Privacy (12 routes)**: Account Center, Password Security, Login Activity, Blocked Users, Muted Accounts, Hidden Words Filter, Language Preferences, Theme Preferences.
9. **Creation & Publishing (8 routes)**: Media Selector, Cropper, Filter Selector, Caption Composer, Tagging Tool, Location Tag, Final Review.

---

## 4. Layout Shell Strategy

- **`MainAppShell`**: Hosts sidebar (expanded/collapsed), notification flyout, search flyout, create post modal, and bottom navigation on mobile.
- **`AuthShell`**: Minimalist centered card layout with Instagram wordmark, app badges, footer links, and background phone mockup illustration.
- **`SettingsShell`**: Two-column layout with left navigation list and right form content card.
- **`ModalOverlay`**: Backdrop blur `#000000AA`, centered dialog with `max-w-[700px]`, `rounded-[12px]`, header with title and back/next actions.
