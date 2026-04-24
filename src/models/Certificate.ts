import mongoose, { Schema, Model } from "mongoose";

export interface ICertificate {
  tokenId: number;
  orgCode: string;
  studentAddr: string;
  ipfsUri: string;
  name?: string;
  description?: string;
  issueDate?: Date;
  expiryDate?: Date;
  attributes: { trait_type: string; value: string }[];
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    tokenId: { type: Number, required: true, unique: true, index: true },
    orgCode: { type: String, required: true, index: true },
    studentAddr: { type: String, required: true, index: true },
    ipfsUri: { type: String, required: true },
    name: { type: String },
    description: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    attributes: [
      {
        trait_type: { type: String },
        value: { type: String },
      },
    ],
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Certificate: Model<ICertificate> =
  mongoose.models.Certificate || mongoose.model<ICertificate>("Certificate", CertificateSchema);
