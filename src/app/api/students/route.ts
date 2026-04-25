import { NextRequest, NextResponse } from "next/server";
import { getCertsByStudent, getCertsByOrg } from "@/lib/contract";
import { stringToBytes32 } from "@/lib/utils-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const orgCode = searchParams.get("orgCode");

  try {
    if (address) {
      const tokenIds = await getCertsByStudent(address as `0x${string}`);
      return NextResponse.json({
        address,
        count: tokenIds.length,
        tokenIds: tokenIds.map((id: bigint) => id.toString()),
      });
    }

    if (orgCode) {
      const bytes32Code = stringToBytes32(orgCode);
      const tokenIds = await getCertsByOrg(bytes32Code);
      return NextResponse.json({
        orgCode,
        count: tokenIds.length,
        tokenIds: tokenIds.map((id: bigint) => id.toString()),
      });
    }

    return NextResponse.json({ error: "address or orgCode is required" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
