# Security & Threat Model

This document outlines the security architecture and defensive controls implemented across Insta.

## 1. Authentication & Session Security
- **Credential Storage:** All user passwords are encrypted using `bcryptjs` with an adaptive salt work factor of **12**, preventing rainbow table attacks. Plaintext passwords are never persisted or logged.
- **Session Tokens:** Authentication sessions are verified through cryptographic JSON Web Tokens (`jsonwebtoken`) signed with a dedicated server-side secret.
- **Cookie Security:** Auth tokens are delivered strictly via **`httpOnly`** cookies with `sameSite: 'lax'` (or `'strict'`) and the `secure` flag enabled in production. Tokens cannot be read by JavaScript `document.cookie`, mitigating Cross-Site Scripting (XSS) credential theft.
- **Credential Sanitization:** User schemas explicitly specify `passwordHash: { select: false }`, ensuring hashes are not included in queries or serialized to responses.

## 2. API & Network Protection
- **Cross-Origin Resource Sharing (CORS):** The backend maintains an explicit allowlist matching `CLIENT_ORIGIN` (`http://localhost:5173` in development) with `credentials: true`.
- **Security Headers (Helmet):** All HTTP responses pass through `helmet` to set defensive HTTP headers, including `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and Cross-Origin Resource Policies.
- **Rate Limiting:** Protects against credential brute-forcing, Denial of Service (DoS), and automated scraping using `express-rate-limit` configured on all `/api` routes.
- **Request Size Limiting:** JSON and URL-encoded request bodies are capped at 10MB to prevent heap exhaustion attacks.

## 3. Input Validation & Injection Prevention
- **Schema Validation:** Incoming payloads for authentication, posts, profile updates, and settings are validated with strict `zod` schemas. Extraneous or malformed properties are rejected before reaching database operations.
- **NoSQL Injection:** Mongoose strongly-typed schemas prevent raw MongoDB operator injection (`$gt`, `$where`, etc.).

## 4. Media & Upload Security
- **MIME Type Whitelisting:** Multer disk storage only accepts verified image formats (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) and video formats (`video/mp4`, `video/webm`).
- **Path Traversal Defenses:** Uploaded filenames are sanitized and assigned cryptographically random hex strings with verified file extensions.
- **Storage Safety:** Static uploads are served from a designated `/uploads` path without executable execution permissions.

## 5. Authorization & Role-Based Access Control (RBAC)
- **Zero-Trust Backend Guards:** The server independently authenticates each request and validates resource ownership.
- **Role Enforcement:** Administrative endpoints under `/api/admin` verify `req.user.role === 'admin'`. Public registration routes reject role parameters.
- **Privacy Enforcement:** Private accounts require approved follow relationships to inspect posts, stories, or reels.
- **User Blocking:** Blocked users cannot message, view profiles, or retrieve activity of the blocker.
