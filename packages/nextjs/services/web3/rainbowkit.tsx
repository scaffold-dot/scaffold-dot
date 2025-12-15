"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import scaffoldConfig from "~~/scaffold.config";
import { metadata, walletConnectProjectId } from "./wagmiConnectors";

const { targetNetworks } = scaffoldConfig;

let cachedConfig: any = null;

/**
 * Get RainbowKit Wagmi Configuration (lazy initialization to avoid SSR issues)
 * Uses RainbowKit's getDefaultConfig to create a wagmi config with popular wallet connectors
 *
 * This is lazily initialized to prevent indexedDB access during SSR
 */
export const getRainbowkitWagmiConfig = () => {
  if (typeof window === "undefined") {
    // Return a minimal config during SSR
    return null;
  }

  if (!cachedConfig) {
    cachedConfig = getDefaultConfig({
      appName: metadata.name,
      projectId: walletConnectProjectId,
      chains: targetNetworks as any,
      ssr: true,
    });
  }

  return cachedConfig;
};

// Legacy export for backwards compatibility
export const rainbowkitWagmiConfig = getRainbowkitWagmiConfig();
