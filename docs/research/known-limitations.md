# Known Limitations & Environmental Considerations

## 1. Database Persistence vs. In-Memory Mode
- **Current Development Configuration**: The backend server is configured with `mongodb-memory-server` fallback when an external `MONGODB_URI` environment variable is not supplied. This allows full automated test execution and local development without requiring a separate pre-configured database server.
- **Production Recommendation**: When deploying to production environments, configure a durable MongoDB replica set by setting `MONGODB_URI=mongodb://...` in `.env`.

## 2. Ephemeral Media Storage
- **Media Uploads**: Local image uploads are persisted to `backend/uploads/` via `multer`. In high-scale cloud production deployments, media files should be piped to an S3-compatible object store (e.g., AWS S3, Cloudflare R2) backed by a CDN.
- **Ephemeral Story Expiration**: The backend includes scheduled TTL cleanup for stories older than 24 hours. In development, restarting the in-memory server resets the database state to the seed data.

## 3. Realtime WebSockets & Concurrency
- **Socket.IO Scalability**: The Socket.IO server currently runs in-process with Express. For multi-node load-balanced deployments, a Redis adapter (`@socket.io/redis-adapter`) should be enabled to broadcast socket events across worker processes.
- **Deduplication**: The frontend implements client-side message deduplication (`message._id` tracking) to prevent double-rendering when receiving simultaneous HTTP responses and Socket.IO events.

## 4. Third-Party Rate Limiting & Network Access
- Public Instagram web endpoints enforce automated bot detection and rate limits. Reference screenshots were captured cleanly via controlled delays and official public feature guides, without bypassing any CAPTCHAs, paywalls, or authenticated walls.
