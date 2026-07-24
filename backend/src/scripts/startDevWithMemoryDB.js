import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  console.log('Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  console.log('In-memory MongoDB running at', uri);

  // Start the main server which will read process.env.MONGODB_URI
  await import('../server.js');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
