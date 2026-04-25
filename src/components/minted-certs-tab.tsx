"use client";

import { CertCard } from "@/components/cert-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Search, CheckCircle, ArrowUpDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MintedCertsTabProps {
  orgCode: string;
}

export function MintedCertsTab({ orgCode }: MintedCertsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const filteredCerts = useMemo(() => {
    if (!certs) return [];
    let filtered = certs.filter((cert: any) => {
      const query = searchQuery.toLowerCase();
      return (
        (cert.name || "").toLowerCase().includes(query) ||
        (cert.studentAddr || "").toLowerCase().includes(query) ||
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

  if (loadingIds || loadingMetadata) {
    return (
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
    );
  }

  if (!filteredCerts || filteredCerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">
          {searchQuery ? "No matching certificates" : "No certificates minted yet"}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          {searchQuery
            ? `No certificates match "${searchQuery}". Try a different search.`
            : "Start minting certificates to see them here."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, student, or token ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCerts.map((cert: any) => (
          <CertCard
            key={cert.tokenId}
            id={String(cert.tokenId)}
            name={cert.name || `Certificate #${cert.tokenId}`}
            issuer={cert.studentAddr ? `${cert.studentAddr.slice(0, 6)}...${cert.studentAddr.slice(-4)}` : "Unknown"}
            date={cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : ""}
            tokenId={cert.tokenId}
            orgCode={cert.orgCode || ""}
          />
        ))}
      </div>
    </div>
  );
}
