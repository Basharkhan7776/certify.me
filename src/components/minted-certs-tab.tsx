"use client";

import { CertCard } from "@/components/cert-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface MintedCertsTabProps {
  orgCode: string;
}

export function MintedCertsTab({ orgCode }: MintedCertsTabProps) {
  const { data: tokenIds, isLoading: loadingIds } = useQuery({
    queryKey: ["org-certs", orgCode],
    queryFn: async () => {
      const res = await fetch(`/api/students?orgCode=${orgCode}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.tokenIds || [];
    },
    enabled: !!orgCode,
  });

  const { data: certs, isLoading: loadingMetadata } = useQuery({
    queryKey: ["org-cert-metadata", tokenIds],
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

  if (loadingIds || loadingMetadata) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!certs || certs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No certificates minted yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {certs.map((cert: any) => (
        <CertCard
          key={cert.tokenId}
          id={String(cert.tokenId)}
          name={cert.name || `Certificate #${cert.tokenId}`}
          issuer={cert.orgCode || "Unknown"}
          date={cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : ""}
          tokenId={cert.tokenId}
          orgCode={cert.orgCode || ""}
        />
      ))}
    </div>
  );
}
