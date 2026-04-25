"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  url: string;
}

export function ShareButton({ url }: ShareButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }}
    >
      <Share2 className="h-3 w-3" />
      Share
    </Button>
  );
}
