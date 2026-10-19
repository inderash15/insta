# Observed vs. Inferred Technical Ledger

## 1. Purpose
This document provides an auditable boundary separating:
1. **Directly Observed Evidence:** Captured via REA browser tools, screenshots, and live DOM trees.
2. **Documented Engineering Facts:** Verified through official Meta engineering publications and public disclosures.
3. **Architectural Inferences:** Engineering decisions adopted for the Insta application implementation.
4. **Unknown or Inaccessible Details:** Proprietary server logic and trade secrets that remain unobserved.

---

## 2. Comparison Ledger by Product Surface

| Subsystem | Directly Observed (REA Evidence) | Documented Public Fact | Application Implementation Inference | Inaccessible / Proprietary |
|---|---|---|---|---|
| **Landing & Auth** | `email`, `pass`, `submit` inputs, WebAuthn attributes, `/accounts/password/reset/`, `/accounts/emailsignup/`. | Uses rate limiting, IP reputation scoring, and SMS/TOTP two-factor challenges. | Express + bcrypt (12 rounds) + JWT stored in `httpOnly` secure cookies. Rate-limiting middleware (10 req/15 min). | Internal bot detection algorithms, ML risk scoring matrices. |
| **Home Feed** | Post cards, like/comment/share/save icons, story tray, desktop sidebar and right context panel. | Uses candidate generation, neural ranking, and diversity reranking. | MongoDB aggregation queries with following filters, recency weighting, and engagement scoring. | Exact internal deep-learning ranking weights and features. |
| **Profiles** | Header with avatar, bio, stats, story highlights, 3 tabs (Posts, Reels, Tagged), suggested creators. | Social graph represented in distributed graph databases (TAO/Memcached). | `Follow` Mongoose collection with compound index `{ follower, following }`, atomic counter synchronization. | Precise TAO graph cache invalidation protocols. |
| **Stories** | Segmented progress bar, unviewed gradient ring, author viewers list, auto-advance. | Ephemeral storage lifecycle with 24h expiration timestamp. | MongoDB TTL index on `Story.expiresAt` + explicit application query filter `expiresAt: { $gt: now }`. | CDN video segment distribution edge cache routing. |
| **Reels** | Vertical 9:16 layout, overlay action buttons, continuous looping, audio titles. | Dynamic video streaming with multi-bitrate HLS/DASH transcoding. | HTML5 video player with snap scrolling, local MP4 file storage, playback telemetry logging. | Internal video compression neural codecs. |
| **Direct Messaging** | Split-pane inbox, message requests tab, real-time message bubble stream, media attachment preview. | Hybrid architecture: WebSocket connection for low-latency delivery, persistent database storage. | Socket.IO gateway with authenticated JWT handshake, MongoDB `Conversation` and `Message` models. | End-to-end encryption key distribution infrastructure (Signal protocol server). |
| **Administration** | Not publicly observable in public sessions. | Internal content moderation queues, user strike records, audit trails. | Role-based access control (`role === 'admin'`), moderation ticket queue (`Report` model), `AuditLog` collection. | Meta internal employee moderation workflows and tooling. |
