import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI1!;

if (!MONGODB_URI) {
  console.log('No mongodb uri specified');
  throw new Error('Please define the MONGODB_URI environment variable');
}

console.log(MONGODB_URI);

let cached = (global as any).mongoose;

if (!cached) {
  console.log('No cached mongo connection data');
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log('Mongo DB Cached data found');
    //console.log(cached);
    return cached.conn;
}

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  //console.log(cached);
  //console.log(cached.conn);
  console.log('Database connected successfully');
  return cached.conn;
}