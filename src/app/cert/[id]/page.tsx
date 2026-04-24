import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getCertificateById } from "@/lib/mock-data";

export default function CertPage({ params }: { params: { id: string } }) {
  const cert = getCertificateById(params.id) || {
    id: params.id,
    name: "Blockchain Fundamentals",
    issuer: "Tech University",
    orgCode: "0x54454348...",
    studentAddr: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
    tokenId: 1,
    date: "2025-03-15",
    uri: "ipfs://QmX7Y8Z9...",
    attributes: [
      { trait_type: "Grade", value: "A" },
      { trait_type: "Duration", value: "12 weeks" },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
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
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{cert.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Token #{cert.tokenId}
                    </p>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{cert.issuer.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Issued by</p>
                    <Link
                      href={`/org/org-1`}
                      className="text-sm font-medium hover:underline"
                    >
                      {cert.issuer}
                    </Link>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date Issued</p>
                    <p className="font-medium">{cert.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Org Code</p>
                    <p className="font-mono text-xs">{cert.orgCode}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Attributes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cert.attributes.map((attr) => (
                      <Badge key={attr.trait_type} variant="outline">
                        {attr.trait_type}: {attr.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">On-Chain Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Holder</span>
                  <span className="font-mono text-xs">{cert.studentAddr}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Token URI</span>
                  <span className="font-mono text-xs">{cert.uri}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contract</span>
                  <span className="font-mono text-xs">0xVeriMint...1234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span>Polygon (Testnet)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View on PolygonScan
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Token URI
                </Button>
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
