const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function findData() {
  try {
    const client = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const db = client.connection.db;

    for (const dbName of ['chessData', 'chess_project']) {
      const targetDb = client.connection.useDb(dbName);
      const collections = await targetDb.db.listCollections().toArray();
      console.log(`\n=== Database: ${dbName} ===`);
      for (const col of collections) {
        const count = await targetDb.db.collection(col.name).countDocuments();
        console.log(`  Collection: ${col.name}, Documents: ${count}`);
        if (count > 0) {
          const sample = await targetDb.db.collection(col.name).findOne();
          console.log(`  Sample keys: ${Object.keys(sample).join(', ')}`);
        }
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

findData();
