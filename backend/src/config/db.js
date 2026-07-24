import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // Development friendly fallback: if no MONGODB_URI provided, skip hard failure
    // and rely on the environment or an external in-memory server if configured.
    if (!uri) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('No MONGODB_URI provided — running without database connection in non-production environment.');
        return;
      }
      throw new Error('MONGODB_URI is required');
    }

    await mongoose.connect(uri, {
      // mongoose v7+ ignores these but keep for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
