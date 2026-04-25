import { NextRequest, NextResponse } from "next/server";
import { Org } from "@/models/Org";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgCode: string }> }
) {
  try {
    const { orgCode } = await params;
    const org = await Org.findOne({ orgCode, approved: true });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: org.name,
      orgCode: org.orgCode,
      walletAddr: org.walletAddr,
      description: org.description || "",
      website: org.website || "",
      contactEmail: org.contactEmail || "",
      createdAt: org.createdAt.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
