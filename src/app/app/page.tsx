import Link from "next/link";
import { Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertCard } from "@/components/cert-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { mockCertificates } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Certify.me
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Mint Certificate
          </Button>
        </div>

        <Tabs defaultValue="my-certs" className="w-full">
          <TabsList>
            <TabsTrigger value="my-certs">My Certificates</TabsTrigger>
            <TabsTrigger value="minted">Minted by Me</TabsTrigger>
          </TabsList>

          <TabsContent value="my-certs" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockCertificates.slice(0, 2).map((cert) => (
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
          </TabsContent>

          <TabsContent value="minted" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockCertificates.slice(1, 3).map((cert) => (
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
