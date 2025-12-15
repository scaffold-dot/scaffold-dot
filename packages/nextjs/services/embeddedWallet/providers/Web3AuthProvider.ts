import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { Address } from "viem";
import scaffoldConfig, { EmbeddedWalletConfig } from "~~/scaffold.config";
import { EmbeddedWalletUser, IEmbeddedWalletProvider } from "../types";

/**
 * Web3Auth embedded wallet provider
 *
 * Web3Auth provides social login with MPC (Multi-Party Computation) security.
 * It works with any custom EVM chain and supports multiple authentication methods.
 *
 * @see https://web3auth.io/docs for complete documentation
 */
export class Web3AuthProvider implements IEmbeddedWalletProvider {
  private web3auth: Web3Auth | null = null;
  private listeners: Array<(user: EmbeddedWalletUser | null) => void> = [];
  private isInitializing = true;

  constructor(private config: EmbeddedWalletConfig) {
    if (!config.web3auth?.clientId) {
      throw new Error("Web3Auth client ID is required");
    }
  }

  async initialize(): Promise<void> {
    const chainConfig = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: `0x${scaffoldConfig.targetNetworks[0].id.toString(16)}`,
      rpcTarget: scaffoldConfig.targetNetworks[0].rpcUrls.default.http[0],
      displayName: scaffoldConfig.targetNetworks[0].name,
      blockExplorerUrl: scaffoldConfig.targetNetworks[0].blockExplorers?.default?.url || "",
      ticker: scaffoldConfig.targetNetworks[0].nativeCurrency.symbol,
      tickerName: scaffoldConfig.targetNetworks[0].nativeCurrency.name,
      decimals: scaffoldConfig.targetNetworks[0].nativeCurrency.decimals,
    };

    const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

    const web3authConfig = this.config.web3auth!;

    this.web3auth = new Web3Auth({
      clientId: web3authConfig.clientId,
      web3AuthNetwork: (web3authConfig.web3AuthNetwork || "sapphire_devnet") as WEB3AUTH_NETWORK,
      privateKeyProvider,
      chainConfig,
      uiConfig: {
        mode: web3authConfig.uiMode || "dark",
        ...(web3authConfig.loginConfig && { loginConfig: web3authConfig.loginConfig }),
      },
    });

    await this.web3auth.initModal();
    this.isInitializing = false;

    // Check if already connected
    if (this.web3auth.connected) {
      this.notifyListeners(await this.getUserInfo());
    }
  }

  async login(): Promise<void> {
    if (!this.web3auth) {
      throw new Error("Web3Auth not initialized");
    }

    try {
      const web3authProvider = await this.web3auth.connect();

      if (web3authProvider) {
        const user = await this.getUserInfo();
        this.notifyListeners(user);
      }
    } catch (error: any) {
      // User closed the modal - this is not an error, just ignore it
      if (error?.message?.includes("User closed the modal")) {
        console.log("User cancelled Web3Auth login");
        return;
      }
      // Re-throw other errors
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (!this.web3auth) {
      throw new Error("Web3Auth not initialized");
    }

    await this.web3auth.logout();
    this.notifyListeners(null);
  }

  getUser(): EmbeddedWalletUser | null {
    if (!this.web3auth?.connected) {
      return null;
    }

    // This is sync, so we can't get full user info here
    // Components should use onAuthStateChange for full user data
    return null;
  }

  getAddress(): Address | null {
    if (!this.web3auth?.connected || !this.web3auth.provider) {
      return null;
    }

    // Get address from provider
    // This is a simplified version - in practice, you'd get this from the provider
    return null;
  }

  isAuthenticated(): boolean {
    return this.web3auth?.connected ?? false;
  }

  isLoading(): boolean {
    return this.isInitializing;
  }

  getProvider(): any {
    return this.web3auth?.provider ?? null;
  }

  async switchChain(chainId: number): Promise<void> {
    if (!this.web3auth?.provider) {
      throw new Error("Not connected");
    }

    // Find the target chain
    const targetChain = scaffoldConfig.targetNetworks.find(chain => chain.id === chainId);
    if (!targetChain) {
      throw new Error(`Chain ${chainId} not found in targetNetworks`);
    }

    // Web3Auth chain switching would need to reinitialize with new chain config
    // This is a limitation of Web3Auth - it's designed for single-chain apps
    throw new Error("Web3Auth does not support runtime chain switching. Configure targetNetworks with your desired chain.");
  }

  onAuthStateChange(callback: (user: EmbeddedWalletUser | null) => void): () => void {
    this.listeners.push(callback);

    // Call immediately with current state
    if (this.web3auth?.connected) {
      this.getUserInfo().then(callback);
    } else {
      callback(null);
    }

    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private async getUserInfo(): Promise<EmbeddedWalletUser | null> {
    if (!this.web3auth?.connected) {
      return null;
    }

    const userInfo = await this.web3auth.getUserInfo();
    const accounts = await this.web3auth.provider?.request({ method: "eth_accounts" }) as string[];

    return {
      id: userInfo.verifierId,
      email: userInfo.email,
      socialProvider: this.mapSocialProvider(userInfo.typeOfLogin),
      walletAddress: accounts?.[0] as Address,
      createdAt: new Date(),
    };
  }

  private mapSocialProvider(typeOfLogin: string): "google" | "apple" | "twitter" | "discord" | "github" | undefined {
    const mapping: Record<string, "google" | "apple" | "twitter" | "discord" | "github"> = {
      google: "google",
      apple: "apple",
      twitter: "twitter",
      discord: "discord",
      github: "github",
    };
    return mapping[typeOfLogin];
  }

  private notifyListeners(user: EmbeddedWalletUser | null) {
    this.listeners.forEach(cb => cb(user));
  }
}
