import Link from "next/link";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center gap-2 font-semibold">
          Certify.me
        </Link>
        <nav className="flex flex-1 items-center gap-6 text-sm font-medium">
          <Link
            href="/app"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Dashboard
          </Link>
          <Link
            href="/verify"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Verify
          </Link>
          <Link
            href="/org-onboarding"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Org Onboarding
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/auth"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
