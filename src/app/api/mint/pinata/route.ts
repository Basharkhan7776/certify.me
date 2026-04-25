import { NextRequest, NextResponse } from "next/server";

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API = "https://api.pinata.cloud";
const PINATA_GATEWAY = process.env.PINATA_GATEWAY_URL || "gateway.pinata.cloud";

export async function POST(req: NextRequest) {
  try {
    if (!PINATA_JWT) {
      return NextResponse.json({ error: "Pinata not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const metadata = JSON.parse(formData.get("metadata") as string);

    if (!imageFile || !metadata) {
      return NextResponse.json({ error: "Image and metadata are required" }, { status: 400 });
    }

    const imageBytes = await imageFile.arrayBuffer();
    const imageFormData = new FormData();
    imageFormData.append("file", new Blob([imageBytes], { type: imageFile.type }), imageFile.name);

    const imageRes = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: imageFormData,
    });

    if (!imageRes.ok) {
      const errText = await imageRes.text();
      return NextResponse.json({ error: `Image upload failed: ${errText}` }, { status: 500 });
    }

    const imageData = await imageRes.json();
    const imageCid = imageData.IpfsHash;

    const metadataJson = {
      ...metadata,
      image: `ipfs://${imageCid}`,
    };

    const metadataFormData = new FormData();
    metadataFormData.append("file", new Blob([JSON.stringify(metadataJson)], { type: "application/json" }), "metadata.json");

    const metadataRes = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: metadataFormData,
    });

    if (!metadataRes.ok) {
      const errText = await metadataRes.text();
      return NextResponse.json({ error: `Metadata upload failed: ${errText}` }, { status: 500 });
    }

    const metadataData = await metadataRes.json();
    const metadataCid = metadataData.IpfsHash;

    return NextResponse.json({
      imageCid,
      metadataCid,
      metadataUri: `ipfs://${metadataCid}`,
      imageUrl: `https://${PINATA_GATEWAY}/ipfs/${imageCid}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Pinata upload failed" }, { status: 500 });
  }
}
