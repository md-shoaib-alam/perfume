import mongoose from 'mongoose';
import { seedDatabase } from './seed';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neesh_perfumes';

  try {
    console.log(`Connecting to MongoDB at ${mongoURI}...`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log('MongoDB Connected Successfully!');
    await seedDatabase();
  } catch (error) {
    console.warn('MongoDB connection failed or server not running locally. Running with in-memory persistence fallback.');
  }
};
