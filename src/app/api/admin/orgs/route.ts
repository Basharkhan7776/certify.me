import { NextRequest, NextResponse } from "next/server";
import { Org } from "@/models/Org";

export async function GET() {
  try {
    const orgs = await Org.find().sort({ createdAt: -1 });
    return NextResponse.json({ orgs });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orgs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, orgCode, walletAddr, description, website, contactEmail } = await req.json();

    if (!name || !orgCode || !walletAddr) {
      return NextResponse.json({ error: "name, orgCode, and walletAddr are required" }, { status: 400 });
    }

    const existing = await Org.findOne({ $or: [{ orgCode }, { walletAddr }] });
    if (existing) {
      return NextResponse.json({ error: "Org with this orgCode or wallet already exists" }, { status: 409 });
    }

    const org = await Org.create({
      name,
      orgCode,
      walletAddr,
      approved: true,
      blocked: false,
      description,
      website,
      contactEmail,
    });

    return NextResponse.json({ success: true, org });
  } catch {
    return NextResponse.json({ error: "Failed to create org" }, { status: 500 });
  }
}
