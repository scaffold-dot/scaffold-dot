import { useEffect, useState } from "react";
import { useEmbeddedWalletProvider } from "~~/services/embeddedWallet/EmbeddedWalletContext";
import { EmbeddedWalletAuthState, EmbeddedWalletUser } from "~~/services/embeddedWallet/types";

/**
 * Provider-agnostic hook for embedded wallet functionality
 *
 * This hook works the same regardless of which provider is configured
 * (Privy, Web3Auth, Magic, Dynamic, or None).
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, user, address, login, logout } = useEmbeddedWallet();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={login}>Login with Email/Social</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Logged in as: {user?.email}</p>
 *       <p>Address: {address}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useEmbeddedWallet = (): EmbeddedWalletAuthState => {
  const provider = useEmbeddedWalletProvider();
  const [user, setUser] = useState<EmbeddedWalletUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!provider) {
      setIsLoading(false);
      return;
    }

    // Initial state
    setUser(provider.getUser());
    setIsLoading(provider.isLoading());

    // Subscribe to auth state changes
    const unsubscribe = provider.onAuthStateChange(newUser => {
      setUser(newUser);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [provider]);

  return {
    user,
    address: provider?.getAddress() ?? null,
    isAuthenticated: provider?.isAuthenticated() ?? false,
    isLoading,
    login: async () => {
      if (provider) {
        await provider.login();
      }
    },
    logout: async () => {
      if (provider) {
        await provider.logout();
      }
    },
  };
};
