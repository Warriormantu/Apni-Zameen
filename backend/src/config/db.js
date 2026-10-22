import mongoose from 'mongoose';
import dns from 'dns';

// Ensure Windows Node DNS resolver resolves SRV records for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if custom DNS servers cannot be set
}

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB connected');
      return;
    }

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

    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (firstErr) {
      // If querySrv fails on Windows, fallback to direct replica set hosts
      if (uri.includes('cluster0.tbtixea.mongodb.net') && (firstErr.code === 'ECONNREFUSED' || firstErr.message?.includes('querySrv'))) {
        console.warn('SRV resolution failed, attempting direct replica set fallback...');
        const directUri = uri.replace(
          /mongodb\+srv:\/\/(.*?):(.*?)@cluster0\.tbtixea\.mongodb\.net\/(.*?)\?(.*)/,
          'mongodb://$1:$2@ac-1i5puh6-shard-00-00.tbtixea.mongodb.net:27017,ac-1i5puh6-shard-00-01.tbtixea.mongodb.net:27017,ac-1i5puh6-shard-00-02.tbtixea.mongodb.net:27017/$3?ssl=true&replicaSet=atlas-4a0yc0-shard-0&authSource=admin&$4'
        );
        await mongoose.connect(directUri);
      } else {
        throw firstErr;
      }
    }
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
