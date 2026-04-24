import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/certifyme";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: bun run scripts/add-admin.ts <email> <password>");
    console.error("Example: bun run scripts/add-admin.ts admin@certify.me secret123");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  }, { timestamps: true });

  const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error(`Admin with email "${email}" already exists`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const admin = await Admin.create({
    email: email.toLowerCase(),
    passwordHash,
  });

  console.log(`Admin created successfully`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  ID: ${admin._id}`);
  console.log(`  Created: ${admin.createdAt}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
