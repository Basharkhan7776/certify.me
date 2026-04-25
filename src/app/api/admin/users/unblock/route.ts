import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "user id is required" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.blocked = false;
    await user.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to unblock user" }, { status: 500 });
  }
}
