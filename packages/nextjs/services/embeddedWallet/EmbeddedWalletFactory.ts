import { EmbeddedWalletConfig, EmbeddedWalletProvider } from "~~/scaffold.config";
import { NoneProvider } from "./providers/NoneProvider";
import { IEmbeddedWalletProvider } from "./types";

/**
 * Factory for creating embedded wallet provider instances
 *
 * This uses the singleton pattern to ensure only one provider instance exists.
 * The provider is determined by the embeddedWalletConfig.provider setting.
 *
 * Usage:
 * ```ts
 * const provider = EmbeddedWalletFactory.createProvider(embeddedWalletConfig);
 * await provider.initialize();
 * ```
 */
export class EmbeddedWalletFactory {
  private static instance: IEmbeddedWalletProvider | null = null;

  /**
   * Create or return existing provider instance
   *
   * @param config - Embedded wallet configuration from scaffold.config.ts
   * @returns Provider instance
   * @throws Error if provider type is not recognized or required dependencies are missing
   */
  static async createProvider(config: EmbeddedWalletConfig): Promise<IEmbeddedWalletProvider> {
    // Return existing instance if already created
    if (this.instance) {
      return this.instance;
    }

    const providerType: EmbeddedWalletProvider = config.provider;

    switch (providerType) {
      case "none":
        this.instance = new NoneProvider();
        break;

      case "privy":
        this.instance = await this.createPrivyProvider(config);
        break;

      case "web3auth":
        this.instance = await this.createWeb3AuthProvider(config);
        break;

      case "magic":
        this.instance = await this.createMagicProvider(config);
        break;

      case "dynamic":
        this.instance = await this.createDynamicProvider(config);
        break;

      default:
        throw new Error(`Unknown embedded wallet provider: ${providerType}`);
    }

    // Initialize the provider
    await this.instance.initialize();

    return this.instance;
  }

  /**
   * Get the current provider instance
   * @throws Error if provider hasn't been created yet
   */
  static getProvider(): IEmbeddedWalletProvider {
    if (!this.instance) {
      throw new Error("Embedded wallet provider not initialized. Call createProvider() first.");
    }
    return this.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Create Privy provider instance
   * Lazy loads the provider to avoid bundling if not used
   */
  private static async createPrivyProvider(config: EmbeddedWalletConfig): Promise<IEmbeddedWalletProvider> {
    if (!config.privy?.appId) {
      throw new Error(
        "Privy app ID not configured. Add privy.appId to embeddedWalletConfig in scaffold.config.ts",
      );
    }

    try {
      // Dynamic import to avoid bundling if not used
      const { PrivyProvider } = await import("./providers/PrivyProvider");
      return new PrivyProvider(config);
    } catch (error) {
      throw new Error(
        `Failed to load Privy provider. Make sure @privy-io/react-auth is installed: yarn add @privy-io/react-auth\n${error}`,
      );
    }
  }

  /**
   * Create Web3Auth provider instance
   * Lazy loads the provider to avoid bundling if not used
   */
  private static async createWeb3AuthProvider(config: EmbeddedWalletConfig): Promise<IEmbeddedWalletProvider> {
    if (!config.web3auth?.clientId) {
      throw new Error(
        "Web3Auth client ID not configured. Add web3auth.clientId to embeddedWalletConfig in scaffold.config.ts",
      );
    }

    try {
      // Dynamic import to avoid bundling if not used
      const { Web3AuthProvider } = await import("./providers/Web3AuthProvider");
      return new Web3AuthProvider(config);
    } catch (error) {
      throw new Error(
        `Failed to load Web3Auth provider. Make sure @web3auth/modal is installed: yarn add @web3auth/modal @web3auth/base @web3auth/ethereum-provider\n${error}`,
      );
    }
  }

  /**
   * Create Magic provider instance
   * Lazy loads the provider to avoid bundling if not used
   */
  private static async createMagicProvider(config: EmbeddedWalletConfig): Promise<IEmbeddedWalletProvider> {
    if (!config.magic?.apiKey) {
      throw new Error("Magic API key not configured. Add magic.apiKey to embeddedWalletConfig in scaffold.config.ts");
    }

    try {
      // Dynamic import to avoid bundling if not used
      const { MagicProvider } = await import("./providers/MagicProvider");
      return new MagicProvider(config);
    } catch (error) {
      throw new Error(`Failed to load Magic provider. Make sure magic-sdk is installed: yarn add magic-sdk\n${error}`);
    }
  }

  /**
   * Create Dynamic provider instance
   * Lazy loads the provider to avoid bundling if not used
   */
  private static async createDynamicProvider(config: EmbeddedWalletConfig): Promise<IEmbeddedWalletProvider> {
    if (!config.dynamic?.environmentId) {
      throw new Error(
        "Dynamic environment ID not configured. Add dynamic.environmentId to embeddedWalletConfig in scaffold.config.ts",
      );
    }

    try {
      // Dynamic import to avoid bundling if not used
      const { DynamicProvider } = await import("./providers/DynamicProvider");
      return new DynamicProvider(config);
    } catch (error) {
      throw new Error(
        `Failed to load Dynamic provider. Make sure @dynamic-labs/sdk-react-core is installed: yarn add @dynamic-labs/sdk-react-core\n${error}`,
      );
    }
  }
}
