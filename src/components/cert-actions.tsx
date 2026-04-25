"use client";

import { ExternalLink, Copy, Share2, QrCode, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CONTRACT_ADDRESS } from "@/lib/contract";

interface CertActionsProps {
  etherscanTxUrl: string;
  etherscanTokenUrl: string;
  shareUrl: string;
  tokenUri: string;
}

export function CertActions({ etherscanTxUrl, etherscanTokenUrl, shareUrl, tokenUri }: CertActionsProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareUrl)}&size=300x300`;
  const contractExplorerUrl = `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`;

  return (
    <>
      <div className="flex flex-col gap-3">
        {etherscanTxUrl && (
          <a href={etherscanTxUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              View TX on Etherscan
            </Button>
          </a>
        )}
        <a href={etherscanTokenUrl} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button variant="outline" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            View Token on Etherscan
          </Button>
        </a>
        <a href={contractExplorerUrl} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button variant="outline" className="w-full gap-2">
            <FileText className="h-4 w-4" />
            View Contract on Etherscan
          </Button>
        </a>
        <Dialog open={qrOpen} onOpenChange={setQrOpen}>
          <DialogTrigger>
            <Button variant="outline" className="w-full gap-2">
              <QrCode className="h-4 w-4" />
              View QR Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Certificate QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-white p-4 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="Certificate QR Code"
                  className="w-[300px] h-[300px]"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center break-all">
                {shareUrl}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success("Link copied to clipboard");
                }}
              >
                <Copy className="h-3 w-3" />
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard");
          }}
        >
          <Share2 className="h-4 w-4" />
          Share Certificate
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => {
            navigator.clipboard.writeText(tokenUri);
            toast.success("Token URI copied");
          }}
        >
          <Copy className="h-4 w-4" />
          Copy Token URI
        </Button>
      </div>
    </>
  );
}
