import { NextRequest, NextResponse } from "next/server";
import { verifyCertificate, resolveDetails, tokenToURI } from "@/lib/contract";
import { bytes32ToString } from "@/lib/utils-admin";
import { Org } from "@/models/Org";
import { connectDB } from "@/lib/db";

const PINATA_GATEWAY = process.env.PINATA_GATEWAY_URL || "gateway.pinata.cloud";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get("tokenId");

  if (!tokenId) {
    return NextResponse.json({ error: "tokenId is required" }, { status: 400 });
  }

  try {
    const verifyResult = await verifyCertificate(Number(tokenId));
    const details = await resolveDetails(Number(tokenId));
    const uri = await tokenToURI(Number(tokenId));

    const rawOrgCode = verifyResult[2] as `0x${string}`;
    const readableOrgCode = bytes32ToString(rawOrgCode);

    let metadata = null;
    let imageUrl = "";
    let issueDate = "";
    let expiryDate = "";

    try {
      const tokenUri = uri as string;
      if (tokenUri && tokenUri.startsWith("ipfs://")) {
        const cid = tokenUri.replace("ipfs://", "");
        const res = await fetch(`https://${PINATA_GATEWAY}/ipfs/${cid}`);
        if (res.ok) {
          metadata = await res.json();
          issueDate = metadata.issueDate || "";
          expiryDate = metadata.expiryDate || "";
          if (metadata.image && metadata.image.startsWith("ipfs://")) {
            const imgCid = metadata.image.replace("ipfs://", "");
            imageUrl = `https://${PINATA_GATEWAY}/ipfs/${imgCid}`;
          }
        }
      }
    } catch {
      // metadata fetch failed, continue with on-chain data
    }

    let orgName = readableOrgCode;
    try {
      await connectDB();
      const org = await Org.findOne({ orgCode: rawOrgCode });
      if (org) {
        orgName = org.name;
      }
    } catch {
      // fallback to raw orgCode
    }

    const now = new Date();
    let isExpired = false;
    if (expiryDate) {
      isExpired = new Date(expiryDate) < now;
    }

    return NextResponse.json({
      tokenId: Number(tokenId),
      name: metadata?.name || `Certificate #${tokenId}`,
      description: metadata?.description || "",
      imageUrl,
      issueDate,
      expiryDate,
      isExpired,
      attributes: metadata?.attributes || [],
      studentAddr: verifyResult[1],
      orgAddr: details[0],
      orgCode: readableOrgCode,
      orgName,
      revoked: verifyResult[3],
      uri: uri as string,
    });
  } catch (error: any) {
    if (error.message?.includes("execution reverted") || error.message?.includes("does not exist")) {
      return NextResponse.json({ error: "Certificate not found on-chain", notFound: true }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
