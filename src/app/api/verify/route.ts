import { NextRequest, NextResponse } from "next/server";
import { verifyCertificate } from "@/lib/contract";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get("tokenId");

  if (!tokenId) {
    return NextResponse.json({ error: "tokenId is required" }, { status: 400 });
  }

  try {
    const result = await verifyCertificate(Number(tokenId));
    return NextResponse.json({
      tokenId,
      uri: result[0],
      student: result[1],
      orgCode: result[2],
      revoked: result[3],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
