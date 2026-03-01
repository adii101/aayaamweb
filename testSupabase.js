import 'dotenv/config';
import { MongoClient } from 'mongodb';

(async () => {
  const mongoUri = process.env.MONGODB_URI;
  console.log('MongoDB URI:', mongoUri?.slice(0, 50) + '...');
  
  if (!mongoUri) {
    console.error('MONGODB_URI not set in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db();
    
    // Get list of collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Try to read from events collection
    const eventsCollection = db.collection('events');
    const event = await eventsCollection.findOne({});
    console.log('Sample event:', event);
    
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.close();
  }
})();

