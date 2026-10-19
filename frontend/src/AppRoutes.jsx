import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppShell from './components/layout/AppShell';
import AuthLayout from './components/layout/AuthLayout';
import AdminLayout from './components/layout/AdminLayout';
import MinimalLayout from './components/layout/MinimalLayout';

// Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import GuestRoute from './components/common/GuestRoute';

// Section A: Onboarding & Auth
import LandingRouter from './pages/auth/LandingRouter';
import WelcomePage from './pages/auth/WelcomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ConfirmAccountPage from './pages/auth/ConfirmAccountPage';
import TwoFactorPage from './pages/auth/TwoFactorPage';
import RecoveryCodesPage from './pages/auth/RecoveryCodesPage';
import SessionExpiredPage from './pages/auth/SessionExpiredPage';
import LogoutPage from './pages/auth/LogoutPage';

// Section B: Home & Feeds
import FeedPage from './pages/feed/FeedPage';
import FollowingFeedPage from './pages/feed/FollowingFeedPage';
import LatestFeedPage from './pages/feed/LatestFeedPage';
import SavedFeedPage from './pages/feed/SavedFeedPage';
import LikedFeedPage from './pages/feed/LikedFeedPage';
import MentionsFeedPage from './pages/feed/MentionsFeedPage';
import HashtagsFeedPage from './pages/feed/HashtagsFeedPage';
import MediaFeedPage from './pages/feed/MediaFeedPage';
import ActivityFeedPage from './pages/feed/ActivityFeedPage';
import DraftsFeedPage from './pages/feed/DraftsFeedPage';
import ArchivedFeedPage from './pages/feed/ArchivedFeedPage';
import RecentlyViewedFeedPage from './pages/feed/RecentlyViewedFeedPage';

// Section C: Profiles & Social
import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import ProfileAvatarPage from './pages/profile/ProfileAvatarPage';
import ProfileCoverPage from './pages/profile/ProfileCoverPage';
import ProfilePostsPage from './pages/profile/ProfilePostsPage';
import ProfileReelsPage from './pages/profile/ProfileReelsPage';
import ProfileTaggedPage from './pages/profile/ProfileTaggedPage';
import ProfileFollowersPage from './pages/profile/ProfileFollowersPage';
import ProfileFollowingPage from './pages/profile/ProfileFollowingPage';
import ProfileRequestsPage from './pages/profile/ProfileRequestsPage';
import ProfilePendingPage from './pages/profile/ProfilePendingPage';
import ProfileBlockedPage from './pages/profile/ProfileBlockedPage';

// Section D: Posts & Comments
import PostCreatePage from './pages/posts/PostCreatePage';
import PostPreviewPage from './pages/posts/PostPreviewPage';
import PostDetailPage from './pages/posts/PostDetailPage';
import PostEditPage from './pages/posts/PostEditPage';
import PostCommentsPage from './pages/posts/PostCommentsPage';
import PostLikersPage from './pages/posts/PostLikersPage';
import PostSharesPage from './pages/posts/PostSharesPage';
import PostInsightsPage from './pages/posts/PostInsightsPage';
import PostReportPage from './pages/posts/PostReportPage';
import PostSavePage from './pages/posts/PostSavePage';
import CollectionsPage from './pages/posts/CollectionsPage';
import CollectionDetailPage from './pages/posts/CollectionDetailPage';

// Section E: Stories
import StoriesFeedPage from './pages/stories/StoriesFeedPage';
import StoryCreatePage from './pages/stories/StoryCreatePage';
import StoryPreviewPage from './pages/stories/StoryPreviewPage';
import StoryViewerPage from './pages/stories/StoryViewerPage';
import StoryViewersPage from './pages/stories/StoryViewersPage';
import StoryArchivePage from './pages/stories/StoryArchivePage';
import StoryHighlightsPage from './pages/stories/StoryHighlightsPage';
import StoryHighlightDetailPage from './pages/stories/StoryHighlightDetailPage';

// Section F: Reels & Video
import ReelsPage from './pages/reels/ReelsPage';
import ReelsFollowingPage from './pages/reels/ReelsFollowingPage';
import ReelsTrendingPage from './pages/reels/ReelsTrendingPage';
import ReelCreatePage from './pages/reels/ReelCreatePage';
import ReelDetailPage from './pages/reels/ReelDetailPage';
import ReelCommentsPage from './pages/reels/ReelCommentsPage';
import ReelInsightsPage from './pages/reels/ReelInsightsPage';
import ReelsSavedPage from './pages/reels/ReelsSavedPage';

// Section G: Search & Explore
import SearchPage from './pages/search/SearchPage';
import SearchPeoplePage from './pages/search/SearchPeoplePage';
import SearchPostsPage from './pages/search/SearchPostsPage';
import SearchHashtagsPage from './pages/search/SearchHashtagsPage';
import SearchPlacesPage from './pages/search/SearchPlacesPage';
import SearchRecentPage from './pages/search/SearchRecentPage';
import ExploreLandingPage from './pages/explore/ExploreLandingPage';
import ExplorePeoplePage from './pages/explore/ExplorePeoplePage';
import ExploreTopicsPage from './pages/explore/ExploreTopicsPage';
import ExploreCategoryPage from './pages/explore/ExploreCategoryPage';

// Section H: Direct Messaging
import MessagesPage from './pages/messages/MessagesPage';
import DirectConversationPage from './pages/messages/DirectConversationPage';
import DirectNewPage from './pages/messages/DirectNewPage';
import DirectRequestsPage from './pages/messages/DirectRequestsPage';
import DirectArchivedPage from './pages/messages/DirectArchivedPage';
import DirectStarredPage from './pages/messages/DirectStarredPage';
import DirectDetailsPage from './pages/messages/DirectDetailsPage';
import DirectMediaPage from './pages/messages/DirectMediaPage';
import DirectMembersPage from './pages/messages/DirectMembersPage';
import DirectSearchPage from './pages/messages/DirectSearchPage';
import DirectGroupRequestsPage from './pages/messages/DirectGroupRequestsPage';
import DirectSettingsPage from './pages/messages/DirectSettingsPage';

// Section I: Notifications & Activity
import NotificationsPage from './pages/notifications/NotificationsPage';
import NotificationsFollowingPage from './pages/notifications/NotificationsFollowingPage';
import NotificationsPostsPage from './pages/notifications/NotificationsPostsPage';
import NotificationsCommentsPage from './pages/notifications/NotificationsCommentsPage';
import NotificationsMentionsPage from './pages/notifications/NotificationsMentionsPage';
import NotificationsMessagesPage from './pages/notifications/NotificationsMessagesPage';
import NotificationsRequestsPage from './pages/notifications/NotificationsRequestsPage';
import ActivityHistoryPage from './pages/notifications/ActivityHistoryPage';

// Section J: Settings & Account
import SettingsPage from './pages/settings/SettingsPage';
import SettingsAccountPage from './pages/settings/SettingsAccountPage';
import SettingsProfilePage from './pages/settings/SettingsProfilePage';
import SettingsPrivacyPage from './pages/settings/SettingsPrivacyPage';
import SettingsSecurityPage from './pages/settings/SettingsSecurityPage';
import SettingsPasswordPage from './pages/settings/SettingsPasswordPage';
import SettingsSessionsPage from './pages/settings/SettingsSessionsPage';
import SettingsTwoFactorPage from './pages/settings/SettingsTwoFactorPage';
import SettingsNotificationsPage from './pages/settings/SettingsNotificationsPage';
import SettingsAppearancePage from './pages/settings/SettingsAppearancePage';
import SettingsAccessibilityPage from './pages/settings/SettingsAccessibilityPage';
import SettingsLanguagePage from './pages/settings/SettingsLanguagePage';
import SettingsDataPage from './pages/settings/SettingsDataPage';
import SettingsDeleteAccountPage from './pages/settings/SettingsDeleteAccountPage';

// Section K: Safety, Help & Legal
import SafetyCenterPage from './pages/safety/SafetyCenterPage';
import SafetyBlockedPage from './pages/safety/SafetyBlockedPage';
import SafetyRestrictedPage from './pages/safety/SafetyRestrictedPage';
import ReportsNewPage from './pages/reports/ReportsNewPage';
import ReportsHistoryPage from './pages/reports/ReportsHistoryPage';
import HelpCenterPage from './pages/help/HelpCenterPage';
import HelpContactPage from './pages/help/HelpContactPage';
import LegalPage from './pages/legal/LegalPage';

// Section L: Admin & Moderation
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';

// 404
import NotFoundPage from './pages/common/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ======================================================== */}
      {/* AUTH LAYOUT ROUTES                                      */}
      {/* ======================================================== */}
      <Route element={<AuthLayout />}>
        {/* Public / Entry */}
        <Route path="/" element={<LandingRouter />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/confirm-account" element={<ConfirmAccountPage />} />
        <Route path="/auth/two-factor" element={<TwoFactorPage />} />
        <Route path="/auth/session-expired" element={<SessionExpiredPage />} />
        <Route path="/auth/logout" element={<LogoutPage />} />

        {/* Guest Only */}
        <Route path="/auth/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/auth/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/auth/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/auth/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      </Route>

      {/* ======================================================== */}
      {/* MINIMAL LAYOUT (Stories Viewer, Preview, Highlights)     */}
      {/* ======================================================== */}
      <Route element={<ProtectedRoute><MinimalLayout /></ProtectedRoute>}>
        <Route path="/stories/preview" element={<StoryPreviewPage />} />
        <Route path="/stories/:storyId" element={<StoryViewerPage />} />
        <Route path="/stories/highlights/:highlightId" element={<StoryHighlightDetailPage />} />
      </Route>

      {/* ======================================================== */}
      {/* ADMIN LAYOUT (Pages 117–120)                            */}
      {/* ======================================================== */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/audit" element={<AdminAuditPage />} />
      </Route>

      {/* ======================================================== */}
      {/* APP SHELL (Main Platform Experience)                     */}
      {/* ======================================================== */}
      <Route element={<AppShell />}>
        {/* Public or Semi-Public in App Shell */}
        <Route path="/users/:username" element={<ProfilePage />} />
        <Route path="/safety" element={<SafetyCenterPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/help/contact" element={<HelpContactPage />} />
        <Route path="/legal" element={<LegalPage />} />

        {/* Protected Application Routes */}
        <Route path="/home" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
        <Route path="/feed/following" element={<ProtectedRoute><FollowingFeedPage /></ProtectedRoute>} />
        <Route path="/feed/latest" element={<ProtectedRoute><LatestFeedPage /></ProtectedRoute>} />
        <Route path="/feed/saved" element={<ProtectedRoute><SavedFeedPage /></ProtectedRoute>} />
        <Route path="/feed/liked" element={<ProtectedRoute><LikedFeedPage /></ProtectedRoute>} />
        <Route path="/feed/mentions" element={<ProtectedRoute><MentionsFeedPage /></ProtectedRoute>} />
        <Route path="/feed/hashtags" element={<ProtectedRoute><HashtagsFeedPage /></ProtectedRoute>} />
        <Route path="/feed/media" element={<ProtectedRoute><MediaFeedPage /></ProtectedRoute>} />
        <Route path="/feed/activity" element={<ProtectedRoute><ActivityFeedPage /></ProtectedRoute>} />
        <Route path="/feed/drafts" element={<ProtectedRoute><DraftsFeedPage /></ProtectedRoute>} />
        <Route path="/feed/archived" element={<ProtectedRoute><ArchivedFeedPage /></ProtectedRoute>} />
        <Route path="/feed/recently-viewed" element={<ProtectedRoute><RecentlyViewedFeedPage /></ProtectedRoute>} />

        {/* Section C: Profiles */}
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/profile/avatar" element={<ProtectedRoute><ProfileAvatarPage /></ProtectedRoute>} />
        <Route path="/profile/cover" element={<ProtectedRoute><ProfileCoverPage /></ProtectedRoute>} />
        <Route path="/profile/posts" element={<ProtectedRoute><ProfilePostsPage /></ProtectedRoute>} />
        <Route path="/profile/reels" element={<ProtectedRoute><ProfileReelsPage /></ProtectedRoute>} />
        <Route path="/profile/tagged" element={<ProtectedRoute><ProfileTaggedPage /></ProtectedRoute>} />
        <Route path="/profile/followers" element={<ProtectedRoute><ProfileFollowersPage /></ProtectedRoute>} />
        <Route path="/profile/following" element={<ProtectedRoute><ProfileFollowingPage /></ProtectedRoute>} />
        <Route path="/profile/requests" element={<ProtectedRoute><ProfileRequestsPage /></ProtectedRoute>} />
        <Route path="/profile/pending" element={<ProtectedRoute><ProfilePendingPage /></ProtectedRoute>} />
        <Route path="/profile/blocked" element={<ProtectedRoute><ProfileBlockedPage /></ProtectedRoute>} />

        {/* Section D: Posts & Comments */}
        <Route path="/create/post" element={<ProtectedRoute><PostCreatePage /></ProtectedRoute>} />
        <Route path="/create/post/preview" element={<ProtectedRoute><PostPreviewPage /></ProtectedRoute>} />
        <Route path="/posts/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
        <Route path="/posts/:postId/edit" element={<ProtectedRoute><PostEditPage /></ProtectedRoute>} />
        <Route path="/posts/:postId/comments" element={<ProtectedRoute><PostCommentsPage /></ProtectedRoute>} />
        <Route path="/posts/:postId/likers" element={<ProtectedRoute><PostLikersPage /></ProtectedRoute>} />
        <Route path="/posts/:postId/shares" element={<ProtectedRoute><PostSharesPage /></ProtectedRoute>} />
        <Route path="/posts/:postId/insights" element={<ProtectedRoute><PostInsightsPage /></ProtectedRoute>} />
        <Route path="/posts/:postId/report" element={<ProtectedRoute><PostReportPage /></ProtectedRoute>} />
        <Route path="/posts/:postId/save" element={<ProtectedRoute><PostSavePage /></ProtectedRoute>} />
        <Route path="/collections" element={<ProtectedRoute><CollectionsPage /></ProtectedRoute>} />
        <Route path="/collections/:collectionId" element={<ProtectedRoute><CollectionDetailPage /></ProtectedRoute>} />

        {/* Section E: Stories (App Shell parts) */}
        <Route path="/stories" element={<ProtectedRoute><StoriesFeedPage /></ProtectedRoute>} />
        <Route path="/stories/create" element={<ProtectedRoute><StoryCreatePage /></ProtectedRoute>} />
        <Route path="/stories/:storyId/viewers" element={<ProtectedRoute><StoryViewersPage /></ProtectedRoute>} />
        <Route path="/stories/archive" element={<ProtectedRoute><StoryArchivePage /></ProtectedRoute>} />
        <Route path="/stories/highlights" element={<ProtectedRoute><StoryHighlightsPage /></ProtectedRoute>} />

        {/* Section F: Reels */}
        <Route path="/reels" element={<ProtectedRoute><ReelsPage /></ProtectedRoute>} />
        <Route path="/reels/following" element={<ProtectedRoute><ReelsFollowingPage /></ProtectedRoute>} />
        <Route path="/reels/trending" element={<ProtectedRoute><ReelsTrendingPage /></ProtectedRoute>} />
        <Route path="/reels/create" element={<ProtectedRoute><ReelCreatePage /></ProtectedRoute>} />
        <Route path="/reels/:reelId" element={<ProtectedRoute><ReelDetailPage /></ProtectedRoute>} />
        <Route path="/reels/:reelId/comments" element={<ProtectedRoute><ReelCommentsPage /></ProtectedRoute>} />
        <Route path="/reels/:reelId/insights" element={<ProtectedRoute><ReelInsightsPage /></ProtectedRoute>} />
        <Route path="/reels/saved" element={<ProtectedRoute><ReelsSavedPage /></ProtectedRoute>} />

        {/* Section G: Search & Explore */}
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/search/people" element={<ProtectedRoute><SearchPeoplePage /></ProtectedRoute>} />
        <Route path="/search/posts" element={<ProtectedRoute><SearchPostsPage /></ProtectedRoute>} />
        <Route path="/search/hashtags" element={<ProtectedRoute><SearchHashtagsPage /></ProtectedRoute>} />
        <Route path="/search/places" element={<ProtectedRoute><SearchPlacesPage /></ProtectedRoute>} />
        <Route path="/search/recent" element={<ProtectedRoute><SearchRecentPage /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><ExploreLandingPage /></ProtectedRoute>} />
        <Route path="/explore/people" element={<ProtectedRoute><ExplorePeoplePage /></ProtectedRoute>} />
        <Route path="/explore/topics" element={<ProtectedRoute><ExploreTopicsPage /></ProtectedRoute>} />
        <Route path="/explore/:category" element={<ProtectedRoute><ExploreCategoryPage /></ProtectedRoute>} />

        {/* Section H: Direct Messaging */}
        <Route path="/direct" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/direct/:conversationId" element={<ProtectedRoute><DirectConversationPage /></ProtectedRoute>} />
        <Route path="/direct/new" element={<ProtectedRoute><DirectNewPage /></ProtectedRoute>} />
        <Route path="/direct/requests" element={<ProtectedRoute><DirectRequestsPage /></ProtectedRoute>} />
        <Route path="/direct/archived" element={<ProtectedRoute><DirectArchivedPage /></ProtectedRoute>} />
        <Route path="/direct/starred" element={<ProtectedRoute><DirectStarredPage /></ProtectedRoute>} />
        <Route path="/direct/:conversationId/details" element={<ProtectedRoute><DirectDetailsPage /></ProtectedRoute>} />
        <Route path="/direct/:conversationId/media" element={<ProtectedRoute><DirectMediaPage /></ProtectedRoute>} />
        <Route path="/direct/:conversationId/members" element={<ProtectedRoute><DirectMembersPage /></ProtectedRoute>} />
        <Route path="/direct/:conversationId/search" element={<ProtectedRoute><DirectSearchPage /></ProtectedRoute>} />
        <Route path="/direct/:conversationId/requests" element={<ProtectedRoute><DirectGroupRequestsPage /></ProtectedRoute>} />
        <Route path="/direct/settings" element={<ProtectedRoute><DirectSettingsPage /></ProtectedRoute>} />

        {/* Section I: Notifications & Activity */}
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/notifications/following" element={<ProtectedRoute><NotificationsFollowingPage /></ProtectedRoute>} />
        <Route path="/notifications/posts" element={<ProtectedRoute><NotificationsPostsPage /></ProtectedRoute>} />
        <Route path="/notifications/comments" element={<ProtectedRoute><NotificationsCommentsPage /></ProtectedRoute>} />
        <Route path="/notifications/mentions" element={<ProtectedRoute><NotificationsMentionsPage /></ProtectedRoute>} />
        <Route path="/notifications/messages" element={<ProtectedRoute><NotificationsMessagesPage /></ProtectedRoute>} />
        <Route path="/notifications/requests" element={<ProtectedRoute><NotificationsRequestsPage /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><ActivityHistoryPage /></ProtectedRoute>} />

        {/* Section J: Settings */}
        <Route path="/auth/recovery-codes" element={<ProtectedRoute><RecoveryCodesPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/settings/account" element={<ProtectedRoute><SettingsAccountPage /></ProtectedRoute>} />
        <Route path="/settings/profile" element={<ProtectedRoute><SettingsProfilePage /></ProtectedRoute>} />
        <Route path="/settings/privacy" element={<ProtectedRoute><SettingsPrivacyPage /></ProtectedRoute>} />
        <Route path="/settings/security" element={<ProtectedRoute><SettingsSecurityPage /></ProtectedRoute>} />
        <Route path="/settings/password" element={<ProtectedRoute><SettingsPasswordPage /></ProtectedRoute>} />
        <Route path="/settings/sessions" element={<ProtectedRoute><SettingsSessionsPage /></ProtectedRoute>} />
        <Route path="/settings/two-factor" element={<ProtectedRoute><SettingsTwoFactorPage /></ProtectedRoute>} />
        <Route path="/settings/notifications" element={<ProtectedRoute><SettingsNotificationsPage /></ProtectedRoute>} />
        <Route path="/settings/appearance" element={<ProtectedRoute><SettingsAppearancePage /></ProtectedRoute>} />
        <Route path="/settings/accessibility" element={<ProtectedRoute><SettingsAccessibilityPage /></ProtectedRoute>} />
        <Route path="/settings/language" element={<ProtectedRoute><SettingsLanguagePage /></ProtectedRoute>} />
        <Route path="/settings/data" element={<ProtectedRoute><SettingsDataPage /></ProtectedRoute>} />
        <Route path="/settings/delete-account" element={<ProtectedRoute><SettingsDeleteAccountPage /></ProtectedRoute>} />

        {/* Section K: Safety authenticated routes */}
        <Route path="/safety/blocked" element={<ProtectedRoute><SafetyBlockedPage /></ProtectedRoute>} />
        <Route path="/safety/restricted" element={<ProtectedRoute><SafetyRestrictedPage /></ProtectedRoute>} />
        <Route path="/reports/new" element={<ProtectedRoute><ReportsNewPage /></ProtectedRoute>} />
        <Route path="/reports/history" element={<ProtectedRoute><ReportsHistoryPage /></ProtectedRoute>} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
