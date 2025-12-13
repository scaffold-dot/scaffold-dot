import { Magic } from "magic-sdk";
import { Address } from "viem";
import scaffoldConfig, { EmbeddedWalletConfig } from "~~/scaffold.config";
import { EmbeddedWalletUser, IEmbeddedWalletProvider } from "../types";

/**
 * Magic embedded wallet provider
 *
 * Magic provides simple passwordless email login.
 * It works with any custom EVM chain.
 *
 * @see https://magic.link/docs for complete documentation
 */
export class MagicProvider implements IEmbeddedWalletProvider {
  private magic: Magic | null = null;
  private listeners: Array<(user: EmbeddedWalletUser | null) => void> = [];
  private isInitializing = true;
  private currentUser: EmbeddedWalletUser | null = null;

  constructor(private config: EmbeddedWalletConfig) {
    if (!config.magic?.apiKey) {
      throw new Error("Magic API key is required");
    }
  }

  async initialize(): Promise<void> {
    const targetChain = scaffoldConfig.targetNetworks[0];
    const magicConfig = this.config.magic!;

    // Use custom network config if provided, otherwise use targetNetworks
    const networkConfig = magicConfig.network || {
      rpcUrl: targetChain.rpcUrls.default.http[0],
      chainId: targetChain.id,
    };

    this.magic = new Magic(magicConfig.apiKey, {
      network: networkConfig,
    });

    this.isInitializing = false;

    // Check if already logged in
    const isLoggedIn = await this.magic.user.isLoggedIn();
    if (isLoggedIn) {
      await this.loadUserInfo();
    }
  }

  async login(): Promise<void> {
    if (!this.magic) {
      throw new Error("Magic not initialized");
    }

    // Magic will show its own modal for email input
    await this.magic.wallet.connectWithUI();

    await this.loadUserInfo();
  }

  async logout(): Promise<void> {
    if (!this.magic) {
      throw new Error("Magic not initialized");
    }

    await this.magic.user.logout();
    this.currentUser = null;
    this.notifyListeners(null);
  }

  getUser(): EmbeddedWalletUser | null {
    return this.currentUser;
  }

  getAddress(): Address | null {
    return this.currentUser?.walletAddress ?? null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isLoading(): boolean {
    return this.isInitializing;
  }

  getProvider(): any {
    return this.magic?.rpcProvider ?? null;
  }

  async switchChain(chainId: number): Promise<void> {
    if (!this.magic) {
      throw new Error("Not initialized");
    }

    // Find the target chain
    const targetChain = scaffoldConfig.targetNetworks.find(chain => chain.id === chainId);
    if (!targetChain) {
      throw new Error(`Chain ${chainId} not found in targetNetworks`);
    }

    // Magic doesn't support runtime chain switching
    // User would need to reinitialize with a new Magic instance
    throw new Error(
      "Magic does not support runtime chain switching. " +
      "To use a different chain, update embeddedWalletConfig and reload the app."
    );
  }

  onAuthStateChange(callback: (user: EmbeddedWalletUser | null) => void): () => void {
    this.listeners.push(callback);

    // Call immediately with current state
    callback(this.currentUser);

    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private async loadUserInfo(): Promise<void> {
    if (!this.magic) return;

    try {
      const metadata = await this.magic.user.getInfo();
      const accounts = await this.magic.wallet.request({
        method: "eth_accounts",
      }) as string[];

      this.currentUser = {
        id: metadata.publicAddress || "",
        email: metadata.email,
        phone: metadata.phoneNumber,
        walletAddress: accounts[0] as Address,
        createdAt: new Date(),
      };

      this.notifyListeners(this.currentUser);
    } catch (error) {
      console.error("Failed to load Magic user info:", error);
      this.currentUser = null;
      this.notifyListeners(null);
    }
  }

  private notifyListeners(user: EmbeddedWalletUser | null) {
    this.listeners.forEach(cb => cb(user));
  }
}
