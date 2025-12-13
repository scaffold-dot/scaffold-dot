import { Address } from "viem";
import { EmbeddedWalletConfig } from "~~/scaffold.config";
import { EmbeddedWalletUser, IEmbeddedWalletProvider } from "../types";

/**
 * Dynamic embedded wallet provider
 *
 * Dynamic provides multi-chain wallet support with social login.
 * Works with any custom EVM chain and supports multiple authentication methods.
 *
 * Note: Dynamic requires wrapping your app with DynamicContextProvider at the React level.
 * This is handled automatically in ScaffoldEthAppWithProviders when provider is set to "dynamic".
 *
 * @see https://docs.dynamic.xyz for complete documentation
 */
export class DynamicProvider implements IEmbeddedWalletProvider {
  private dynamicClient: any = null;
  private listeners: Array<(user: EmbeddedWalletUser | null) => void> = [];
  private ready = false;

  constructor(private config: EmbeddedWalletConfig) {
    if (!config.dynamic?.environmentId) {
      throw new Error("Dynamic environment ID is required");
    }
  }

  async initialize(): Promise<void> {
    // Dynamic initialization is handled by React Provider
    // This is just a marker that we're ready
    this.ready = true;
  }

  async login(): Promise<void> {
    // Dynamic login must be triggered through their hooks
    // This will be called from React components using useDynamicContext
    throw new Error(
      "Dynamic login should be triggered using the useDynamicContext hook. " +
        "Use <DynamicContextProvider> wrapper and call setShowAuthFlow(true) from useDynamicContext hook in your components.",
    );
  }

  async logout(): Promise<void> {
    throw new Error("Dynamic logout should be triggered using the useDynamicContext hook.");
  }

  getUser(): EmbeddedWalletUser | null {
    // User state is managed by Dynamic's React context
    // Components should use useDynamicContext hook directly
    return null;
  }

  getAddress(): Address | null {
    return null;
  }

  isAuthenticated(): boolean {
    return false;
  }

  isLoading(): boolean {
    return !this.ready;
  }

  getProvider(): any {
    return null;
  }

  async switchChain(_chainId: number): Promise<void> {
    throw new Error("Use Dynamic's useSwitchNetwork hook for chain switching");
  }

  onAuthStateChange(callback: (user: EmbeddedWalletUser | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
}

/**
 * Note for developers using Dynamic:
 *
 * Dynamic works differently from other providers - it uses React Context.
 * When using Dynamic, you should:
 *
 * 1. The DynamicContextProvider wrapper is automatically added in ScaffoldEthAppWithProviders
 * 2. Use Dynamic's hooks directly in your components:
 *
 * ```tsx
 * import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
 *
 * function MyComponent() {
 *   const { setShowAuthFlow, primaryWallet, user, handleLogOut } = useDynamicContext();
 *
 *   if (!user) {
 *     return <button onClick={() => setShowAuthFlow(true)}>Connect Wallet</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Email: {user.email}</p>
 *       <p>Wallet: {primaryWallet?.address}</p>
 *       <button onClick={handleLogOut}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * For more information, see: https://docs.dynamic.xyz/quickstart
 */
