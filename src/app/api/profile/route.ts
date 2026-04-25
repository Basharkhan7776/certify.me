import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { User } from "@/models/User";
import { Org } from "@/models/Org";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const org = await Org.findOne({
      $or: [{ contactEmail: user.email }, { walletAddr: user.walletAddr }],
      approved: true,
    });

    return NextResponse.json({
      user: {
        name: user.name || "",
        email: user.email || "",
        walletAddr: user.walletAddr || "",
        oauthProvider: user.oauthProvider || null,
        blocked: user.blocked,
      },
      org: org
        ? {
            name: org.name,
            orgCode: org.orgCode,
            walletAddr: org.walletAddr,
            website: org.website || "",
            contactEmail: org.contactEmail || "",
            description: org.description || "",
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.name !== undefined) user.name = body.name;
    if (body.website !== undefined || body.contactEmail !== undefined || body.description !== undefined) {
      const org = await Org.findOne({
        $or: [{ contactEmail: user.email }, { walletAddr: user.walletAddr }],
        approved: true,
      });
      if (org) {
        if (body.website !== undefined) org.website = body.website;
        if (body.contactEmail !== undefined) org.contactEmail = body.contactEmail;
        if (body.description !== undefined) org.description = body.description;
        await org.save();
      }
    }

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
