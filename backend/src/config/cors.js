import { env } from './env.js';

/**
 * Validates whether an incoming HTTP or WebSocket origin is permitted.
 */
export const isOriginAllowed = (origin) => {
  // Allow requests without Origin header (e.g. same-origin requests, mobile apps, curl, server-to-server, unit tests)
  if (!origin) return true;

  const rawOrigins = env.CLIENT_ORIGIN || 'http://localhost:5173';
  const allowedEntries = rawOrigins.split(',').map((entry) => entry.trim()).filter(Boolean);

  // If wildcard is configured
  if (allowedEntries.includes('*')) return true;

  // Exact match
  if (allowedEntries.includes(origin)) return true;

  // Normalize origin (remove trailing slash)
  const normalizedOrigin = origin.replace(/\/$/, '');

  // Wildcard and domain pattern matching
  for (const entry of allowedEntries) {
    const normalizedEntry = entry.replace(/\/$/, '');
    if (normalizedEntry === normalizedOrigin) return true;

    // Vercel deployment preview pattern matching (*.vercel.app)
    if (normalizedEntry.includes('vercel.app')) {
      if (normalizedOrigin.endsWith('.vercel.app') || normalizedOrigin.includes('.vercel.app')) {
        return true;
      }
    }

    // Generic wildcard pattern support (e.g. https://*.mydomain.com)
    if (normalizedEntry.includes('*')) {
      const regexPattern = '^' + normalizedEntry.split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$';
      if (new RegExp(regexPattern).test(normalizedOrigin)) {
        return true;
      }
    }
  }

  return false;
};

export const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: Origin "${origin}" is not allowed by CLIENT_ORIGIN configuration.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};
