"use client";

import Link from "next/link";
import { Shield, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertCard } from "@/components/cert-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveTab } from "@/store/slices/uiSlice";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.ui.activeTab);

  const { data: tokenIds, isLoading: loadingCerts } = useQuery({
    queryKey: ["certs", address],
    queryFn: async () => {
      if (!address) return [];
      const res = await fetch(`/api/students?address=${address}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.tokenIds || [];
    },
    enabled: !!address,
  });

  const { data: certs, isLoading: loadingMetadata } = useQuery({
    queryKey: ["cert-metadata", tokenIds],
    queryFn: async () => {
      if (!tokenIds?.length) return [];
      const results = await Promise.all(
        tokenIds.map(async (id: string) => {
          const res = await fetch(`/api/cert/${id}`);
          if (!res.ok) return null;
          return res.json();
        })
      );
      return results.filter(Boolean);
    },
    enabled: !!tokenIds?.length,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Shield className="h-5 w-5" />
          Certify.me
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletConnect />
          <Link href="/profile">
            <Button variant="outline" size="sm">Profile</Button>
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

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect your wallet</h2>
            <p className="text-muted-foreground max-w-sm">
              Connect your wallet to view your certificates and mint new ones.
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => dispatch(setActiveTab(v as "my-certs" | "minted"))} className="w-full">
            <TabsList>
              <TabsTrigger value="my-certs">My Certificates</TabsTrigger>
              <TabsTrigger value="minted">Minted by Me</TabsTrigger>
            </TabsList>

            <TabsContent value="my-certs" className="mt-6">
              {loadingCerts || loadingMetadata ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ))}
                </div>
              ) : certs && certs.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {certs.map((cert: any) => (
                    <CertCard
                      key={cert.tokenId}
                      id={String(cert.tokenId)}
                      name={cert.name || `Certificate #${cert.tokenId}`}
                      issuer={cert.orgCode?.slice(0, 8) || "Unknown"}
                      date={cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : ""}
                      tokenId={cert.tokenId}
                      orgCode={cert.orgCode || ""}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No certificates found for this wallet.
                </div>
              )}
            </TabsContent>

            <TabsContent value="minted" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                No certificates minted yet.
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
