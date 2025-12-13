# Wallet Connection Provider System

Choose how users connect their wallets to your Scaffold-DOT app. Switch between traditional wallet connectors (MetaMask, WalletConnect) or embedded wallets (email/social login) by changing one line of config.

## Overview

The wallet provider system provides a **unified configuration** for choosing your wallet connection strategy. All providers work with custom EVM chains, including Polkadot Asset Hub.

**Key Features:**
- 🔌 **Pluggable Architecture** - Switch providers by changing one line of config
- 🎯 **Unified Configuration** - Single place to configure wallet connection
- 🚀 **Works with Custom Chains** - No special infrastructure required
- 📦 **Tree-shakeable** - Only bundles the provider you use
- 🛠️ **Developer Friendly** - Minimal setup, maximum flexibility
- 🔋 **Batteries Included** - All providers pre-installed and ready to use

## Supported Providers

### Traditional Wallet Connectors

Connect to external wallets like MetaMask, Coinbase Wallet, WalletConnect, etc.

| Provider | Status | Best For | Docs |
|----------|--------|----------|------|
| **AppKit** (Default) | ✅ Pre-configured | WalletConnect v2 + custom connectors | [reown.com/appkit](https://reown.com/appkit) |
| **RainbowKit** | ✅ Pre-installed | Popular wallet connection library | [rainbowkit.com](https://rainbowkit.com) |

### Embedded Wallet Providers

Create wallets via email/social login - no external wallet needed.

| Provider | Status | Free Tier | Best For | Docs |
|----------|--------|-----------|----------|------|
| **Privy** | ✅ Pre-installed | 1,000 MAU | Best UX, React-first | [privy.io](https://privy.io) |
| **Web3Auth** | ✅ Pre-installed | 1,000 MAW | Most flexible, MPC | [web3auth.io](https://web3auth.io) |
| **Magic** | ✅ Pre-installed | 100 MAU | Simple email login | [magic.link](https://magic.link) |
| **Dynamic** | ✅ Pre-installed | 1,000 MAU | Multi-chain apps | [dynamic.xyz](https://dynamic.xyz) |

## Quick Start

### Option A: Traditional Wallet Connectors (Default - Already Configured!)

**AppKit** is pre-configured and ready to use. No setup needed!

To switch to **RainbowKit**:

Edit `packages/nextjs/scaffold.config.ts`:
```typescript
export const embeddedWalletConfig = {
  provider: "rainbowkit", // Change from "appkit"
  // All other RainbowKit options are already configured with sensible defaults
};
```

Restart dev server - that's it!

### Option B: Embedded Wallet Providers (Email/Social Login)

All embedded wallet providers are **already installed**. Just configure and use!

**Example: Using Privy**

1. Edit `packages/nextjs/scaffold.config.ts`:
   ```typescript
   export const embeddedWalletConfig = {
     provider: "privy", // Change from "appkit"
     // All Privy options are already configured with sensible defaults
   };
   ```

2. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
   ```
   Get your app ID at [dashboard.privy.io](https://dashboard.privy.io)

3. Restart dev server - ready to go!

**Same pattern for other providers:**
- **Web3Auth**: Set `provider: "web3auth"` + add `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`
- **Magic**: Set `provider: "magic"` + add `NEXT_PUBLIC_MAGIC_API_KEY`
- **Dynamic**: Set `provider: "dynamic"` + add `NEXT_PUBLIC_DYNAMIC_ENV_ID`

See `.env.example` for all environment variable templates.

## Configuration

**ALL provider configuration happens in one place:** `packages/nextjs/scaffold.config.ts`

Each provider has its own configuration section with sensible defaults already set. You can customize any option by modifying the config object.

### Theme Inheritance

**All wallet providers automatically inherit and sync with your app's theme!**

When users toggle between light/dark mode in your app, wallet modals automatically update to match. No configuration needed.

**Providers with auto-sync:**
- ✅ **AppKit** - Real-time sync when theme changes
- ✅ **RainbowKit** - Real-time sync when theme changes
- ✅ **Privy** - Syncs when modal opens
- ✅ **Dynamic** - Syncs when modal opens
- ⚠️ **Web3Auth** - Static theme (set at initialization)
- ➖ **Magic** - No theme configuration needed

**To override auto-sync** (use static theme):
```typescript
export const embeddedWalletConfig = {
  provider: "privy",

  privy: {
    appearance: {
      theme: "dark", // Always dark, ignores app theme toggle
    },
  },
};
```

### Example: Customizing AppKit Colors (theme auto-syncs)

```typescript
export const embeddedWalletConfig = {
  provider: "appkit",

  appkit: {
    // Theme auto-syncs with app - no need to set themeMode!
    themeVariables: {
      "--w3m-accent": "#ff0000", // Custom red accent color
      "--w3m-border-radius-master": "16px", // More rounded corners
    },
  },
};
```

### Example: Customizing RainbowKit (theme auto-syncs)

```typescript
export const embeddedWalletConfig = {
  provider: "rainbowkit",

  rainbowkit: {
    // Theme auto-syncs with app automatically!
    modalSize: "wide", // Larger modal
    coolMode: true, // Enable confetti on connect!
    showRecentTransactions: true,
  },
};
```

### Example: Customizing Privy Login Methods (theme auto-syncs)

```typescript
export const embeddedWalletConfig = {
  provider: "privy",

  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
    loginMethods: ["email", "google", "twitter"], // Only these methods
    appearance: {
      // Theme auto-syncs with app - no need to set theme!
      accentColor: "#00ff00", // Green accent
    },
    embeddedWallets: {
      createOnLogin: "all-users", // Create wallet for everyone
    },
  },
};
```

See the full `embeddedWalletConfig` object in `scaffold.config.ts` for all available options and their defaults.

### 4. Use in Your App

```typescript
import { useEmbeddedWallet } from "~~/hooks/scaffold-eth";

function MyComponent() {
  const { isAuthenticated, user, address, login, logout } = useEmbeddedWallet();

  if (!isAuthenticated) {
    return <button onClick={login}>Login with Email/Social</button>;
  }

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Address: {address}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Provider Setup Guides

### Privy (Recommended)

**Why Privy?**
- Beautiful pre-built UI
- Best React integration
- Works with any custom chain
- Excellent documentation

**Setup:**

1. Create account at [dashboard.privy.io](https://dashboard.privy.io)
2. Create a new app
3. Copy your App ID
4. Configure in `scaffold.config.ts`:

```typescript
export const embeddedWalletConfig = {
  provider: "privy",
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
  },
};
```

5. Add to `.env.local`:
```bash
NEXT_PUBLIC_PRIVY_APP_ID=clxxx...
```

6. Install package:
```bash
yarn add @privy-io/react-auth
```

### Web3Auth

**Why Web3Auth?**
- Most customizable
- MPC (Multi-Party Computation) security
- Framework agnostic
- Advanced features

**Setup:**

1. Create account at [dashboard.web3auth.io](https://dashboard.web3auth.io)
2. Create a new project
3. Get your Client ID
4. Configure in `scaffold.config.ts`:

```typescript
export const embeddedWalletConfig = {
  provider: "web3auth",
  web3auth: {
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "",
    web3AuthNetwork: "sapphire_devnet", // or "sapphire_mainnet"
  },
};
```

5. Add to `.env.local`:
```bash
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BPi5...
```

6. Install packages:
```bash
yarn add @web3auth/modal @web3auth/base @web3auth/ethereum-provider
```

### Magic

**Why Magic?**
- Simplest setup
- Passwordless email login
- Clean API

**Setup:**

1. Create account at [dashboard.magic.link](https://dashboard.magic.link)
2. Create a new app
3. Copy your Publishable API Key
4. Configure in `scaffold.config.ts`:

```typescript
export const embeddedWalletConfig = {
  provider: "magic",
  magic: {
    apiKey: process.env.NEXT_PUBLIC_MAGIC_API_KEY || "",
  },
};
```

5. Add to `.env.local`:
```bash
NEXT_PUBLIC_MAGIC_API_KEY=pk_live_...
```

6. Install package:
```bash
yarn add magic-sdk
```

### Dynamic

**Why Dynamic?**
- Multi-chain support (EVM, Solana, Cosmos)
- Beautiful UI
- Advanced features

**Setup:**

1. Create account at [app.dynamic.xyz](https://app.dynamic.xyz)
2. Create a new project
3. Copy your Environment ID
4. Configure in `scaffold.config.ts`:

```typescript
export const embeddedWalletConfig = {
  provider: "dynamic",
  dynamic: {
    environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "",
  },
};
```

5. Add to `.env.local`:
```bash
NEXT_PUBLIC_DYNAMIC_ENV_ID=xxx...
```

6. Install package:
```bash
yarn add @dynamic-labs/sdk-react-core
```

## API Reference

### `useEmbeddedWallet()`

Hook for accessing embedded wallet functionality.

```typescript
const {
  user,           // EmbeddedWalletUser | null
  address,        // Address | null
  isAuthenticated,// boolean
  isLoading,      // boolean
  login,          // () => Promise<void>
  logout,         // () => Promise<void>
} = useEmbeddedWallet();
```

**EmbeddedWalletUser:**
```typescript
interface EmbeddedWalletUser {
  id: string;
  email?: string;
  phone?: string;
  socialProvider?: "google" | "apple" | "twitter" | "discord" | "github";
  walletAddress: Address;
  createdAt?: Date;
}
```

## How It Works

### Architecture

```
┌─────────────────────────────────────┐
│   Your Components                   │
│   (use useEmbeddedWallet hook)      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   EmbeddedWalletProvider            │
│   (React Context)                   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   EmbeddedWalletFactory             │
│   (Creates appropriate provider)    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   IEmbeddedWalletProvider           │
│   (Interface)                       │
└─────────────┬───────────────────────┘
              │
    ┌─────────┼──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ Privy  │ │Web3  │ │Magic │ │Dyna  │
│Provider│ │Auth  │ │      │ │mic   │
└────────┘ └──────┘ └──────┘ └──────┘
```

### Provider Implementations

Each provider implements the `IEmbeddedWalletProvider` interface:

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
  onAuthStateChange(callback): () => void;
}
```

### Adding a New Provider

To add support for a new provider:

1. Create `services/embeddedWallet/providers/YourProvider.ts`
2. Implement the `IEmbeddedWalletProvider` interface
3. Add case in `EmbeddedWalletFactory.ts`
4. Add type in `scaffold.config.ts`

Example:

```typescript
// services/embeddedWallet/providers/YourProvider.ts
import { IEmbeddedWalletProvider, EmbeddedWalletUser } from "../types";

export class YourProvider implements IEmbeddedWalletProvider {
  async initialize() {
    // Initialize your provider
  }

  async login() {
    // Trigger login flow
  }

  getUser() {
    // Return normalized user
    return {
      id: "...",
      email: "...",
      walletAddress: "0x...",
    };
  }

  // ... implement other methods
}
```

## Troubleshooting

### "Failed to load provider" Error

Make sure you've installed the required package:

```bash
# Check package.json
yarn list @privy-io/react-auth
# or
yarn list @web3auth/modal
# etc.
```

### Provider Not Found

The factory uses dynamic imports. Make sure your `next.config.ts` allows dynamic imports:

```typescript
webpack: (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    // Allow dynamic imports
  };
  return config;
}
```

### Environment Variables Not Working

- Make sure `.env.local` exists and contains the correct variables
- Restart dev server after changing `.env.local`
- Verify variable names start with `NEXT_PUBLIC_`

### Custom Chain Not Supported

All providers in this system support custom EVM chains. Just configure your chains in `scaffold.config.ts`:

```typescript
export const scaffoldConfig = {
  targetNetworks: [passetHub, localNode], // Your custom chains
  // ...
};
```

The embedded wallet provider will automatically use these chains.

## FAQs

### Q: Which provider should I use?

**A:** For Polkadot Asset Hub (custom chains):
- **Privy** - Best overall choice
- **Web3Auth** - If you need more customization

### Q: Do I need to modify my existing code?

**A:** No! Just configure the provider in `scaffold.config.ts` and components using `useEmbeddedWallet()` work the same regardless of provider.

### Q: Can I use multiple providers?

**A:** Not simultaneously, but you can easily switch between them by changing the config.

### Q: Will this work with my custom chain?

**A:** Yes! Unlike Reown AppKit's account abstraction (which requires ERC-4337 infrastructure), these providers create regular EOA wallets that work on any EVM chain.

### Q: What's the difference between this and Reown AppKit social login?

**A:**
- **Reown AppKit**: Smart contract wallets (ERC-4337), requires chain-specific bundler infrastructure
- **Embedded Wallets**: Regular EOA wallets, works on any EVM chain immediately

### Q: How do I disable embedded wallets?

**A:** Set `provider: "none"` in `embeddedWalletConfig`. The system will gracefully handle this.

## Examples

### Login Button

```typescript
import { useEmbeddedWallet } from "~~/hooks/scaffold-eth";

export const LoginButton = () => {
  const { isAuthenticated, login, logout, user } = useEmbeddedWallet();

  if (isAuthenticated) {
    return (
      <div>
        <span>Welcome {user?.email}</span>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <button onClick={login}>
      Login with Email/Social
    </button>
  );
};
```

### Conditional Rendering

```typescript
export const MyPage = () => {
  const { isAuthenticated, isLoading } = useEmbeddedWallet();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <AuthenticatedContent />;
};
```

### Using with Wagmi

```typescript
import { useEmbeddedWallet } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

export const WalletInfo = () => {
  const embeddedWallet = useEmbeddedWallet();
  const wagmiAccount = useAccount();

  // User can be connected via embedded wallet OR traditional wallet
  const address = embeddedWallet.address || wagmiAccount.address;
  const isConnected = embeddedWallet.isAuthenticated || wagmiAccount.isConnected;

  return (
    <div>
      {isConnected ? (
        <span>Connected: {address}</span>
      ) : (
        <div>
          <button onClick={embeddedWallet.login}>Email/Social Login</button>
          {/* OR */}
          <ConnectButton /> {/* Traditional wallet */}
        </div>
      )}
    </div>
  );
};
```

## Resources

- **Privy Docs**: https://docs.privy.io
- **Web3Auth Docs**: https://web3auth.io/docs
- **Magic Docs**: https://magic.link/docs
- **Dynamic Docs**: https://docs.dynamic.xyz

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Verify your provider's documentation
3. Check Scaffold-DOT discussions
4. Open an issue on GitHub
