import Link from "next/link";
import { Shield, ArrowLeft, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CertCard } from "@/components/cert-card";
import { ShareButton } from "@/components/share-button";
import { getCertsByOrg } from "@/lib/contract";
import { stringToBytes32, shortAddress } from "@/lib/utils-admin";

interface OrgData {
  name: string;
  orgCode: string;
  walletAddr: string;
  description: string;
  website: string;
  contactEmail: string;
  createdAt: string;
}

async function getOrgData(orgCode: string): Promise<OrgData | null> {
  try {
    const res = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/orgs/${orgCode}`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getOrgTokenIds(orgCode: string): Promise<string[]> {
  try {
    const bytes32Code = stringToBytes32(orgCode);
    const tokenIds = await getCertsByOrg(bytes32Code);
    return tokenIds.map((id: bigint) => id.toString());
  } catch {
    return [];
  }
}

export default async function OrgPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orgCode } = await params;
  const org = await getOrgData(orgCode);
  const tokenIds = await getOrgTokenIds(orgCode);

  if (!org) {
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
          <h1 className="text-2xl font-bold mb-2">Organization Not Found</h1>
          <p className="text-muted-foreground">
            This organization does not exist or is not approved.
          </p>
          <Link href="/">
            <Button className="mt-6">Go Home</Button>
          </Link>
        </main>
      </div>
    );
  }

  const shareUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/org/${orgCode}`;

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
                  Member since {new Date(org.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{tokenIds.length}</p>
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
                {shortAddress(org.walletAddr)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Wallet</p>
            </CardContent>
          </Card>
        </div>

        {(org.description || org.website || org.contactEmail) && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {org.description && (
                  <div>
                    <p className="text-muted-foreground">Description</p>
                    <p>{org.description}</p>
                  </div>
                )}
                {org.website && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Website</span>
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      {org.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {org.contactEmail && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Contact</span>
                    <a
                      href={`mailto:${org.contactEmail}`}
                      className="text-primary hover:underline"
                    >
                      {org.contactEmail}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
            <Separator className="mb-6" />
          </>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Issued Certificates</h2>
          <ShareButton url={shareUrl} />
        </div>

        {tokenIds.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tokenIds.map((tokenId) => (
              <CertCard
                key={tokenId}
                id={tokenId}
                name={`Certificate #${tokenId}`}
                issuer={org.orgCode}
                date=""
                tokenId={Number(tokenId)}
                orgCode={org.orgCode}
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
