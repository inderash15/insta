# Deployment & Production Architecture

This guide outlines setup requirements, environment variables, and production deployment patterns for Insta.

## Environment Configuration

### Backend Environment (`backend/.env`)
```ini
PORT=5000
NODE_ENV=production
CLIENT_ORIGIN=https://insta.yourdomain.com
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/insta?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_at_least_32_chars_long
JWT_EXPIRES_IN=7d
COOKIE_SECRET=super_secret_cookie_signing_key_32_chars
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

### Frontend Environment (`frontend/.env`)
```ini
VITE_API_URL=https://api.insta.yourdomain.com
```

## Production Build & Run

### 1. Build Frontend
```bash
npm run build --prefix frontend
```
The output will be placed in `frontend/dist/`. Serve with Nginx or Cloudflare Pages.

### 2. Start Backend
```bash
npm start --prefix backend
```

## Scaling Considerations
1. **Object Storage:** For multi-instance deployment, replace local filesystem uploads with AWS S3, Cloudflare R2, or Google Cloud Storage using an S3-compatible SDK.
2. **WebSocket Scaling:** Use `@socket.io/redis-adapter` for synchronizing Socket.IO events across multiple clustered backend instances.
3. **Database:** Use MongoDB Atlas replica set with connection pooling.
