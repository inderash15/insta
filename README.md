# Insta — Production-Grade Full-Stack Social Network

An authentic, fully featured social network inspired by Instagram, built with a modern React + Vite frontend and Node.js + Express + MongoDB backend with real-time Socket.IO communication.

## Architectural Overview

```
c:/Users/minde/OneDrive/Desktop/insta/
├── backend/                  # Node.js + Express API & Socket.IO server
│   ├── src/
│   │   ├── config/           # Database, environment validation, Socket.IO config
│   │   ├── controllers/      # Route logic for auth, posts, stories, reels, chat, etc.
│   │   ├── middleware/       # Auth guards, upload validation, security, error handler
│   │   ├── models/           # Mongoose schemas (User, Post, Comment, Follow, Story, etc.)
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Media processing, rankings, notification dispatch
│   │   ├── socket/           # Real-time message & notification handlers
│   │   ├── app.js            # Express app assembly & middleware pipeline
│   │   └── server.js         # HTTP + Socket.IO server listener
│   ├── tests/                # Vitest & Supertest API integration suites
│   ├── uploads/              # Local storage for avatars, posts, reels, and stories
│   └── package.json
├── frontend/                 # React 19 + Vite + Tailwind CSS v4 Single Page App
│   ├── src/
│   │   ├── assets/           # Icons and static resources
│   │   ├── components/       # UI components (Feed, Profile, Reels, Stories, Chat, Nav)
│   │   ├── context/          # AuthContext, SocketContext, ThemeContext
│   │   ├── hooks/            # Custom hooks (usePosts, useChat, useSocket, useInfiniteScroll)
│   │   ├── pages/            # Home, Profile, Reels, Explore, Direct, Settings, Admin
│   │   ├── services/         # Axios / Fetch client with automatic credentials
│   │   ├── App.jsx           # Routing & layout shell
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Tailwind CSS v4 design system
│   ├── vite.config.js
│   └── package.json
├── package.json              # Monorepo task orchestration (concurrent dev, test, build)
├── .env.example              # Environment configuration template
├── .gitignore
└── README.md
```

## Technology Stack

* **Frontend:** React + Vite, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide Icons, Socket.IO Client.
* **Backend:** Node.js, Express, Socket.IO, Mongoose, Multer, bcryptjs, jsonwebtoken, helmet, cors.
* **Database:** Dual-mode MongoDB (connects to `localhost:27017` or automatically embeds `mongodb-memory-server` for zero-setup local dev & automated testing).
* **Testing:** Vitest, Supertest.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development (Frontend + Backend)
```bash
npm run dev
```

* **Frontend:** http://localhost:5173
* **Backend API:** http://localhost:5000
* **Health Check:** http://localhost:5000/api/health
