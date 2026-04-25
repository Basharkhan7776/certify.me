"use client";

import Link from "next/link";
import {
  Shield,
  Plus,
  Wallet,
  Search,
  ArrowUpDown,
  Filter,
  CheckCircle,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useEffect, useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const filteredCerts = useMemo(() => {
    if (!certs) return [];
    let filtered = certs.filter((cert: any) => {
      const query = searchQuery.toLowerCase();
      return (
        (cert.name || "").toLowerCase().includes(query) ||
        (cert.orgCode || "").toLowerCase().includes(query) ||
        String(cert.tokenId).includes(query)
      );
    });

    filtered.sort((a: any, b: any) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "date") {
        const dateA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
        const dateB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
        return (dateA - dateB) * multiplier;
      }
      return (a.name || "").localeCompare(b.name || "") * multiplier;
    });

    return filtered;
  }, [certs, searchQuery, sortBy, sortOrder]);

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
          <>
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground mt-1">
                    {userRole.isOrg ? "Manage and issue certificates" : "View your verified certificates"}
                  </p>
                </div>
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

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) =>
                    dispatch(setActiveTab(v as "my-certs" | "minted"))
                  }
                >
                  <TabsList>
                    <TabsTrigger value="my-certs" className="gap-2">
                      <User className="h-4 w-4" />
                      My Certificates
                    </TabsTrigger>
                    {userRole.isOrg && (
                      <TabsTrigger value="minted" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Minted by Me
                      </TabsTrigger>
                    )}
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search certificates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        {sortBy === "date" ? "Date" : "Name"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy("date")}>
                        <CheckCircle className={`h-4 w-4 mr-2 ${sortBy === "date" ? "opacity-100" : "opacity-0"}`} />
                        Date
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("name")}>
                        <CheckCircle className={`h-4 w-4 mr-2 ${sortBy === "name" ? "opacity-100" : "opacity-0"}`} />
                        Name
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="sm" className="gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        {sortOrder === "desc" ? "Newest" : "Oldest"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                        <CheckCircle className={`h-4 w-4 mr-2 ${sortOrder === "desc" ? "opacity-100" : "opacity-0"}`} />
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                        <CheckCircle className={`h-4 w-4 mr-2 ${sortOrder === "asc" ? "opacity-100" : "opacity-0"}`} />
                        Oldest First
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                dispatch(setActiveTab(v as "my-certs" | "minted"))
              }
              className="w-full"
            >
              <TabsContent value="my-certs" className="mt-0">
                {loadingCerts || loadingMetadata ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-20 w-full" />
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredCerts.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCerts.map((cert: any) => (
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
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">
                      {searchQuery ? "No matching certificates" : "No certificates found"}
                    </h3>
                    <p className="text-muted-foreground max-w-sm">
                      {searchQuery
                        ? `No certificates match "${searchQuery}". Try a different search.`
                        : "Connect your wallet or mint a certificate to get started."}
                    </p>
                  </div>
                )}
              </TabsContent>

              {userRole.isOrg && userRole.orgCode && (
                <TabsContent value="minted" className="mt-0">
                  <MintedCertsTab orgCode={userRole.orgCode} />
                </TabsContent>
              )}
            </Tabs>
          </>
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
