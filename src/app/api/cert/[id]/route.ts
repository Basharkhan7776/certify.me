import { NextRequest, NextResponse } from "next/server";
import { getCertificate, resolveDetails } from "@/lib/contract";
import { bytes32ToString } from "@/lib/utils-admin";
import { Certificate } from "@/models/Certificate";

const PINATA_GATEWAY = process.env.PINATA_GATEWAY_URL || "gateway.pinata.cloud";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tokenId = Number(id);

    const cert = await getCertificate(tokenId);
    const details = await resolveDetails(tokenId);

    const readableOrgCode = bytes32ToString(cert[2] as `0x${string}`);

    let metadata = null;
    let imageUrl = "";
    try {
      const uri = cert[0] as string;
      if (uri && uri.startsWith("ipfs://")) {
        const cid = uri.replace("ipfs://", "");
        const res = await fetch(`https://${PINATA_GATEWAY}/ipfs/${cid}`);
        if (res.ok) {
          metadata = await res.json();
          if (metadata.image && metadata.image.startsWith("ipfs://")) {
            const imgCid = metadata.image.replace("ipfs://", "");
            imageUrl = `https://${PINATA_GATEWAY}/ipfs/${imgCid}`;
          }
        }
      }
    } catch {
      // metadata fetch failed, continue with on-chain data only
    }

    const dbCert = await Certificate.findOne({ tokenId });

    return NextResponse.json({
      tokenId,
      name: metadata?.name || `Certificate #${tokenId}`,
      description: metadata?.description || "",
      imageUrl,
      issueDate: metadata?.issueDate || "",
      expiryDate: metadata?.expiryDate || "",
      attributes: metadata?.attributes || [],
      orgCode: readableOrgCode,
      studentAddr: cert[1],
      orgAddr: details[0],
      revoked: cert[3],
      txHash: dbCert?.txHash || "",
      uri: cert[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
