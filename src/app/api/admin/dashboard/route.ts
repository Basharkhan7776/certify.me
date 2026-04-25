import { NextResponse } from "next/server";
import { Org } from "@/models/Org";
import { User } from "@/models/User";
import { ApprovalRequest } from "@/models/ApprovalRequest";

export async function GET() {
  try {
    const [totalOrgs, totalUsers, pendingApprovals] = await Promise.all([
      Org.countDocuments(),
      User.countDocuments(),
      ApprovalRequest.countDocuments({ status: "pending" }),
    ]);

    return NextResponse.json({
      totalOrgs,
      totalUsers,
      pendingApprovals,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
