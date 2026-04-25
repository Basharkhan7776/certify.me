import mongoose, { Schema, Model } from "mongoose";

export interface IOrg {
  name: string;
  orgCode: string;
  walletAddr: string;
  approved: boolean;
  blocked: boolean;
  description?: string;
  website?: string;
  contactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrgSchema = new Schema<IOrg>(
  {
    name: { type: String, required: true, trim: true },
    orgCode: { type: String, required: true, unique: true, trim: true },
    walletAddr: { type: String, required: true, unique: true, trim: true },
    approved: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    description: { type: String },
    website: { type: String },
    contactEmail: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true }
);

OrgSchema.index({ orgCode: 1 }, { unique: true });

export const Org: Model<IOrg> =
  mongoose.models.Org || mongoose.model<IOrg>("Org", OrgSchema);
