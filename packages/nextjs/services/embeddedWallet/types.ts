import { Address } from "viem";

/**
 * Normalized user object regardless of provider
 * All providers must transform their user data to this format
 */
export interface EmbeddedWalletUser {
  id: string;
  email?: string;
  phone?: string;
  socialProvider?: "google" | "apple" | "twitter" | "discord" | "github";
  walletAddress: Address;
  createdAt?: Date;
}

/**
 * Authentication state returned by useEmbeddedWallet hook
 */
export interface EmbeddedWalletAuthState {
  user: EmbeddedWalletUser | null;
  address: Address | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Provider interface that all embedded wallet providers must implement
 *
 * This abstraction allows switching between different providers (Privy, Web3Auth, Magic, etc.)
 * without changing application code.
 */
export interface IEmbeddedWalletProvider {
  /**
   * Initialize the provider
   * Called once when the app starts
   */
  initialize(): Promise<void>;

  /**
   * Trigger login flow
   * Opens modal/UI for user to authenticate
   */
  login(): Promise<void>;

  /**
   * Logout the current user
   */
  logout(): Promise<void>;

  /**
   * Get the currently authenticated user
   * Returns null if not authenticated
   */
  getUser(): EmbeddedWalletUser | null;

  /**
   * Get the user's wallet address
   * Returns null if not authenticated
   */
  getAddress(): Address | null;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Check if provider is currently loading/initializing
   */
  isLoading(): boolean;

  /**
   * Get the Web3 provider for signing transactions
   * This should be compatible with viem/wagmi
   */
  getProvider(): any;

  /**
   * Switch to a different chain
   * @param chainId - The chain ID to switch to
   */
  switchChain(chainId: number): Promise<void>;

  /**
   * Subscribe to authentication state changes
   * @param callback - Function called when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback: (user: EmbeddedWalletUser | null) => void): () => void;
}
