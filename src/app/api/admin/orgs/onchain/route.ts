import { NextRequest, NextResponse } from "next/server";
import { Org } from "@/models/Org";
import { addOrgOnChain, checkOrgExists } from "@/lib/contract-server";
import { stringToBytes32 } from "@/lib/utils-admin";

export async function POST(req: NextRequest) {
  try {
    const { orgCode } = await req.json();
    if (!orgCode) {
      return NextResponse.json({ error: "orgCode is required" }, { status: 400 });
    }

    const org = await Org.findOne({ orgCode, approved: true });
    if (!org) {
      return NextResponse.json({ error: "Org not found or not approved in DB" }, { status: 404 });
    }

    const bytes32Code = stringToBytes32(orgCode);
    const exists = await checkOrgExists(bytes32Code);
    if (exists) {
      return NextResponse.json({ error: "Org already exists on-chain" }, { status: 409 });
    }

    const txHash = await addOrgOnChain(bytes32Code, org.walletAddr as `0x${string}`);

    return NextResponse.json({ success: true, txHash });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add org on-chain" }, { status: 500 });
  }
}
