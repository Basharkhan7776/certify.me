import Link from "next/link";
import { Shield, Search, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Certify.me
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 container py-12">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Verify a Certificate</h1>
            <p className="mt-2 text-muted-foreground">
              Enter a wallet address or token ID to verify a certificate
              on-chain.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Lookup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <Input
                  id="wallet"
                  placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Token ID</Label>
                <Input id="token" type="number" placeholder="1" />
              </div>
              <Button className="w-full gap-2">
                <Search className="h-4 w-4" />
                Verify
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">Verification Result</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Blockchain Fundamentals</h3>
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Issued by{" "}
                      <span className="font-medium text-foreground">
                        Tech University
                      </span>
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">
                          Holder:
                        </span>{" "}
                        <span className="font-mono">0x742d...2bD18</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          Token ID:
                        </span>{" "}
                        1
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          Org Code:
                        </span>{" "}
                        <span className="font-mono">0x5445...4348</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          Date:
                        </span>{" "}
                        2025-03-15
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
