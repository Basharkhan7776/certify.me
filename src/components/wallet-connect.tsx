"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useAppDispatch } from "@/store/hooks";
import { setConnected, disconnect as walletDisconnect } from "@/store/slices/walletSlice";
import { setWalletAddr } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      dispatch(setConnected({ address: address as `0x${string}`, chainId: 11155111 }));
      dispatch(setWalletAddr(address));
    }
  }, [isConnected, address, dispatch]);

  if (!mounted) {
    return (
      <span className="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-input bg-transparent px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </span>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => {
            wagmiDisconnect();
            dispatch(walletDisconnect());
          }}
        >
          <LogOut className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const availableConnectors = connectors.length > 0 ? connectors : [injected()];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <span className="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-input bg-transparent px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Certify.me
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          {availableConnectors.map((connector, i) => {
            const c = connector as any;
            const name = c.name || "Detected Wallet";
            const key = c.id || `connector-${i}`;
            return (
              <button
                key={key}
                type="button"
                className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                onClick={() => {
                  connect({ connector });
                  setOpen(false);
                }}
              >
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{name}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
