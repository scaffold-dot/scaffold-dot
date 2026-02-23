"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { PrivyProvider as PrivyReactProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import scaffoldConfig, { embeddedWalletConfig } from "~~/scaffold.config";
import { EmbeddedWalletProvider } from "~~/services/embeddedWallet/EmbeddedWalletContext";
import { useInitializeAppKit, wagmiAdapter } from "~~/services/web3/appkit";
import { rainbowkitWagmiConfig } from "~~/services/web3/rainbowkit";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  // Only initialize AppKit if it's the selected provider
  const shouldInitializeAppKit = embeddedWalletConfig.provider === "appkit";
  useInitializeAppKit(shouldInitializeAppKit);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Conditionally wraps children with provider-specific React contexts
 * Different providers have different requirements:
 * - RainbowKit, Privy, Dynamic: Require React context wrappers
 * - AppKit: No wrapper needed (uses modal initialization)
 * - Web3Auth, Magic: Work through factory pattern (no wrapper)
 * - None: No wrapper
 */
const ProviderReactWrapper = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const provider = embeddedWalletConfig.provider;

  // RainbowKit requires React context wrapper
  if (provider === "rainbowkit") {
    const rainbowkitConfig = embeddedWalletConfig.rainbowkit || {};

    return (
      <RainbowKitProvider
        theme={isDarkMode ? darkTheme() : lightTheme()}
        modalSize={rainbowkitConfig.modalSize || "compact"}
        showRecentTransactions={rainbowkitConfig.showRecentTransactions ?? true}
        coolMode={rainbowkitConfig.coolMode ?? false}
        initialChain={
          rainbowkitConfig.initialChainId
            ? scaffoldConfig.targetNetworks.find(chain => chain.id === rainbowkitConfig.initialChainId)
            : undefined
        }
      >
        {children}
      </RainbowKitProvider>
    );
  }

  // Privy requires React context wrapper
  if (provider === "privy") {
    const privyConfig = embeddedWalletConfig.privy;

    if (!privyConfig?.appId) {
      console.warn("Privy provider selected but NEXT_PUBLIC_PRIVY_APP_ID is not set");
      return <>{children}</>;
    }

    // Use explicit theme from config if provided, otherwise sync with app theme
    const privyTheme = privyConfig.appearance?.theme ?? (isDarkMode ? "dark" : "light");

    return (
      <PrivyReactProvider
        appId={privyConfig.appId}
        config={{
          loginMethods: privyConfig.loginMethods || ["email", "wallet"],
          appearance: {
            theme: privyTheme,
            accentColor: (privyConfig.appearance?.accentColor || "#2299dd") as `#${string}`,
            ...(privyConfig.appearance?.logo && { logo: privyConfig.appearance.logo }),
          },
          embeddedWallets: privyConfig.embeddedWallets || {
            createOnLogin: "users-without-wallets",
          },
        }}
      >
        {children}
      </PrivyReactProvider>
    );
  }

  // AppKit, Web3Auth, and None don't need React wrappers
  return <>{children}</>;
};

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const provider = embeddedWalletConfig.provider;
  // Only use EmbeddedWalletProvider for embedded wallet providers (not for appkit/rainbowkit/none)
  const isEmbeddedWalletProvider = ["privy", "web3auth"].includes(provider);

  // Choose the correct wagmi config based on provider
  // RainbowKit needs its own config with RainbowKit connectors
  // Everything else uses AppKit's wagmi adapter
  // Use lazy initialization for RainbowKit to avoid SSR issues with indexedDB
  const wagmiConfig = provider === "rainbowkit" ? (rainbowkitWagmiConfig || wagmiAdapter.wagmiConfig) : wagmiAdapter.wagmiConfig;

  // Don't render until mounted on client to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig as any}>
      <QueryClientProvider client={queryClient}>
        <ProviderReactWrapper>
          {isEmbeddedWalletProvider ? (
            <EmbeddedWalletProvider>
              <ProgressBar height="3px" color="#2299dd" />
              <ScaffoldEthApp>{children}</ScaffoldEthApp>
            </EmbeddedWalletProvider>
          ) : (
            <>
              <ProgressBar height="3px" color="#2299dd" />
              <ScaffoldEthApp>{children}</ScaffoldEthApp>
            </>
          )}
        </ProviderReactWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
