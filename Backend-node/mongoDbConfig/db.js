// mongoDbConfig/db.js
//connecting to mongoDB database using mongoose

import mongoose from 'mongoose';

export async function connectDB(uri, dbName = "eDocufy_database") {
  try {
    await mongoose.connect(uri, { dbName });
    console.log('✅ Connected to MongoDB with Mongoose');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}
