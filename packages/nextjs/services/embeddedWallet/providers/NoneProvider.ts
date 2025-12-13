import { Address } from "viem";
import { EmbeddedWalletUser, IEmbeddedWalletProvider } from "../types";

/**
 * No-op provider used when embedded wallets are disabled
 *
 * This is the default provider when embeddedWalletConfig.provider is set to "none".
 * All methods either return null/false or throw errors indicating the feature is disabled.
 */
export class NoneProvider implements IEmbeddedWalletProvider {
  async initialize(): Promise<void> {
    // No initialization needed
  }

  async login(): Promise<void> {
    throw new Error(
      "Embedded wallets are disabled. Set embeddedWalletConfig.provider in scaffold.config.ts to enable.",
    );
  }

  async logout(): Promise<void> {
    // No-op
  }

  getUser(): EmbeddedWalletUser | null {
    return null;
  }

  getAddress(): Address | null {
    return null;
  }

  isAuthenticated(): boolean {
    return false;
  }

  isLoading(): boolean {
    return false;
  }

  getProvider(): any {
    return null;
  }

  async switchChain(_chainId: number): Promise<void> {
    throw new Error("Embedded wallets are disabled.");
  }

  onAuthStateChange(_callback: (user: EmbeddedWalletUser | null) => void): () => void {
    // Return no-op unsubscribe function
    return () => {};
  }
}
