import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process on failure so the server never runs without a database.
 */
const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

export default connectDB;
