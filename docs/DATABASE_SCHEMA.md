# Database Schema & Mongoose Models

This document details the data architecture, collection indexes, relationships, and lifecycle hooks implemented in MongoDB.

## Collections & Schemas

### 1. `User`
- **Fields:**
  - `username` (String, unique, lowercase, indexed)
  - `email` (String, unique, lowercase, indexed)
  - `passwordHash` (String, select: false, bcrypt cost factor 12)
  - `fullName` (String, max 60 chars)
  - `bio` (String, max 150 chars)
  - `website` (String, max 200 chars)
  - `avatarUrl` (String)
  - `isPrivate` (Boolean, default: false)
  - `isVerified` (Boolean, default: false)
  - `isBanned` (Boolean, default: false)
  - `role` (String, enum: `['user', 'moderator', 'admin']`, default: `'user'`)
  - `twoFactorEnabled` (Boolean, default: false)
  - `counts` (`{ posts: Number, followers: Number, following: Number }`)
  - `blockedUsers` (`[ObjectId -> User]`)
  - `restrictedUsers` (`[ObjectId -> User]`)
  - `preferences` (`{ theme: String, notifications: Object, accessibility: Object, language: String }`)
- **Indexes:** `{ username: 1 }`, `{ email: 1 }`

### 2. `Post`
- **Fields:**
  - `author` (`ObjectId -> User`, required, indexed)
  - `media` (`[{ url: String, type: String }]`)
  - `caption` (String, max 2200 chars)
  - `hashtags` (`[String]`, indexed)
  - `mentions` (`[String]`)
  - `likesCount` (Number, default: 0)
  - `commentsCount` (Number, default: 0)
  - `isArchived` (Boolean, default: false)
- **Indexes:** `{ author: 1, createdAt: -1 }`, `{ hashtags: 1 }`, `{ createdAt: -1 }`

### 3. `Comment`
- **Fields:**
  - `post` (`ObjectId -> Post`, required, indexed)
  - `author` (`ObjectId -> User`, required)
  - `content` (String, max 500 chars)
  - `parentComment` (`ObjectId -> Comment`, optional)
  - `likesCount` (Number, default: 0)
- **Indexes:** `{ post: 1, createdAt: 1 }`

### 4. `Like`
- **Fields:**
  - `user` (`ObjectId -> User`, required)
  - `targetType` (String, enum: `['post', 'comment', 'reel']`)
  - `targetId` (`ObjectId`, required)
- **Indexes:** `{ user: 1, targetType: 1, targetId: 1 }` (unique)

### 5. `Follow`
- **Fields:**
  - `follower` (`ObjectId -> User`, required)
  - `following` (`ObjectId -> User`, required)
  - `status` (String, enum: `['active', 'pending']`, default: `'active'`)
- **Indexes:** `{ follower: 1, following: 1 }` (unique), `{ following: 1, status: 1 }`

### 6. `Story`
- **Fields:**
  - `author` (`ObjectId -> User`, required, indexed)
  - `mediaUrl` (String, required)
  - `mediaType` (String, enum: `['image', 'video']`)
  - `viewers` (`[{ user: ObjectId, viewedAt: Date }]`)
  - `createdAt` (Date, default: Date.now, expires: '24h')
- **Indexes:** `{ createdAt: 1 }` (TTL index for 24h expiration)

### 7. `Reel`
- **Fields:**
  - `author` (`ObjectId -> User`, required, indexed)
  - `videoUrl` (String, required)
  - `thumbnailUrl` (String)
  - `caption` (String, max 2200 chars)
  - `audioTitle` (String, default: 'Original Audio')
  - `viewsCount` (Number, default: 0)
  - `likesCount` (Number, default: 0)
  - `commentsCount` (Number, default: 0)
- **Indexes:** `{ createdAt: -1 }`, `{ viewsCount: -1 }`

### 8. `Conversation`
- **Fields:**
  - `participants` (`[ObjectId -> User]`, required)
  - `isGroup` (Boolean, default: false)
  - `groupName` (String)
  - `groupAvatar` (String)
  - `lastMessage` (`ObjectId -> Message`)
  - `lastMessageAt` (Date)
- **Indexes:** `{ participants: 1 }`, `{ lastMessageAt: -1 }`

### 9. `Message`
- **Fields:**
  - `conversation` (`ObjectId -> Conversation`, required, indexed)
  - `sender` (`ObjectId -> User`, required)
  - `content` (String)
  - `mediaUrl` (String)
  - `readBy` (`[ObjectId -> User]`)
- **Indexes:** `{ conversation: 1, createdAt: 1 }`

### 10. `Notification`
- **Fields:**
  - `recipient` (`ObjectId -> User`, required, indexed)
  - `sender` (`ObjectId -> User`, required)
  - `type` (String, enum: `['follow', 'follow_request', 'like_post', 'like_comment', 'comment', 'mention', 'message']`)
  - `post` (`ObjectId -> Post`)
  - `isRead` (Boolean, default: false, indexed)
- **Indexes:** `{ recipient: 1, isRead: 1, createdAt: -1 }`

### 11. `Bookmark` & `Collection`
- **Bookmark Fields:** `user` (`ObjectId`), `post` (`ObjectId`)
  - **Index:** `{ user: 1, post: 1 }` (unique)
- **Collection Fields:** `user` (`ObjectId`), `name` (String), `posts` (`[ObjectId -> Post]`)

### 12. `Report` & `AuditLog`
- **Report Fields:** `reporter` (`ObjectId`), `targetType` (`post`/`user`/`reel`/`comment`), `targetId` (`ObjectId`), `reason` (String), `status` (`pending`/`resolved`/`dismissed`)
- **AuditLog Fields:** `admin` (`ObjectId`), `action` (String), `targetUser` (`ObjectId`), `details` (Object), `ip` (String)
