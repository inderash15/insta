import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  COOKIE_SAMESITE: z.enum(['lax', 'none', 'strict']).optional(),
  COOKIE_SECURE: z.preprocess(
    (val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined),
    z.boolean().optional()
  ),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/insta'),
  USE_IN_MEMORY_DB: z.string().default('auto'),
  JWT_SECRET: z.string().min(16).default('insta_jwt_development_secret_key_minimum_32_chars_12345'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('insta_cookie_signing_secret_987654321'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_IMAGE_SIZE_BYTES: z.coerce.number().default(15728640),
  MAX_VIDEO_SIZE_BYTES: z.coerce.number().default(104857600),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(500),
  ADMIN_REGISTRATION_KEY: z.string().default('insta_admin_master_setup_key_2026')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
