import mongoose, { Schema, Model } from "mongoose";

export interface IApprovalRequest {
  orgName: string;
  email: string;
  walletAddr: string;
  description?: string;
  website?: string;
  status: "pending" | "approved" | "rejected";
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalRequestSchema = new Schema<IApprovalRequest>(
  {
    orgName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    walletAddr: { type: String, required: true, trim: true },
    description: { type: String },
    website: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export const ApprovalRequest: Model<IApprovalRequest> =
  mongoose.models.ApprovalRequest ||
  mongoose.model<IApprovalRequest>("ApprovalRequest", ApprovalRequestSchema);
