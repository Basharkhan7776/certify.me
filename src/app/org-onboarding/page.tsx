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

export default function OrgOnboardingPage() {
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" placeholder="Tech University" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@university.edu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet">Organization Wallet Address</Label>
                <Input id="wallet" placeholder="0x..." />
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://university.edu"
                />
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <Checkbox id="terms" className="mt-1" />
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal leading-snug"
                >
                  I confirm that this organization is legitimate and authorized
                  to issue credentials. False applications will result in
                  permanent bans.
                </Label>
              </div>

              <Button className="w-full">Submit Application</Button>

              <p className="text-center text-xs text-muted-foreground">
                Applications are typically reviewed within 2-3 business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
