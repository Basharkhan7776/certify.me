"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OrgOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddr, setWalletAddr] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  function isValidEmail(e: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function isValidWallet(w: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(w);
  }

  function isValidUrl(u: string): boolean {
    if (!u) return true;
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!orgName.trim()) {
      toast.error("Organization name is required");
      return;
    }

    if (!email.trim() || !isValidEmail(email)) {
      toast.error("Valid email is required");
      return;
    }

    if (!walletAddr.trim() || !isValidWallet(walletAddr)) {
      toast.error("Valid wallet address is required (0x + 40 hex chars)");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (website && !isValidUrl(website)) {
      toast.error("Invalid website URL");
      return;
    }

    if (!termsAccepted) {
      toast.error("You must accept the terms to submit");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/org-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: orgName.trim(),
          email: email.trim().toLowerCase(),
          walletAddr: walletAddr.trim(),
          description: description.trim(),
          website: website.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to submit application");
        setLoading(false);
        return;
      }

      toast.success("Application submitted successfully!");
      router.push("/");
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Certify.me
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 container py-12">
        <div className="mx-auto max-w-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Register Your Organization</h1>
            <p className="mt-2 text-muted-foreground">
              Apply to become a verified certificate issuer. Your application
              will be reviewed by our admin team.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="Tech University"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet">Organization Wallet Address</Label>
                  <Input
                    id="wallet"
                    placeholder="0x..."
                    value={walletAddr}
                    onChange={(e) => setWalletAddr(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    This wallet will be used to mint certificates on-chain.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your organization and why you want to issue certificates..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://university.edu"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Separator />

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(v) => setTermsAccepted(!!v)}
                    disabled={loading}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal leading-snug"
                  >
                    I confirm that this organization is legitimate and
                    authorized to issue credentials. False applications will
                    result in permanent bans.
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Applications are typically reviewed within 2-3 business days.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
