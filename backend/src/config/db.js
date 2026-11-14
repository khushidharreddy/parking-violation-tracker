import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parking_violation_tracker';
  const forceMemory = process.env.USE_IN_MEMORY_DB === 'true';

  if (!forceMemory) {
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`[Database] Connected successfully to external MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[Database] External MongoDB connection failed (${err.message}). Falling back to MongoMemoryServer...`);
    }
  }

  try {
    console.log('[Database] Initializing isolated embedded MongoMemoryServer instance...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Connected successfully to in-memory MongoDB at: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error('[Database] Failed to initialize MongoMemoryServer:', memErr);
    throw memErr;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[Database] Disconnected cleanly from database.');
  } catch (err) {
    console.error('[Database] Error disconnecting database:', err);
  }
};
