import { NextRequest, NextResponse } from "next/server";
import { Certificate } from "@/models/Certificate";

export async function POST(req: NextRequest) {
  try {
    const {
      tokenId,
      orgCode,
      studentAddr,
      ipfsUri,
      name,
      description,
      issueDate,
      expiryDate,
      attributes,
      txHash,
    } = await req.json();

    if (tokenId == null || !orgCode || !studentAddr || !ipfsUri) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (txHash) {
      const existing = await Certificate.findOne({ txHash });
      if (existing) {
        return NextResponse.json({ success: true, alreadyExists: true });
      }
    }

    await Certificate.create({
      tokenId,
      orgCode,
      studentAddr,
      ipfsUri,
      name,
      description,
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      attributes: attributes || [],
      revoked: false,
      txHash,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ success: true, alreadyExists: true });
    }
    return NextResponse.json({ error: error.message || "Failed to save certificate" }, { status: 500 });
  }
}
