"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import scaffoldConfig from "~~/scaffold.config";
import { metadata, walletConnectProjectId } from "./wagmiConnectors";

const { targetNetworks } = scaffoldConfig;

/**
 * RainbowKit Wagmi Configuration
 * Uses RainbowKit's getDefaultConfig to create a wagmi config with popular wallet connectors
 */
export const rainbowkitWagmiConfig = getDefaultConfig({
  appName: metadata.name,
  projectId: walletConnectProjectId,
  chains: targetNetworks as any,
  ssr: true,
});
