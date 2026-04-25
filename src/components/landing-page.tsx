"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Shield,
  CheckCircle,
  Users,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import Grainient from "@/components/Grainient";
import PixelSnow from "./PixelSnow";

export default function LandingPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <div className="fixed inset-0 z-[-1]">
        {mounted && (
          <Grainient
            color1={resolvedTheme === "dark" ? "#000000" : "#ffffff"}
            color3={resolvedTheme === "dark" ? "#000000" : "#ffffff"}
            color2="#cd7474"
            grainAmount={0}
          />
        )}
      </div>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            Certify.me
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/verify"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Verify
            </Link>
            <Link
              href="/org-onboarding"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              For Orgs
            </Link>
            <ThemeToggle />
            <Link href="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section
          id="hero"
          className="container py-24 md:py-32 min-h-screen flex items-center"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Tamper-Proof Certificates on Blockchain
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Issue, verify, and manage soulbound NFT certificates. Zero
              friction verification for employers — no login required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button size="lg" variant="outline">
                  Verify a Certificate
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-16 border-t">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Ready to get started?</h2>
            <p className="mt-2 text-muted-foreground">
              Join as a student to receive certificates, or apply as an
              organization to issue them.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth">
                <Button>Sign In as Student</Button>
              </Link>
              <Link href="/org-onboarding">
                <Button variant="outline">Register Organization</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">Openlabs</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/verify" className="hover:text-foreground">
              Verify
            </Link>
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
            <Link
              href="https://drive.google.com/file/d/1NoSMfrAnB5hyyb_B8JWvtyGHDEMj0SRL/view?usp=drivesdk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              White Paper
            </Link>
            <Link
              href={`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Contract
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
