"use client";

import { useQuery } from "@tanstack/react-query";
import { Shield, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { verifyCertificate } from "@/lib/contract";
import { bytes32ToString } from "@/lib/utils-admin";

interface VerifyBadgeProps {
  tokenId: number;
  expectedStudent: string;
  expectedOrgCode?: string;
}

export function VerifyBadge({ tokenId, expectedStudent, expectedOrgCode }: VerifyBadgeProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["verify", tokenId],
    queryFn: async () => {
      const result = await verifyCertificate(tokenId);
      return {
        uri: result[0] as string,
        student: result[1] as string,
        orgCode: bytes32ToString(result[2] as `0x${string}`),
        revoked: result[3] as boolean,
      };
    },
    enabled: !!tokenId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1">
        <HelpCircle className="h-3 w-3 animate-pulse" />
        Checking...
      </Badge>
    );
  }

  if (error || !data) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <HelpCircle className="h-3 w-3" />
        Not Found
      </Badge>
    );
  }

  if (data.revoked) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Revoked
      </Badge>
    );
  }

  const studentMatch = data.student.toLowerCase() === expectedStudent.toLowerCase();
  const orgMatch = expectedOrgCode
    ? data.orgCode === expectedOrgCode
    : true;

  if (!studentMatch || !orgMatch) {
    return (
      <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800">
        <AlertTriangle className="h-3 w-3" />
        Mismatch
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <Shield className="h-3 w-3" />
      Verified
    </Badge>
  );
}
