"use client";

import Link from "next/link";
import { Shield, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertCard } from "@/components/cert-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import { MintDialog } from "@/components/mint-dialog";
import { MintedCertsTab } from "@/components/minted-certs-tab";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveTab, setMintDialogOpen } from "@/store/slices/uiSlice";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface UserRole {
  isOrg: boolean;
  orgCode?: string;
  orgName?: string;
  orgWalletAddr?: string;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.ui.activeTab);
  const mintDialogOpen = useAppSelector((s) => s.ui.mintDialogOpen);

  const [userRole, setUserRole] = useState<UserRole>({ isOrg: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sessionWalletAddr = (session?.user as any)?.walletAddr || "";
  const effectiveAddress = address || sessionWalletAddr;

  const { data: tokenIds, isLoading: loadingCerts } = useQuery({
    queryKey: ["certs", effectiveAddress],
    queryFn: async () => {
      if (!effectiveAddress) return [];
      const res = await fetch(`/api/students?address=${effectiveAddress}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.tokenIds || [];
    },
    enabled: !!effectiveAddress,
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
        }),
      );
      return results.filter(Boolean);
    },
    enabled: !!tokenIds?.length,
  });

  useEffect(() => {
    const checkAddr = address || sessionWalletAddr;
    if (checkAddr) {
      fetch(`/api/user/role?walletAddr=${checkAddr}`)
        .then((res) => res.json())
        .then((data) => setUserRole(data))
        .catch(() => setUserRole({ isOrg: false }));
    } else {
      setUserRole({ isOrg: false });
    }
  }, [address, sessionWalletAddr]);

  const isLoading = status === "loading" || !mounted;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Certify.me
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletConnect />
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
          {userRole.isOrg && isConnected && (
            <Button
              className="gap-2"
              onClick={() => dispatch(setMintDialogOpen(true))}
            >
              <Plus className="h-4 w-4" />
              Mint Certificate
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          </div>
        ) : !effectiveAddress ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Wallet Linked</h2>
            <p className="text-muted-foreground max-w-sm mb-4">
              Connect your wallet or link one in your profile to view certificates.
            </p>
            <Link href="/profile">
              <Button variant="outline">Go to Profile</Button>
            </Link>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) =>
              dispatch(setActiveTab(v as "my-certs" | "minted"))
            }
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="my-certs">My Certificates</TabsTrigger>
              {userRole.isOrg && (
                <TabsTrigger value="minted">Minted by Me</TabsTrigger>
              )}
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
                      issuer={cert.orgCode || "Unknown"}
                      date={
                        cert.issueDate
                          ? new Date(cert.issueDate).toLocaleDateString()
                          : ""
                      }
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

            {userRole.isOrg && userRole.orgCode && (
              <TabsContent value="minted" className="mt-6">
                <MintedCertsTab orgCode={userRole.orgCode} />
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>

      {userRole.isOrg && userRole.orgCode && userRole.orgWalletAddr && isConnected && (
        <MintDialog
          open={mintDialogOpen}
          onOpenChange={(val) => dispatch(setMintDialogOpen(val))}
          orgCode={userRole.orgCode}
          orgWalletAddr={userRole.orgWalletAddr}
          onSuccess={() => {
            dispatch(setActiveTab("my-certs"));
          }}
        />
      )}
    </div>
  );
}
