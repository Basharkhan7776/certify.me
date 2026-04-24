import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  name?: string;
  email?: string;
  walletAddr?: string;
  oauthProvider?: "google" | "github" | null;
  oauthId?: string;
  blocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    walletAddr: { type: String, unique: true, sparse: true, trim: true },
    oauthProvider: { type: String, enum: ["google", "github", null], default: null },
    oauthId: { type: String },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
