"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Provider as ReduxProvider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { queryClient } from "@/lib/query-client";
import { wagmiConfig } from "@/lib/wagmi";
import { store } from "@/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <SessionProvider>{children}</SessionProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
