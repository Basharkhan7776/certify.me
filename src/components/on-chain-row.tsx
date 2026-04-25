"use client";

import Link from "next/link";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/utils-admin";
import { toast } from "sonner";

export function OnChainRow({ label, value, link, icon: Icon, copyable }: { label: string; value: string; link?: string; icon?: any; copyable?: boolean }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        {link ? (
          <Link href={link} className="font-mono text-xs text-primary hover:underline truncate flex items-center gap-1">
            {Icon && <Icon className="h-3 w-3 shrink-0" />}
            {shortAddress(value)}
          </Link>
        ) : (
          <span className="font-mono text-xs truncate">{value}</span>
        )}
        {copyable && (
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopy}>
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
