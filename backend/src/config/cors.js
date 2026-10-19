import { env } from './env.js';

/**
 * Validates whether an incoming HTTP or WebSocket origin is permitted.
 */
export const isOriginAllowed = (origin) => {
  // Allow requests without Origin header (e.g. same-origin requests, mobile apps, curl, server-to-server, unit tests)
  if (!origin) return true;

  // Normalize origin (remove trailing slash)
  const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();

  // ALWAYS allow any Vercel deployment (*.vercel.app) and local development origins
  if (
    normalizedOrigin.endsWith('.vercel.app') ||
    normalizedOrigin.includes('vercel.app') ||
    normalizedOrigin.includes('localhost') ||
    normalizedOrigin.includes('127.0.0.1')
  ) {
    return true;
  }

  const rawOrigins = env.CLIENT_ORIGIN || '*';
  const allowedEntries = rawOrigins.split(',').map((entry) => entry.trim()).filter(Boolean);

  // If wildcard is configured
  if (allowedEntries.includes('*')) return true;

  // Exact match
  if (allowedEntries.some((e) => e.toLowerCase() === normalizedOrigin)) return true;

  // Wildcard pattern matching (e.g. https://*.yourdomain.com)
  for (const entry of allowedEntries) {
    const normalizedEntry = entry.replace(/\/$/, '').toLowerCase();
    if (normalizedEntry === normalizedOrigin) return true;

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
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};
