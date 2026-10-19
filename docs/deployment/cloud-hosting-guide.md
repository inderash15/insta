# Instagram Clone — Cloud Deployment & Hosting Guide

This guide walks you step-by-step through deploying your Instagram web application to the cloud with **zero hosting cost** using:
1. **Database:** MongoDB Atlas (Free M0 Cluster)
2. **Backend API & WebSockets:** Render or Railway
3. **Frontend Application:** Vercel

---

## Architecture Overview

```
                                      +------------------------------------+
                                      |          MongoDB Atlas             |
                                      |      (Managed MongoDB M0)          |
                                      +------------------------------------+
                                                        ^
                                                        | MONGODB_URI (TLS)
                                                        v
+-------------------------------+             +------------------------------------+
|            User               | <=========> |           Render.com               |
|      (Desktop / Mobile)       |  REST API   |         (Node/Express)             |
+-------------------------------+  WebSocket  |       Socket.IO Realtime           |
               |                              +------------------------------------+
               |                                                ^
               | HTTPS                                          | CORS / Cookies
               v                                                v
+-------------------------------+             +------------------------------------+
|            Vercel             |             |            render.yaml             |
|        (Vite + React)         |             |       (Auto Infrastructure)        |
+-------------------------------+             +------------------------------------+
```

---

## Phase 1: Set Up MongoDB Atlas (Database)

1. **Create an account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up (free).
2. **Create a Free Cluster:**
   - Click **Create Deployment** -> Select **M0 Free (Shared)**.
   - Choose your nearest cloud provider and region (e.g. AWS / us-east-1).
   - Cluster Name: `insta-cluster` -> Click **Create**.
3. **Create Database User Credentials:**
   - Go to **Security** -> **Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Set Username (e.g., `insta_admin`) and generate a strong password. Save this password!
   - Database User Privileges: **Read and write to any database**.
   - Click **Add User**.
4. **Configure Network Access (Whitelisting):**
   - Go to **Security** -> **Network Access**.
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) so Render cloud instances can connect.
   - Click **Confirm**.
5. **Get Connection String:**
   - Go to **Database Deployments** -> Click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the connection string format:
     ```
     mongodb+srv://insta_admin:<password>@insta-cluster.xxxx.mongodb.net/insta?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and ensure the database name is `insta`.

---

## Phase 2: Deploy Backend to Render

### Option A: Automatic Blueprint Deployment (Recommended)
This repository includes a [`render.yaml`](file:///C:/Users/minde/OneDrive/Desktop/insta/render.yaml) blueprint:
1. Push your repository to GitHub.
2. Go to [render.com](https://render.com) and log in with your GitHub account.
3. Click **New +** -> **Blueprint**.
4. Connect your Instagram repository.
5. Render will detect `render.yaml` and prompt you for the required environment variables:
   - `MONGODB_URI`: Paste your MongoDB Atlas URI.
   - `CLIENT_ORIGIN`: Your Vercel frontend URL (e.g. `https://my-insta.vercel.app` — you can set this or update it after Phase 3).
6. Click **Apply**. Render will build and deploy your backend automatically.

### Option B: Manual Web Service Setup
1. On [render.com](https://render.com), click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name:** `insta-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Add **Environment Variables**:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production security & optimizations |
   | `PORT` | `5000` | Port for Express & Socket.IO |
   | `MONGODB_URI` | `mongodb+srv://...` | Your Atlas connection string |
   | `USE_IN_MEMORY_DB` | `false` | Ensures persistent Atlas database |
   | `CLIENT_ORIGIN` | `https://your-app.vercel.app,http://localhost:5173` | Your frontend domain(s) |
   | `COOKIE_SAMESITE` | `none` | Required for cross-site cookies between Vercel & Render |
   | `COOKIE_SECURE` | `true` | Required by browsers when `sameSite=none` |
   | `JWT_SECRET` | *(64 random characters)* | Secure signing key for user JWTs |
   | `COOKIE_SECRET` | *(64 random characters)* | Secure signing key for session cookies |
   | `ADMIN_REGISTRATION_KEY` | *(Secret admin key)* | Key used to claim administrative privileges |
5. Click **Create Web Service**.
6. Once deployed, note down your backend URL (e.g. `https://insta-backend-xxxx.onrender.com`).
7. Test the health endpoint in your browser:
   `https://insta-backend-xxxx.onrender.com/api/health`
   Should return: `{"success":true,"status":"ok",...}`.

---

## Phase 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New…** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Configure **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://insta-backend-xxxx.onrender.com/api` | Your Render backend API endpoint |
   | `VITE_SOCKET_URL` | `https://insta-backend-xxxx.onrender.com` | (Optional) Your Render backend origin for Socket.IO |
6. Click **Deploy**.
7. Vercel will build your React application in ~30 seconds and provide a production domain:
   `https://insta-xxxx.vercel.app`

---

## Phase 4: Final Linkage & Verification

1. **Update Backend CORS Origin:**
   - Return to your Render dashboard -> `insta-backend` -> **Environment**.
   - Set `CLIENT_ORIGIN` to your actual Vercel URL:
     `https://insta-xxxx.vercel.app`
   - Save changes (Render will trigger a quick reload).
2. **Open Your App in Browser:**
   - Visit `https://insta-xxxx.vercel.app`.
   - Create an account or log in with test credentials.
   - Test key real-time actions:
     - Like a post (heart turns red instantly without reload).
     - Send a direct message (sent & seen indicators update).
     - Upload a photo or story.
     - Open two browser tabs to confirm Socket.IO presence indicators.

---

## Production Resilience Checklist

- [x] **SPA Routing:** Configured in `frontend/vercel.json` to eliminate 404s on direct navigation or page refresh.
- [x] **Cross-Domain Cookies:** Configured with `sameSite: 'none'` and `secure: true` for seamless session management across Vercel and Render.
- [x] **Dynamic Media Resolution:** `api.js` automatically maps `/uploads/...` to the backend Render origin.
- [x] **Atlas Cloud Timeout:** `db.js` uses a 15,000ms connection timeout to handle cold-start DNS SRV handshakes gracefully.
- [x] **Credential Masking:** Database URIs are automatically redacted in server logs to prevent credential leakage.
- [x] **Wildcard Vercel Origin Support:** Backend CORS safely handles `*.vercel.app` preview deployments.
