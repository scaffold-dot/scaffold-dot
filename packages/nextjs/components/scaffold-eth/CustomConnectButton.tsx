"use client";

import { AppKitCustomConnectButton } from "./AppKitCustomConnectButton";
import { PrivyCustomConnectButton } from "./PrivyCustomConnectButton";
import { RainbowKitCustomConnectButton } from "./RainbowKitCustomConnectButton";
import { Web3AuthCustomConnectButton } from "./Web3AuthCustomConnectButton";
import { embeddedWalletConfig } from "~~/scaffold.config";

/**
 * Unified Connect Button
 *
 * Automatically switches between AppKit, RainbowKit, or embedded wallet providers
 * based on the provider configured in scaffold.config.ts
 *
 * Usage in Header or anywhere else:
 * ```tsx
 * <CustomConnectButton />
 * ```
 */
export const CustomConnectButton = () => {
  const provider = embeddedWalletConfig.provider;

  // Privy provider
  if (provider === "privy") {
    return <PrivyCustomConnectButton />;
  }

  // Web3Auth provider
  if (provider === "web3auth") {
    return <Web3AuthCustomConnectButton />;
  }

  // RainbowKit provider
  if (provider === "rainbowkit") {
    return <RainbowKitCustomConnectButton />;
  }

  // AppKit provider (default)
  return <AppKitCustomConnectButton />;
};
