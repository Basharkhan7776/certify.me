import { NextResponse } from "next/server";
import { User } from "@/models/User";

export async function GET() {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
