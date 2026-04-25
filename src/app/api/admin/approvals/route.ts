import { NextResponse } from "next/server";
import { ApprovalRequest } from "@/models/ApprovalRequest";

export async function GET() {
  try {
    const approvals = await ApprovalRequest.find().sort({ createdAt: -1 });
    return NextResponse.json({ approvals });
  } catch {
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}
