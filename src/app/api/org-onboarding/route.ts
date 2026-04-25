import { NextRequest, NextResponse } from "next/server";
import { ApprovalRequest } from "@/models/ApprovalRequest";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidWallet(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orgName, email, walletAddr, description, website } = await req.json();

    if (!orgName || !email || !walletAddr || !description) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!isValidWallet(walletAddr)) {
      return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 });
    }

    if (website && !isValidUrl(website)) {
      return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
    }

    const duplicate = await ApprovalRequest.findOne({
      $or: [{ email: email.toLowerCase() }, { walletAddr }],
    });

    if (duplicate) {
      return NextResponse.json({ error: "An application with this email or wallet already exists" }, { status: 409 });
    }

    await ApprovalRequest.create({
      orgName,
      email: email.toLowerCase(),
      walletAddr,
      description,
      website,
      status: "pending",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
