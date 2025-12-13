import { Address } from "viem";
import { EmbeddedWalletConfig } from "~~/scaffold.config";
import { EmbeddedWalletUser, IEmbeddedWalletProvider } from "../types";

/**
 * Privy embedded wallet provider
 *
 * Note: Privy requires wrapping your app with PrivyProvider at the React level.
 * This is handled automatically in ScaffoldEthAppWithProviders when provider is set to "privy".
 *
 * @see https://docs.privy.io for complete documentation
 */
export class PrivyProvider implements IEmbeddedWalletProvider {
  private privyClient: any = null;
  private listeners: Array<(user: EmbeddedWalletUser | null) => void> = [];
  private ready = false;

  constructor(private config: EmbeddedWalletConfig) {
    if (!config.privy?.appId) {
      throw new Error("Privy app ID is required");
    }
  }

  async initialize(): Promise<void> {
    // Privy initialization is handled by React Provider
    // This is just a marker that we're ready
    this.ready = true;
  }

  async login(): Promise<void> {
    // Privy login must be triggered through their hooks
    // This will be called from React components using usePrivy
    throw new Error(
      "Privy login should be triggered using the usePrivy hook. " +
        "Use <PrivyProvider> wrapper and call login() from usePrivy hook in your components.",
    );
  }

  async logout(): Promise<void> {
    throw new Error("Privy logout should be triggered using the usePrivy hook.");
  }

  getUser(): EmbeddedWalletUser | null {
    // User state is managed by Privy's React context
    // Components should use usePrivy hook directly
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
    throw new Error("Use Privy's useSwitchChain hook for chain switching");
  }

  onAuthStateChange(callback: (user: EmbeddedWalletUser | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
}

/**
 * Note for developers using Privy:
 *
 * Privy works differently from other providers - it uses React Context.
 * When using Privy, you should:
 *
 * 1. The PrivyProvider wrapper is automatically added in ScaffoldEthAppWithProviders
 * 2. Use Privy's hooks directly in your components:
 *
 * ```tsx
 * import { usePrivy } from "@privy-io/react-auth";
 *
 * function MyComponent() {
 *   const { login, logout, authenticated, user } = usePrivy();
 *
 *   if (!authenticated) {
 *     return <button onClick={login}>Login</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Email: {user?.email?.address}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * For more information, see: https://docs.privy.io/guide/react/users/login
 */
