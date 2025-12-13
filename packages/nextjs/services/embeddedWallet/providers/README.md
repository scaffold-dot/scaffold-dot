# Embedded Wallet Provider Implementations

This directory contains provider-specific implementations that wrap external libraries (Privy, Web3Auth, Magic, Dynamic) to conform to the `IEmbeddedWalletProvider` interface.

## Provider Status

| Provider | Status | Package Included |
|----------|--------|------------------|
| NoneProvider | ✅ Implemented | None (built-in) |
| PrivyProvider | ✅ Implemented | @privy-io/react-auth ^1.97.0 |
| Web3AuthProvider | ✅ Implemented | @web3auth/modal ^9.5.0 |
| MagicProvider | ✅ Implemented | magic-sdk ^28.15.0 |
| DynamicProvider | ✅ Implemented | @dynamic-labs/sdk-react-core ^3.4.3 |

## Quick Start

All provider implementations are **already included** in this project! To use a provider:

1. **Choose your provider** in `scaffold.config.ts`:
   ```typescript
   export const embeddedWalletConfig = {
     provider: "privy", // or "web3auth", "magic", "dynamic", "none"
     // ...
   };
   ```

2. **Add environment variables** to `.env.local` (see `.env.example`):
   ```bash
   # For Privy
   NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here

   # For Web3Auth
   NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_client_id_here

   # For Magic
   NEXT_PUBLIC_MAGIC_API_KEY=your_api_key_here

   # For Dynamic
   NEXT_PUBLIC_DYNAMIC_ENV_ID=your_environment_id_here
   ```

3. **Restart dev server** - that's it!

The factory will dynamically import your provider and the React wrapper (if needed) is automatically added.

## Why All Implementations Are Included

This project includes **batteries-included** provider implementations so developers can:

1. **Switch providers instantly** - Just change config and environment variables
2. **Try different providers** - No need to implement anything to test
3. **Use production-ready code** - All providers are fully implemented and tested
4. **Tree-shaking still works** - Dynamic imports ensure only your chosen provider is bundled

### Required Interface

All providers must implement:

```typescript
interface IEmbeddedWalletProvider {
  initialize(): Promise<void>;
  login(): Promise<void>;
  logout(): Promise<void>;
  getUser(): EmbeddedWalletUser | null;
  getAddress(): Address | null;
  isAuthenticated(): boolean;
  isLoading(): boolean;
  getProvider(): any;
  switchChain(chainId: number): Promise<void>;
  onAuthStateChange(callback: (user: EmbeddedWalletUser | null) => void): () => void;
}
```

### Template

Use this template to create a new provider:

```typescript
import { Address } from "viem";
import { IEmbeddedWalletProvider, EmbeddedWalletUser } from "../types";
import { EmbeddedWalletConfig } from "~~/scaffold.config";

export class YourProvider implements IEmbeddedWalletProvider {
  private isReady = false;
  private currentUser: EmbeddedWalletUser | null = null;
  private listeners: Array<(user: EmbeddedWalletUser | null) => void> = [];

  constructor(private config: EmbeddedWalletConfig) {}

  async initialize(): Promise<void> {
    // Initialize your provider SDK
    this.isReady = true;
  }

  async login(): Promise<void> {
    // Trigger login flow
  }

  async logout(): Promise<void> {
    // Logout user
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
    return !this.isReady;
  }

  getProvider(): any {
    // Return Web3 provider compatible object
    return null;
  }

  async switchChain(chainId: number): Promise<void> {
    // Switch to different chain
  }

  onAuthStateChange(callback: (user: EmbeddedWalletUser | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(user: EmbeddedWalletUser | null) {
    this.listeners.forEach(cb => cb(user));
  }
}
```

## Need Help?

See implementation examples in the [main README](../README.md) or check the provider's official documentation:

- [Privy Docs](https://docs.privy.io)
- [Web3Auth Docs](https://web3auth.io/docs)
- [Magic Docs](https://magic.link/docs)
- [Dynamic Docs](https://docs.dynamic.xyz)
