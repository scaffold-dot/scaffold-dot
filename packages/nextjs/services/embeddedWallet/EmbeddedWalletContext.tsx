"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { embeddedWalletConfig } from "~~/scaffold.config";
import { EmbeddedWalletFactory } from "./EmbeddedWalletFactory";
import { IEmbeddedWalletProvider } from "./types";

/**
 * Context for embedded wallet provider
 * Makes the provider accessible throughout the app
 */
const EmbeddedWalletContext = createContext<IEmbeddedWalletProvider | null>(null);

/**
 * Provider component that initializes and provides embedded wallet functionality
 *
 * This should wrap your app at the root level:
 * ```tsx
 * <EmbeddedWalletProvider>
 *   <YourApp />
 * </EmbeddedWalletProvider>
 * ```
 */
export const EmbeddedWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<IEmbeddedWalletProvider | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initProvider = async () => {
      try {
        const embeddedProvider = await EmbeddedWalletFactory.createProvider(embeddedWalletConfig);

        if (mounted) {
          setProvider(embeddedProvider);
        }
      } catch (err) {
        console.error("Failed to initialize embedded wallet provider:", err);
        if (mounted) {
          setError(err as Error);
        }
      }
    };

    initProvider();

    return () => {
      mounted = false;
    };
  }, []);

  // Show error in development
  if (error && process.env.NODE_ENV === "development") {
    console.error("Embedded Wallet Error:", error);
  }

  return <EmbeddedWalletContext.Provider value={provider}>{children}</EmbeddedWalletContext.Provider>;
};

/**
 * Hook to access the embedded wallet provider
 * @internal - Use useEmbeddedWallet() instead for a better API
 */
export const useEmbeddedWalletProvider = (): IEmbeddedWalletProvider | null => {
  return useContext(EmbeddedWalletContext);
};
