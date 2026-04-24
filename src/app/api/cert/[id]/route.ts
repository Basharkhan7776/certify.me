import { NextRequest, NextResponse } from "next/server";
import { getCertificate, resolveDetails } from "@/lib/contract";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tokenId = Number(id);
    const cert = await getCertificate(tokenId);
    const details = await resolveDetails(tokenId);

    return NextResponse.json({
      tokenId,
      uri: cert[0],
      studentAddr: cert[1],
      orgCode: cert[2],
      revoked: cert[3],
      orgAddr: details[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
