import Link from "next/link";
import { Shield, ArrowLeft, Mail, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CertCard } from "@/components/cert-card";
import { ShareButton } from "@/components/share-button";
import {
  getCertsByStudent,
  getCertificate,
  resolveDetails,
} from "@/lib/contract";
import { shortAddress, bytes32ToString } from "@/lib/utils-admin";
import { Certificate } from "@/models/Certificate";
import { connectDB } from "@/lib/db";

const PINATA_GATEWAY = process.env.PINATA_GATEWAY_URL || "gateway.pinata.cloud";

interface UserData {
  name: string;
  email: string;
  walletAddr: string;
  blocked: boolean;
  createdAt: string | null;
}

interface CertSummary {
  tokenId: number;
  name: string;
  issuer: string;
  date: string;
  orgCode: string;
}

async function getUserData(walletAddr: string): Promise<UserData | null> {
  try {
    const res = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/users/${walletAddr}`,
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

async function getUserTokenIds(walletAddr: string): Promise<readonly bigint[]> {
  try {
    return await getCertsByStudent(walletAddr as `0x${string}`);
  } catch {
    return [];
  }
}

async function fetchCertSummary(tokenId: bigint): Promise<CertSummary | null> {
  try {
    const tid = Number(tokenId);
    const [cert, details] = await Promise.all([
      getCertificate(tid),
      resolveDetails(tid),
    ]);

    const rawOrgCode = cert[2] as `0x${string}`;
    const readableOrgCode = bytes32ToString(rawOrgCode);

    let name = `Certificate #${tid}`;
    let issueDate = "";

    try {
      const uri = cert[0] as string;
      if (uri && uri.startsWith("ipfs://")) {
        const cid = uri.replace("ipfs://", "");
        const res = await fetch(`https://${PINATA_GATEWAY}/ipfs/${cid}`);
        if (res.ok) {
          const metadata = await res.json();
          name = metadata.name || name;
          issueDate = metadata.issueDate || "";
        }
      }
    } catch {
      // fallback to on-chain data
    }

    let issuer = readableOrgCode;
    try {
      await connectDB();
      const orgCodeHex = rawOrgCode;
      const Org = (await import("@/models/Org")).Org;
      const org = await Org.findOne({ orgCode: orgCodeHex });
      if (org) {
        issuer = org.name;
      }
    } catch {
      // fallback to raw orgCode
    }

    return {
      tokenId: tid,
      name,
      issuer,
      date: issueDate ? new Date(issueDate).toLocaleDateString() : "",
      orgCode: readableOrgCode,
    };
  } catch {
    return null;
  }
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: walletAddr } = await params;

  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddr)) {
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
          <h1 className="text-2xl font-bold mb-2">Invalid Address</h1>
          <p className="text-muted-foreground">
            The provided wallet address is not valid.
          </p>
          <Link href="/">
            <Button className="mt-6">Go Home</Button>
          </Link>
        </main>
      </div>
    );
  }

  const user = await getUserData(walletAddr);
  const tokenIds = await getUserTokenIds(walletAddr);

  const certSummaries: CertSummary[] = [];
  for (const tokenId of tokenIds) {
    const summary = await fetchCertSummary(tokenId);
    if (summary) {
      certSummaries.push(summary);
    }
  }

  if (!user) {
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
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-muted-foreground">
            No data found for this wallet address.
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
  }/user/${walletAddr}`;

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
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  {shortAddress(user.walletAddr)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{certSummaries.length}</p>
              <p className="text-sm text-muted-foreground">Certificates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Badge variant={user.blocked ? "destructive" : "secondary"}>
                {user.blocked ? "Blocked" : "Active"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Account Status
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Sepolia</p>
              <p className="text-sm text-muted-foreground mt-1">Network</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-6" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Verified Certificates</h2>
          <ShareButton url={shareUrl} />
        </div>

        {certSummaries.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certSummaries.map((cert) => (
              <CertCard
                key={cert.tokenId}
                id={cert.tokenId.toString()}
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
              No certificates found for this wallet.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
