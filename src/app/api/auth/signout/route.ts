import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authConfig);

  const response = NextResponse.json({ success: true });

  response.cookies.set("next-auth.session-token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("__Secure-next-auth.session-token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("next-auth.csrf-token", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("next-auth.callback-url", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("admin-token", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
