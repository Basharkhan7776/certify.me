import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddr: string }> }
) {
  try {
    const { walletAddr } = await params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddr)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    const user = await User.findOne({ walletAddr });

    if (!user) {
      return NextResponse.json({
        name: "Anonymous",
        email: "",
        walletAddr,
        blocked: false,
        createdAt: null,
      });
    }

    return NextResponse.json({
      name: user.name || "Anonymous",
      email: user.email || "",
      walletAddr: user.walletAddr,
      blocked: user.blocked,
      createdAt: user.createdAt?.toISOString() || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
