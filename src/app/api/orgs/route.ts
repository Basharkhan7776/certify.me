import { NextRequest, NextResponse } from "next/server";
import { getCertsByOrg, getOrg } from "@/lib/contract";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgCode = searchParams.get("orgCode");

  if (!orgCode) {
    return NextResponse.json({ error: "orgCode is required" }, { status: 400 });
  }

  try {
    const org = await getOrg(orgCode as `0x${string}`);
    const tokenIds = await getCertsByOrg(orgCode as `0x${string}`);

    return NextResponse.json({
      orgCode,
      addr: org[1],
      blocked: org[2],
      count: tokenIds.length,
      tokenIds: tokenIds.map((id: bigint) => id.toString()),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
