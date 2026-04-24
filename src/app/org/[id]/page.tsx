import Link from "next/link";
import { Shield, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CertCard } from "@/components/cert-card";
import { getOrgById, getOrgCerts } from "@/lib/mock-data";

export default function OrgPage({ params }: { params: { id: string } }) {
  const org = getOrgById(params.id) || {
    id: params.id,
    name: "Tech University",
    orgCode: "0x54454348...",
    walletAddr: "0x1234567890abcdef1234567890abcdef12345678",
    approved: true,
    createdAt: "2025-01-15",
  };

  const certs = getOrgCerts(params.id);

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
          Back
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {org.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{org.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  Verified Org
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Member since {org.createdAt}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{certs.length}</p>
              <p className="text-sm text-muted-foreground">
                Certificates Issued
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {org.orgCode}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Org Code</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-mono text-muted-foreground">
                {org.walletAddr.slice(0, 10)}...
              </p>
              <p className="text-sm text-muted-foreground mt-1">Wallet</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-6" />

        <h2 className="text-lg font-semibold mb-4">Issued Certificates</h2>
        {certs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certs.map((cert) => (
              <CertCard
                key={cert.id}
                id={cert.id}
                name={cert.name}
                issuer={cert.issuer}
                date={cert.date}
                tokenId={cert.tokenId}
                orgCode={cert.orgCode}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No certificates issued yet.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
