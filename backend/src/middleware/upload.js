import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUploadDir = path.resolve(__dirname, '../../uploads');

// Ensure subdirectories exist
['avatars', 'posts', 'stories', 'reels'].forEach((dir) => {
  const fullPath = path.join(baseUploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure disk storage
const createStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(baseUploadDir, subfolder);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      cb(null, uniqueName);
    }
  });

// Allowed MIME types
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file format: ${file.mimetype}. Allowed formats: ${allowedTypes.join(', ')}`
      ),
      false
    );
  }
};

// Avatar upload (images only, max 10MB)
export const uploadAvatar = multer({
  storage: createStorage('avatars'),
  fileFilter: fileFilter(allowedImageTypes),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('avatar');

// Post media upload (images or videos, max 10 items, max 100MB per file)
export const uploadPostMedia = multer({
  storage: createStorage('posts'),
  fileFilter: fileFilter([...allowedImageTypes, ...allowedVideoTypes]),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
}).array('media', 10);

// Story media upload (single image or video, max 50MB)
export const uploadStoryMedia = multer({
  storage: createStorage('stories'),
  fileFilter: fileFilter([...allowedImageTypes, ...allowedVideoTypes]),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
}).single('media');

// Reel media upload (single video, max 100MB)
export const uploadReelMedia = multer({
  storage: createStorage('reels'),
  fileFilter: fileFilter(allowedVideoTypes),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
}).single('video');

// Direct message media upload (single image or video, max 50MB)
export const uploadMessageMedia = multer({
  storage: createStorage('posts'),
  fileFilter: fileFilter([...allowedImageTypes, ...allowedVideoTypes]),
  limits: { fileSize: 50 * 1024 * 1024 }
}).single('media');

