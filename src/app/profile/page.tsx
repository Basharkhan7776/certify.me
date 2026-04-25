"use client";

import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Mail,
  Wallet,
  Copy,
  Pencil,
  ExternalLink,
  Globe,
  Building2,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CertCard } from "@/components/cert-card";
import { VerifyBadge } from "@/components/verify-badge";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface ProfileData {
  user: {
    name: string;
    email: string;
    walletAddr: string;
    oauthProvider: string | null;
    blocked: boolean;
  };
  org: {
    name: string;
    orgCode: string;
    walletAddr: string;
    website: string;
    contactEmail: string;
    description: string;
  } | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { address, isConnected } = useAccount();
  const [editing, setEditing] = useState(false);

  const [formName, setFormName] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formContactEmail, setFormContactEmail] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const { data: tokenIds, isLoading: loadingCerts } = useQuery<string[]>({
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
        }),
      );
      return results.filter(Boolean);
    },
    enabled: !!tokenIds?.length,
  });

  const { data: mintedCerts, isLoading: loadingMinted } = useQuery({
    queryKey: ["minted-certs", profile?.org?.orgCode],
    queryFn: async () => {
      if (!profile?.org?.orgCode) return [];
      const res = await fetch(`/api/students?orgCode=${profile.org.orgCode}`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.tokenIds?.length) return [];
      const results = await Promise.all(
        data.tokenIds.map(async (id: string) => {
          const res = await fetch(`/api/cert/${id}`);
          if (!res.ok) return null;
          return res.json();
        }),
      );
      return results.filter(Boolean);
    },
    enabled: !!profile?.org?.orgCode,
  });

  const updateMutation = useMutation({
    mutationFn: async (body: Record<string, string>) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Profile updated");
      setEditing(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  useEffect(() => {
    if (profile) {
      setFormName(profile.user.name || "");
      setFormWebsite(profile.org?.website || "");
      setFormContactEmail(profile.org?.contactEmail || "");
      setFormDescription(profile.org?.description || "");
    }
  }, [profile]);

  if (status === "loading" || isLoading) {
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
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (status === "unauthenticated") {
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
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your profile.</p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </main>
      </div>
    );
  }

  if (!profile?.user) {
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
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">No profile data found for your account.</p>
        </main>
      </div>
    );
  }

  const isOrg = !!profile.org;
  const walletAddr = profile.user.walletAddr || address || "";
  const initials = (profile.user.name || profile.user.email || "U").charAt(0).toUpperCase();

  const handleSave = () => {
    const body: Record<string, string> = { name: formName };
    if (isOrg) {
      body.website = formWebsite;
      body.contactEmail = formContactEmail;
      body.description = formDescription;
    }
    updateMutation.mutate(body);
  };

  const handleCancel = () => {
    setFormName(profile.user.name || "");
    setFormWebsite(profile.org?.website || "");
    setFormContactEmail(profile.org?.contactEmail || "");
    setFormDescription(profile.org?.description || "");
    setEditing(false);
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(walletAddr);
    toast.success("Wallet address copied");
  };

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
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile</CardTitle>
                {!editing ? (
                  <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleSave} disabled={updateMutation.isPending}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    {editing ? (
                      <Input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="text-lg font-semibold h-8"
                      />
                    ) : (
                      <h2 className="text-lg font-semibold">{profile.user.name || "Unnamed User"}</h2>
                    )}
                    <Badge variant="secondary" className="mt-1">
                      {isOrg ? "Organization" : "Student"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.user.email || "—"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Wallet</Label>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono">
                        {walletAddr ? `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}` : "—"}
                      </span>
                      {walletAddr && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyWallet}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {profile.user.oauthProvider && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Linked Account</Label>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm capitalize">{profile.user.oauthProvider}</span>
                        <Badge variant="outline" className="text-xs">Connected</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isOrg && profile.org && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Org Code</Label>
                    <span className="text-sm font-mono">{profile.org.orgCode}</span>
                  </div>
                  {editing ? (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Website</Label>
                        <Input
                          value={formWebsite}
                          onChange={(e) => setFormWebsite(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Contact Email</Label>
                        <Input
                          type="email"
                          value={formContactEmail}
                          onChange={(e) => setFormContactEmail(e.target.value)}
                          placeholder="contact@example.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <Textarea
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="Brief description of your organization"
                          rows={3}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {profile.org.website && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Website</Label>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={profile.org.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              {profile.org.website}
                            </a>
                          </div>
                        </div>
                      )}
                      {profile.org.contactEmail && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Contact Email</Label>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{profile.org.contactEmail}</span>
                          </div>
                        </div>
                      )}
                      {profile.org.description && (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Description</Label>
                          <p className="text-sm">{profile.org.description}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Link href={`/user/${walletAddr}`} className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Public Profile
                  </Button>
                </Link>
                {isOrg && profile.org && (
                  <Link href={`/org/${profile.org.orgCode}`} className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <Building2 className="h-4 w-4" />
                      View Public Org Page
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {isOrg ? (
              <Tabs defaultValue="received">
                <TabsList>
                  <TabsTrigger value="received">Received Certificates</TabsTrigger>
                  <TabsTrigger value="minted">Minted by Me</TabsTrigger>
                </TabsList>

                <TabsContent value="received" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Certificates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingCerts || loadingMetadata ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {[1, 2].map((i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                          ))}
                        </div>
                      ) : certs && certs.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {certs.map((cert: any) => (
                            <div key={cert.tokenId} className="space-y-2">
                              <CertCard
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
                              <div className="px-1">
                                <VerifyBadge
                                  tokenId={cert.tokenId}
                                  expectedStudent={cert.studentAddr || walletAddr}
                                  expectedOrgCode={cert.orgCode}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-8 text-muted-foreground">
                          No certificates received.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="minted" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Minted by Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingMinted ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {[1, 2].map((i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                          ))}
                        </div>
                      ) : mintedCerts && mintedCerts.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {mintedCerts.map((cert: any) => (
                            <div key={cert.tokenId} className="space-y-2">
                              <CertCard
                                id={String(cert.tokenId)}
                                name={cert.name || `Certificate #${cert.tokenId}`}
                                issuer={profile.org?.name || "Unknown"}
                                date={
                                  cert.issueDate
                                    ? new Date(cert.issueDate).toLocaleDateString()
                                    : ""
                                }
                                tokenId={cert.tokenId}
                                orgCode={cert.orgCode || ""}
                              />
                              <div className="px-1">
                                <VerifyBadge
                                  tokenId={cert.tokenId}
                                  expectedStudent={cert.studentAddr || ""}
                                  expectedOrgCode={profile.org?.orgCode}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-8 text-muted-foreground">
                          No certificates minted yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>My Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCerts || loadingMetadata ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : certs && certs.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {certs.map((cert: any) => (
                        <div key={cert.tokenId} className="space-y-2">
                          <CertCard
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
                          <div className="px-1">
                            <VerifyBadge
                              tokenId={cert.tokenId}
                              expectedStudent={cert.studentAddr || walletAddr}
                              expectedOrgCode={cert.orgCode}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-12 text-muted-foreground">
                      No certificates found for your wallet.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
