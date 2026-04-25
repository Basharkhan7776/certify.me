"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LogOut,
  LayoutDashboard,
  Users,
  Building2,
  CheckSquare,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

const navItems = [
  { href: "/admin/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approvals", icon: CheckSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orgs", label: "Orgs", icon: Building2 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    toast.success("Signed out");
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Certify.me
        </Link>
        <nav className="flex items-center gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm transition-colors hover:text-foreground ${
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </nav>
      </header>

      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
}
