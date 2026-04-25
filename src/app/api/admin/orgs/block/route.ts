import { NextRequest, NextResponse } from "next/server";
import { Org } from "@/models/Org";
import { blockOrgOnChain } from "@/lib/contract-server";
import { stringToBytes32 } from "@/lib/utils-admin";

export async function POST(req: NextRequest) {
  try {
    const { orgCode } = await req.json();
    if (!orgCode) {
      return NextResponse.json({ error: "orgCode is required" }, { status: 400 });
    }

    const org = await Org.findOne({ orgCode });
    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }

    const bytes32Code = stringToBytes32(orgCode);
    await blockOrgOnChain(bytes32Code);

    org.blocked = true;
    await org.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to block org" }, { status: 500 });
  }
}
