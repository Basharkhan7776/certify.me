import { NextRequest, NextResponse } from "next/server";
import { getCertsByStudent } from "@/lib/contract";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  try {
    const tokenIds = await getCertsByStudent(address as `0x${string}`);
    return NextResponse.json({
      address,
      count: tokenIds.length,
      tokenIds: tokenIds.map((id: bigint) => id.toString()),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
