import { NextRequest, NextResponse } from "next/server";
import { ApprovalRequest } from "@/models/ApprovalRequest";
import { Org } from "@/models/Org";
import { User } from "@/models/User";
import { addOrgOnChain, checkOrgExists } from "@/lib/contract-server";
import { stringToBytes32 } from "@/lib/utils-admin";
import { randomBytes } from "crypto";

function generateUniqueOrgCode(orgName: string): string {
  const prefix = orgName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  const randomPart = randomBytes(10).toString("base64url").slice(0, 12);
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `${prefix}-${randomPart}-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'approved' or 'rejected'" }, { status: 400 });
    }

    const request = await ApprovalRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "Approval request not found" }, { status: 404 });
    }

    if (request.status !== "pending") {
      return NextResponse.json({ error: "Request already reviewed" }, { status: 400 });
    }

    if (status === "rejected") {
      request.status = "rejected";
      request.reviewedAt = new Date();
      await request.save();
      return NextResponse.json({ success: true });
    }

    let orgCode: string;
    let bytes32Code: `0x${string}`;
    let attempts = 0;

    do {
      orgCode = generateUniqueOrgCode(request.orgName);
      bytes32Code = stringToBytes32(orgCode);
      attempts++;
      if (attempts > 10) {
        return NextResponse.json({ error: "Failed to generate unique org code" }, { status: 500 });
      }
    } while (await checkOrgExists(bytes32Code) || await Org.findOne({ orgCode }));

    const existingDb = await Org.findOne({ walletAddr: request.walletAddr });
    if (existingDb) {
      return NextResponse.json({ error: "Org already exists in database" }, { status: 409 });
    }

    const txHash = await addOrgOnChain(bytes32Code, request.walletAddr as `0x${string}`);

    request.status = "approved";
    request.reviewedAt = new Date();
    await request.save();

    await Org.create({
      name: request.orgName,
      orgCode,
      walletAddr: request.walletAddr,
      approved: true,
      blocked: false,
      description: request.description,
      website: request.website,
      contactEmail: request.email,
    });

    const existingUser = await User.findOne({ $or: [{ email: request.email }, { walletAddr: request.walletAddr }] });
    if (!existingUser) {
      await User.create({
        name: request.orgName,
        email: request.email,
        walletAddr: request.walletAddr,
        blocked: false,
      });
    }

    return NextResponse.json({ success: true, txHash, orgCode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to review request" }, { status: 500 });
  }
}
