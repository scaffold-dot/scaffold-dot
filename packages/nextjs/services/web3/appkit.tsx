"use client";

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import scaffoldConfig, { embeddedWalletConfig } from "~~/scaffold.config";
import { metadata, walletConnectProjectId } from "./wagmiConnectors";

const { targetNetworks } = scaffoldConfig;
const appkitConfig = embeddedWalletConfig.appkit || {};

// Create the Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId: appkitConfig.projectId || walletConnectProjectId,
  networks: targetNetworks.map(network => ({
    id: network.id,
    name: network.name,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: network.rpcUrls,
    blockExplorers: network.blockExplorers,
    testnet: (network as any).testnet || false,
  })),
});

let modal: any;

// Function to get or create the modal (client-side only)
export const getAppKitModal = () => {
  if (typeof window === "undefined") return null;

  if (!modal) {
    modal = createAppKit({
      adapters: [wagmiAdapter],
      networks: targetNetworks.map(network => ({
        id: network.id,
        name: network.name,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: network.rpcUrls,
        blockExplorers: network.blockExplorers,
        testnet: (network as any).testnet || false,
      })) as any,
      projectId: appkitConfig.projectId || walletConnectProjectId,
      metadata,
      features: (appkitConfig.features || {
        analytics: false,
        email: false,
        socials: [],
        emailShowWallets: true,
      }) as any,
      enableMobileFullScreen: appkitConfig.enableMobileFullScreen ?? false,
      themeMode: appkitConfig.themeMode || "dark",
      themeVariables: appkitConfig.themeVariables || {
        "--w3m-font-family": "var(--font-unbounded), system-ui, sans-serif",
        "--w3m-accent": "#2299dd",
        "--w3m-color-mix": "#2299dd",
        "--w3m-color-mix-strength": 10,
        "--w3m-border-radius-master": "8px",
      },
    });
  }

  return modal;
};

/**
 * Hook to initialize AppKit on mount and sync theme with app theme
 *
 * This hook automatically syncs the AppKit modal theme with your app's theme.
 * When users toggle the app theme (dark/light), AppKit updates in real-time.
 *
 * The themeMode setting in config is used as initial value but is overridden
 * by this auto-sync behavior. To disable auto-sync, don't use this hook.
 *
 * @param shouldInitialize - Only initializes if true (defaults to true)
 */
export const useInitializeAppKit = (shouldInitialize = true) => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!shouldInitialize) return;

    const appKit = getAppKitModal();
    if (appKit) {
      // Auto-sync theme mode with the app's theme
      appKit.setThemeMode(resolvedTheme === "dark" ? "dark" : "light");
    }
  }, [resolvedTheme, shouldInitialize]);
};
