"use client";

import Link from "next/link";
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  User,
  ExternalLink,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface VerifyResult {
  tokenId: number;
  name: string;
  description: string;
  imageUrl: string;
  issueDate: string;
  expiryDate: string;
  isExpired: boolean;
  attributes: { trait_type: string; value: string }[];
  studentAddr: string;
  orgAddr: string;
  orgCode: string;
  orgName: string;
  revoked: boolean;
  uri: string;
}

export default function VerifyPage() {
  const [tokenId, setTokenId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<VerifyResult>({
    queryKey: ["verify", tokenId],
    queryFn: async () => {
      const res = await fetch(`/api/verify?tokenId=${tokenId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Verification failed");
      }
      return res.json();
    },
    enabled: false,
    retry: false,
  });

  const handleVerify = () => {
    if (!tokenId.trim()) return;
    setSubmitted(true);
    refetch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleVerify();
  };

  const isNotFound = (error as any)?.message?.includes("not found");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Certify.me
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 container py-12">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Verify a Certificate</h1>
            <p className="mt-2 text-muted-foreground">
              Enter a Token ID to verify a certificate on-chain. No login
              required.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Lookup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Token ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="token"
                    type="number"
                    placeholder="Enter token ID (e.g. 1)"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    min={0}
                  />
                  <Button
                    onClick={handleVerify}
                    disabled={!tokenId.trim() || isLoading}
                    className="gap-2 shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Verify
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {submitted && isLoading && (
            <div className="mt-8 text-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Verifying certificate on-chain...</p>
            </div>
          )}

          {submitted && error && (
            <div className="mt-8">
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 shrink-0">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-destructive">
                        {isNotFound
                          ? "Certificate Not Found"
                          : "Verification Failed"}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isNotFound
                          ? `Token ID #${tokenId} does not exist on-chain.`
                          : (error as Error).message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {submitted && data && (
            <div className="mt-8 space-y-6">
              <h2 className="text-lg font-semibold">Verification Result</h2>

              <Card
                className={
                  data.revoked || data.isExpired
                    ? "border-yellow-500 dark:border-yellow-600"
                    : "border-green-500 dark:border-green-600"
                }
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${
                        data.revoked || data.isExpired
                          ? "bg-yellow-100 dark:bg-yellow-900"
                          : "bg-green-100 dark:bg-green-900"
                      }`}
                    >
                      {data.revoked ? (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      ) : data.isExpired ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{data.name}</h3>
                        {data.revoked ? (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Revoked
                          </Badge>
                        ) : data.isExpired ? (
                          <Badge
                            variant="outline"
                            className="gap-1 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      {data.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {data.description}
                        </p>
                      )}

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Issued by
                            </p>
                            <Link
                              href={`/user/${data.orgAddr}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {data.orgName}
                            </Link>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Holder
                            </p>
                            <Link
                              href={`/user/${data.studentAddr}`}
                              className="font-mono text-xs text-primary hover:underline"
                            >
                              {data.studentAddr.slice(0, 6)}...
                              {data.studentAddr.slice(-4)}
                            </Link>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Issued
                            </p>
                            <p className="font-medium">
                              {data.issueDate
                                ? new Date(data.issueDate).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Expires
                            </p>
                            <p className="font-medium">
                              {data.expiryDate
                                ? new Date(data.expiryDate).toLocaleDateString()
                                : "Never"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Token ID
                            </p>
                            <p className="font-medium">#{data.tokenId}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Org Code
                            </p>
                            <p className="font-mono text-xs">{data.orgCode}</p>
                          </div>
                        </div>
                      </div>

                      {data.attributes.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Attributes
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {data.attributes.map((attr) => (
                                <Badge key={attr.trait_type} variant="outline">
                                  {attr.trait_type}: {attr.value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <Separator className="my-4" />

                      <div className="flex gap-2 flex-wrap">
                        <Link href={`/cert/${data.tokenId}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="h-3 w-3" />
                            View Certificate
                          </Button>
                        </Link>
                        <Link href={`/user/${data.orgAddr}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Building2 className="h-3 w-3" />
                            View Issuer
                          </Button>
                        </Link>
                        <Link href={`/user/${data.studentAddr}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <User className="h-3 w-3" />
                            View Holder
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">
                        On-Chain Status:
                      </span>{" "}
                      {data.revoked
                        ? "This certificate has been revoked by the issuer."
                        : data.isExpired
                        ? "This certificate has expired."
                        : "This certificate is valid and exists on-chain."}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Network:
                      </span>{" "}
                      Sepolia Testnet
                    </p>
                    <p className="font-mono break-all">
                      <span className="font-medium text-foreground">
                        Token URI:
                      </span>{" "}
                      {data.uri}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
