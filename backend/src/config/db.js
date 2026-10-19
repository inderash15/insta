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
    try {
      console.log(`[DB] Attempting connection to MongoDB daemon at ${uri}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
      console.log(`[DB] Connected successfully to local MongoDB at ${uri}`);
      return;
    } catch (err) {
      if (env.USE_IN_MEMORY_DB === 'auto') {
        console.warn(`[DB] Local MongoDB not reachable at ${uri}.`);
        console.log('[DB] Launching embedded MongoDB (MongoMemoryServer) for local development...');
        mongodInstance = await MongoMemoryServer.create();
        uri = mongodInstance.getUri();
      } else {
        console.error('[DB] Failed to connect to MongoDB and in-memory fallback is disabled.', err.message);
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
