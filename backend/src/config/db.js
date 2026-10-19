import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env.js';

let mongodInstance = null;

export const connectDB = async () => {
  let uri = env.MONGODB_URI;

  if (env.USE_IN_MEMORY_DB === 'true' || env.NODE_ENV === 'test') {
    console.log('[DB] Explicit in-memory MongoDB requested.');
    mongodInstance = await MongoMemoryServer.create();
    uri = mongodInstance.getUri();
  } else {
    const isRemoteUri = uri.includes('mongodb+srv') || (!uri.includes('127.0.0.1') && !uri.includes('localhost'));
    const isProd = env.NODE_ENV === 'production';
    const timeoutMs = isRemoteUri || isProd ? 15000 : 3000;
    const sanitizedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');

    try {
      console.log(`[DB] Attempting connection to MongoDB at ${sanitizedUri} (timeout: ${timeoutMs}ms)...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
      console.log(`[DB] Connected successfully to MongoDB at ${sanitizedUri}`);
      return;
    } catch (err) {
      if (env.USE_IN_MEMORY_DB === 'auto' && !isProd) {
        console.warn(`[DB] MongoDB not reachable at ${sanitizedUri}.`);
        console.log('[DB] Launching embedded MongoDB (MongoMemoryServer) for local development...');
        mongodInstance = await MongoMemoryServer.create();
        uri = mongodInstance.getUri();
      } else {
        console.error('[DB] Failed to connect to MongoDB and in-memory fallback is disabled in production.', err.message);
        throw err;
      }
    }
  }

  await mongoose.connect(uri);
  console.log(`[DB] Connected successfully to in-memory MongoDB at ${uri}`);
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
    console.log('[DB] Disconnected from MongoDB.');
  } catch (err) {
    console.error('[DB] Error during MongoDB disconnect:', err.message);
  }
};
