import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CertActions } from "@/components/cert-actions";
import { CONTRACT_ADDRESS } from "@/lib/contract";

const CONTRACT_ADDR = CONTRACT_ADDRESS || "";

interface CertData {
  tokenId: number;
  name: string;
  description: string;
  imageUrl: string;
  issueDate: string;
  expiryDate: string;
  attributes: { trait_type: string; value: string }[];
  orgCode: string;
  studentAddr: string;
  orgAddr: string;
  revoked: boolean;
  txHash: string;
  uri: string;
}

async function getCertData(tokenId: string): Promise<CertData | null> {
  try {
    const res = await fetch(`${process.env.AUTH_URL || "http://localhost:3000"}/api/cert/${tokenId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = await getCertData(id);

  if (!cert) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="container flex h-14 items-center justify-between border-b">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5" />
            Certify.me
          </Link>
          <ThemeToggle />
        </header>
        <main className="flex-1 container py-24 text-center">
          <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
          <p className="text-muted-foreground">This certificate does not exist on-chain.</p>
          <Link href="/">
            <Button className="mt-6">Go Home</Button>
          </Link>
        </main>
      </div>
    );
  }

  const etherscanTxUrl = cert.txHash ? `https://sepolia.etherscan.io/tx/${cert.txHash}` : "";
  const etherscanTokenUrl = `https://sepolia.etherscan.io/token/${CONTRACT_ADDR}?a=${cert.tokenId}`;
  const shareUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/cert/${id}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Shield className="h-5 w-5" />
          Certify.me
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 container py-8">
        <Link
          href="/app"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {cert.imageUrl && (
              <Card>
                <CardContent className="p-0 overflow-hidden">
                  <img
                    src={cert.imageUrl}
                    alt={cert.name}
                    className="w-full h-auto object-cover"
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{cert.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Token #{cert.tokenId}
                    </p>
                  </div>
                  <Badge
                    variant={cert.revoked ? "destructive" : "secondary"}
                    className="gap-1"
                  >
                    {cert.revoked ? (
                      <>
                        <XCircle className="h-3 w-3" />
                        Revoked
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{cert.orgCode.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Issued by</p>
                    <Link
                      href={`/org/${cert.orgCode}`}
                      className="text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      <Building2 className="h-3 w-3" />
                      {cert.orgCode}
                    </Link>
                  </div>
                </div>

                {cert.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{cert.description}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date Issued</p>
                    <p className="font-medium">
                      {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">
                      {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                </div>

                {cert.attributes.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Attributes</p>
                      <div className="flex flex-wrap gap-2">
                        {cert.attributes.map((attr) => (
                          <Badge key={attr.trait_type} variant="outline">
                            {attr.trait_type}: {attr.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">On-Chain Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Holder</span>
                  <Link
                    href={`/user/${cert.studentAddr}`}
                    className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <User className="h-3 w-3" />
                    {cert.studentAddr}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Issuer</span>
                  <Link
                    href={`/user/${cert.orgAddr}`}
                    className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Building2 className="h-3 w-3" />
                    {cert.orgAddr}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Token URI</span>
                  <span className="font-mono text-xs break-all">{cert.uri}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contract</span>
                  <span className="font-mono text-xs">{CONTRACT_ADDR}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span>Sepolia Testnet</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CertActions
                  etherscanTxUrl={etherscanTxUrl}
                  etherscanTokenUrl={etherscanTokenUrl}
                  shareUrl={shareUrl}
                  tokenUri={cert.uri}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground text-center">
                  This certificate is a soulbound NFT and cannot be transferred.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
