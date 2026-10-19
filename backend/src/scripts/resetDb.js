import mongoose from 'mongoose';
import { env } from '../config/env.js';

const cleanDatabase = async () => {
  try {
    console.log(`[DB Clean] Connecting to database at ${env.MONGODB_URI}...`);
    await mongoose.connect(env.MONGODB_URI);
    console.log('[DB Clean] Connected. Purging all collections...');
    
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.drop();
      console.log(`[DB Clean] Dropped collection: ${collection.collectionName}`);
    }
    
    console.log('[DB Clean] Database is now 100% clean with zero static or mock data.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[DB Clean] Error:', err.message);
    process.exit(1);
  }
};

cleanDatabase();
