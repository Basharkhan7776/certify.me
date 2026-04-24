import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with Next.js and shadcn/ui. Powered by Polygon.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/verify" className="hover:text-foreground">
            Verify
          </Link>
          <Link href="/org-onboarding" className="hover:text-foreground">
            Org Onboarding
          </Link>
          <Link href="/admin" className="hover:text-foreground">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
