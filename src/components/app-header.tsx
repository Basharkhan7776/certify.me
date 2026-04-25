"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/verify", label: "Verify" },
  { href: "/app", label: "Dashboard" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold mr-8">
          <span className="bg-foreground text-background rounded-md px-1.5 py-0.5 text-sm font-bold tracking-tight">
            C
          </span>
          Certify.me
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
