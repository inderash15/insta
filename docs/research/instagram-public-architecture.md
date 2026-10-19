# Instagram Public Architecture & Systems Engineering Research

## 1. Overview
This analysis compiles public engineering disclosures, Meta Engineering whitepapers, and industry conference presentations regarding Instagram's underlying platform architecture. It translates these architectural principles into practical engineering patterns applicable to our full-stack social network.

---

## 2. Core Architectural Subsystems

### A. Feed Retrieval & Ranking Pipeline
- **Publicly Documented Approach:**
  - Scaled feed architectures use a multi-stage funnel:
    1. **Candidate Generation (Retrieval):** Sourcing potential post candidates from accounts in the user's social graph (following relationships) and topic embeddings.
    2. **First-Pass Filtering:** Hard constraints filtering out blocked users, private accounts, already-viewed items, and muted tags.
    3. **Scoring / Feature Extraction:** Ranking candidates by affinity signals (historical likes, comments, DM exchanges), post recency, media format preference (video vs. image), and engagement density.
    4. **Reranking & Diversity Blending:** Preventing consecutive posts from the same creator, inserting story highlights, and balancing media types.
- **Application Implementation Strategy:**
  - For `Insta`, our MongoDB feed queries index `author: { $in: followedIds }`, filter out `blockedUsers`, join likes/bookmarks via aggregation pipelines, and sort by composite engagement score + timestamp recency.

---

### B. Media Ingestion & Delivery Pipeline
- **Publicly Documented Approach:**
  - Upload handling employs resumable chunked multipart uploads.
  - Asynchronous background worker pools transcode video into multi-bitrate HLS/DASH streams and generate responsive image renditions (thumbnail, low-res preview, high-res 1080p).
  - Global edge CDN points of presence (PoPs) cache media segments with aggressive cache-control headers.
- **Application Implementation Strategy:**
  - Local development runs via Multer disk storage abstraction with cryptographic hex hashes and strict MIME validation (`image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/webm`).
  - Storage provider interface allows transparent swap to AWS S3, Cloudflare R2, or Google Cloud Storage in production.

---

### C. Ephemeral Content (Stories) Expiration Engine
- **Publicly Documented Approach:**
  - Ephemeral media requires predictable lifecycle management:
    - Application queries enforce `expiresAt > current_timestamp`.
    - Physical deletion runs asynchronously via background workers or database TTL indexes to prevent query degradation.
- **Application Implementation Strategy:**
  - Mongoose `Story` schema defines `expiresAt` with a MongoDB TTL index: `{ expiresAt: 1 }, { expireAfterSeconds: 0 }`.
  - Every application query explicitly includes `expiresAt: { $gt: new Date() }` so stories expire instantly even before asynchronous database purging runs.

---

### D. Direct Messaging & Real-Time Presence
- **Publicly Documented Approach:**
  - Messaging infrastructure combines persistent database storage with bidirectional WebSockets for low-latency dispatch.
  - Message state transitions: Sent -> Delivered -> Seen.
  - Ephemeral presence (online status, typing indicators) handled via in-memory pub/sub (Redis/Memcached) rather than hitting primary database disks on every keystroke.
- **Application Implementation Strategy:**
  - Socket.IO gateway with authenticated JWT handshake.
  - Server-managed rooms for active conversations (`conversation:{id}`) and user-specific notification channels (`user:{id}`).
  - Direct message persistence to MongoDB `Message` collection prior to WebSocket broadcast to guarantee durability.

---

### E. Database Sharding & Indexing Strategy
- **Publicly Documented Approach:**
  - PostgreSQL sharding by User ID and Cassandra for high-velocity write workloads (likes, counters, inbox messages).
  - High reliance on distributed caching (TAO for social graph, Memcached for objects).
- **Application Implementation Strategy:**
  - MongoDB compound indexes designed for high-frequency queries:
    - `Post`: `{ author: 1, createdAt: -1 }`, `{ tags: 1, createdAt: -1 }`
    - `Follow`: `{ follower: 1, following: 1 }` (unique compound)
    - `Message`: `{ conversation: 1, createdAt: 1 }`
    - `Notification`: `{ recipient: 1, isRead: 1, createdAt: -1 }`
    - `Story`: `{ author: 1, expiresAt: 1 }`
