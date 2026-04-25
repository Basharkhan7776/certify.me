import "dotenv/config";
import mongoose from "mongoose";

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/certify";
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const certCollection = collections.find(c => c.name === "certificates");

  if (!certCollection) {
    console.log("No certificates collection found");
    process.exit(0);
  }

  const indexes = await db.collection("certificates").indexes();
  console.log("Current indexes:", indexes.map(i => i.name));

  const tokenIdIndex = indexes.find(i => i.key.tokenId && i.unique);
  if (tokenIdIndex) {
    await db.collection("certificates").dropIndex(tokenIdIndex.name);
    console.log(`Dropped index: ${tokenIdIndex.name}`);
  } else {
    console.log("No unique tokenId index found");
  }

  const remaining = await db.collection("certificates").indexes();
  console.log("Remaining indexes:", remaining.map(i => i.name));

  await mongoose.disconnect();
  console.log("Done");
}

main().catch(console.error);
