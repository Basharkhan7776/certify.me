import { NextRequest, NextResponse } from "next/server";
import { Org } from "@/models/Org";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddr = searchParams.get("walletAddr");

    if (!walletAddr) {
      return NextResponse.json({ isOrg: false });
    }

    const org = await Org.findOne({ walletAddr, approved: true });
    if (!org) {
      return NextResponse.json({ isOrg: false });
    }

    return NextResponse.json({
      isOrg: true,
      orgCode: org.orgCode,
      orgName: org.name,
      orgWalletAddr: org.walletAddr,
    });
  } catch {
    return NextResponse.json({ isOrg: false });
  }
}
