"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      toast.success("Welcome back, Admin!");
      const callbackUrl = searchParams.get("callbackUrl") || "/admin/app";
      router.push(callbackUrl);
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@certify.me"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Certify.me
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-sm px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>
                Enter your credentials to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense>
                <LoginForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
