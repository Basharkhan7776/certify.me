import Link from "next/link";
import { Shield, ArrowLeft, Mail, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CertCard } from "@/components/cert-card";
import { getUserById, getUserCerts } from "@/lib/mock-data";

export default function UserPage({ params }: { params: { id: string } }) {
  const user = getUserById(params.id) || {
    id: params.id,
    name: "Alice Johnson",
    email: "alice@example.com",
    walletAddr: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
  };

  const certs = getUserCerts(params.id);

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
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  {user.walletAddr.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{certs.length}</p>
              <p className="text-sm text-muted-foreground">Certificates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Badge variant="secondary">Verified</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Account Status
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Polygon</p>
              <p className="text-sm text-muted-foreground mt-1">Network</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-6" />

        <h2 className="text-lg font-semibold mb-4">Verified Certificates</h2>
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
              No certificates found.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
