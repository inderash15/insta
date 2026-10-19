# API Reference

Complete documentation of all REST API endpoints implemented across the backend server.

## 1. Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new account with `{ username, email, password, fullName }`. Sets httpOnly session cookie.
- `POST /api/auth/login`: Authenticate with `{ login, password }`. Sets httpOnly cookie.
- `POST /api/auth/logout`: Clears session cookie and invalidates session.
- `GET /api/auth/me`: Restores session from valid cookie. Returns authenticated user payload.
- `POST /api/auth/forgot-password`: Dispatches password recovery request token.
- `POST /api/auth/reset-password`: Resets password using valid token.
- `GET /api/auth/sessions`: Lists active sessions and client IP/user agent.
- `DELETE /api/auth/sessions/:sessionId`: Revokes specific session.

## 2. Users & Social Graph (`/api/users`)
- `GET /api/users/:username`: Retrieves user profile, bio, counts, and relationship status.
- `PUT /api/users/profile`: Updates name, bio, website, and privacy status.
- `POST /api/users/avatar`: Uploads and updates profile avatar image.
- `POST /api/users/:id/follow`: Follows user (or creates pending request if target is private).
- `POST /api/users/:id/unfollow`: Unfollows user and decrements follower counts.
- `POST /api/users/:id/block`: Blocks target user, revoking mutual follows.
- `POST /api/users/:id/unblock`: Removes block.
- `GET /api/users/:id/followers`: Fetches paginated follower list.
- `GET /api/users/:id/following`: Fetches paginated following list.
- `GET /api/users/requests/pending`: Lists pending follow requests for private account.
- `POST /api/users/requests/:requestId/accept`: Accepts follow request.
- `POST /api/users/requests/:requestId/reject`: Declines follow request.

## 3. Posts & Comments (`/api/posts`)
- `POST /api/posts`: Uploads media and creates post with caption, tags, and mentions.
- `GET /api/posts/feed`: Personalized home feed of followed accounts.
- `GET /api/posts/latest`: Chronological global feed.
- `GET /api/posts/saved`: Feed of bookmarked posts.
- `GET /api/posts/liked`: Feed of user liked posts.
- `GET /api/posts/:id`: Single post detail with populated author and comments.
- `PUT /api/posts/:id`: Updates post caption.
- `DELETE /api/posts/:id`: Deletes post and removes linked media.
- `POST /api/posts/:id/like`: Toggles like on a post.
- `POST /api/posts/:id/save`: Toggles bookmark / collection save.
- `GET /api/posts/:id/comments`: Retrieves comments and replies.
- `POST /api/posts/:id/comments`: Adds a new comment to post.
- `DELETE /api/posts/:id/comments/:commentId`: Deletes a comment.

## 4. Stories & Highlights (`/api/stories`)
- `POST /api/stories`: Uploads story media (24-hour expiration TTL).
- `GET /api/stories/feed`: Retrieves active stories grouped by followed user.
- `GET /api/stories/:id`: Fetches single story item and marks view.
- `GET /api/stories/:id/viewers`: Returns list of viewers (author only).
- `DELETE /api/stories/:id`: Deletes active story.
- `GET /api/stories/highlights`: Lists user highlights.
- `POST /api/stories/highlights`: Creates a new highlight.

## 5. Reels (`/api/reels`)
- `POST /api/reels`: Uploads video reel with caption and audio title.
- `GET /api/reels/feed`: Vertical reels feed.
- `GET /api/reels/trending`: Top engagement reels.
- `GET /api/reels/:id`: Single reel detail and view count increment.
- `POST /api/reels/:id/like`: Toggles like on reel.
- `DELETE /api/reels/:id`: Deletes author's reel.

## 6. Search & Explore (`/api/search`, `/api/explore`)
- `GET /api/search?q=query`: Global search across users and hashtags.
- `GET /api/search/people?q=query`: Search users by handle and name.
- `GET /api/search/hashtags?q=query`: Search tags and count of posts.
- `GET /api/explore`: High engagement explore media grid.
- `GET /api/explore/people`: Recommended creators.

## 7. Messaging (`/api/conversations`)
- `GET /api/conversations`: Lists conversations with last message preview and unread counts.
- `POST /api/conversations`: Initiates or returns existing 1-on-1 or group conversation.
- `GET /api/conversations/:id/messages`: Paginated message history.
- `POST /api/conversations/:id/messages`: Dispatches message, updates conversation, and broadcasts via Socket.IO.

## 8. Notifications (`/api/notifications`)
- `GET /api/notifications`: Returns unread count and latest notification list.
- `PATCH /api/notifications/:id/read`: Marks individual notification read.
- `PATCH /api/notifications/read-all`: Marks all notifications read.

## 9. Settings, Safety & Help (`/api/settings`, `/api/reports`, `/api/help`)
- `PUT /api/settings/preferences`: Persists theme, accessibility, and notifications settings.
- `POST /api/reports`: Submits violation report on post, user, or message.
- `GET /api/reports/my`: Returns report history filed by user.
- `POST /api/help/contact`: Submits user inquiry ticket.

## 10. Administration (`/api/admin`)
- `GET /api/admin/metrics`: Platform counts (users, posts, reports, active sessions).
- `GET /api/admin/users`: Paginated list of users with search and filter.
- `PATCH /api/admin/users/:id/ban`: Bans or unbans user.
- `GET /api/admin/reports`: Moderation queue with open reports.
- `PATCH /api/admin/reports/:id/resolve`: Resolves or dismisses moderation ticket.
- `GET /api/admin/audit`: Administrative audit log trail.
