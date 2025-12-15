import * as chains from "viem/chains";
import { defineChain } from "viem";

// Define Paseo Passet Hub chain, not included in viem/chains
export const localNode = defineChain({
  id: 420420420,
  name: "Local Asset Hub",
  nativeCurrency: {
    decimals: 18,
    name: "Local DOT",
    symbol: "MINI",
  },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout.com",
    },
  },
  testnet: false,
  // Custom fee configuration for pallet-revive's fixed fee model
  // Polkadot revive requires: gas × gasPrice ≥ ~22-25 billion wei total
  fees: {
    estimateFeesPerGas: async () => {
      // With typical gas limit of 1M: 25,000,000,000 / 1,000,000 = 25,000 per gas
      return {
        maxFeePerGas: 25000000n, // 25M per gas unit = 25B total
        maxPriorityFeePerGas: 1000000n, // 1M tip
      };
    },
  },
});

// Define Paseo Passet Hub chain, not included in viem/chains
export const passetHub = defineChain({
  id: 420420422,
  name: "Passet Hub",
  nativeCurrency: {
    decimals: 18,
    name: "Paseo DOT",
    symbol: "PAS",
  },
  rpcUrls: {
    default: { http: ["https://testnet-passet-hub-eth-rpc.polkadot.io"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-passet-hub.parity-testnet.parity.io",
    },
  },
  testnet: true,
  // Custom fee configuration for pallet-revive's fixed fee model
  fees: {
    estimateFeesPerGas: async () => {
      return {
        maxFeePerGas: 25000000n, // 25M per gas unit = 25B total with 1M gas limit
        maxPriorityFeePerGas: 1000000n, // 1M tip
      };
    },
  },
});


// Define Kusama Hub chain, not included in viem/chains
export const kusamaHub = defineChain({
  id: 420420418,
  name: "Kusama Hub",
  nativeCurrency: {
    decimals: 18,
    name: "Kusama",
    symbol: "KSM",
  },
  rpcUrls: {
    default: { http: ["https://kusama-asset-hub-eth-rpc.polkadot.io"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://blockscout-kusama-asset-hub.parity-chains-scw.parity.io/",
    },
  },
  testnet: false,
});

// Custom gas configuration for localNode
// Note: Polkadot revive uses a fixed fee model (~22,008,157,000 wei)
// The minimum gasPrice per unit = fixed_fee / gasLimit = 22,008,157,000 / 1,000,000 = 22,008.157
// We need to ensure effective gas price meets this minimum
export const LOCAL_CHAIN_GAS_CONFIG = {
  gasLimit: 1000000n,
  gasPrice: 22100000n, // ~22.1M per gas unit to cover fixed fee of ~22B total
} as const;

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

/**
 * Wallet Connection Provider Configuration
 * Choose how users connect their wallets to your dApp
 */
export type WalletProvider = "appkit" | "rainbowkit" | "privy" | "web3auth" | "none";

// Backwards compatibility
export type EmbeddedWalletProvider = WalletProvider;

export type EmbeddedWalletConfig = {
  // Which provider to use
  provider: WalletProvider;

  // Provider-specific configuration (only the active provider's config is used)
  appkit?: {
    // Optional: Override WalletConnect project ID (uses walletConnectProjectId from scaffoldConfig if not provided)
    projectId?: string;
    // Features
    features?: {
      analytics?: boolean;
      email?: boolean;
      socials?: string[];
      emailShowWallets?: boolean;
      // Order of connection methods in modal: ['wallet', 'email', 'social']
      // Put email/social first to avoid scrolling
      connectMethodsOrder?: Array<"wallet" | "email" | "social">;
    };
    // Enable fullscreen modal on mobile for better UX
    enableMobileFullScreen?: boolean;
    // Theme customization
    // Note: themeMode auto-syncs with app theme by default. Set explicit value to override.
    themeMode?: "dark" | "light";
    themeVariables?: {
      "--w3m-font-family"?: string;
      "--w3m-accent"?: string;
      "--w3m-color-mix"?: string;
      "--w3m-color-mix-strength"?: number;
      "--w3m-border-radius-master"?: string;
    };
  };

  rainbowkit?: {
    // Optional: Override WalletConnect project ID
    projectId?: string;
    // Modal size
    modalSize?: "compact" | "wide";
    // Show recent transactions in modal
    showRecentTransactions?: boolean;
    // Enable cool mode (confetti on connect)
    coolMode?: boolean;
    // Initial chain (defaults to first in targetNetworks)
    initialChainId?: number;
    // Note: Theme auto-syncs with app theme by default (no override available)
  };

  privy?: {
    // Required: Privy app ID
    appId: string;
    // Login methods to enable
    loginMethods?: Array<"email" | "sms" | "wallet" | "google" | "twitter" | "discord" | "github" | "apple">;
    // Appearance customization
    appearance?: {
      // Note: theme auto-syncs with app theme by default. Set explicit value to override.
      theme?: "light" | "dark";
      accentColor?: string;
      logo?: string;
    };
    // Embedded wallet settings
    embeddedWallets?: {
      createOnLogin?: "off" | "users-without-wallets" | "all-users";
      requireUserPasswordOnCreate?: boolean;
    };
  };

  web3auth?: {
    // Required: Web3Auth client ID
    clientId: string;
    // Network (testnet vs production)
    web3AuthNetwork?: "sapphire_mainnet" | "sapphire_devnet" | "mainnet" | "testnet" | "cyan";
    // UI mode (static - set at initialization, does not auto-sync with app theme)
    uiMode?: "dark" | "light";
    // Login config
    loginConfig?: Record<string, any>;
  };

  // Common configuration shared across embedded wallet providers (not used for appkit/rainbowkit)
  common?: {
    socialLogins?: Array<"google" | "apple" | "twitter" | "discord" | "github">;
    emailLogin?: boolean;
    smsLogin?: boolean;
  };
};

export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [passetHub],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // If you want to use a different RPC for a specific network, you can add it here.
  // The key is the chain ID, and the value is the HTTP RPC URL
  rpcOverrides: {
    // Example:
    // [chains.mainnet.id]: "https://mainnet.buidlguidl.com",
    [passetHub.id]: "https://testnet-passet-hub-eth-rpc.polkadot.io",
  },

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

/**
 * Wallet Connection Provider Configuration
 *
 * Choose how users connect their wallets to your dApp.
 *
 * **Traditional Wallet Connectors** (MetaMask, Coinbase, etc.):
 * - "appkit": Reown AppKit (default) - WalletConnect v2 + custom connectors
 *   Also includes email + social login (Google, X, GitHub, Discord) with embedded wallets
 *   Note: Email/social login may have limitations with custom chains - testing on Passet Hub
 * - "rainbowkit": RainbowKit - Popular wallet connection library
 *
 * **Embedded Wallets** (Email/Social Login):
 * - "privy": https://privy.io - Best UX, supports custom chains
 * - "web3auth": https://web3auth.io - MPC security, most flexible
 *
 * - "none": No wallet connection UI
 *
 * To use embedded wallets:
 * 1. Set provider (e.g., "privy")
 * 2. Add provider's env variable to .env.local (see .env.example)
 * 3. Restart dev server
 */
export const embeddedWalletConfig: EmbeddedWalletConfig = {
  // Provider selection (default: "appkit")
  provider: "appkit" as WalletProvider,

  // ============================================================================
  // AppKit Configuration (Default provider - WalletConnect + custom connectors)
  // ============================================================================
  appkit: {
    // Optional: Override project ID (uses scaffoldConfig.walletConnectProjectId by default)
    // projectId: "your-custom-project-id",

    // Features configuration
    features: {
      analytics: false, // Disable analytics
      email: true, // Enable email login (OTP-based, non-custodial wallet)
      socials: ["google", "x", "github", "discord"], // Social login providers
      emailShowWallets: true, // Show wallet options alongside email/social
      connectMethodsOrder: ["email", "social", "wallet"], // Show email/social first (no scrolling needed)
    },

    // Enable fullscreen modal on mobile for better UX
    enableMobileFullScreen: true,

    // Theme mode: Auto-syncs with app theme by default
    // Uncomment to override with static theme:
    // themeMode: "dark",

    // Theme customization
    themeVariables: {
      "--w3m-font-family": "var(--font-unbounded), system-ui, sans-serif",
      "--w3m-accent": "#2299dd", // Primary blue color
      "--w3m-color-mix": "#2299dd",
      "--w3m-color-mix-strength": 10,
      "--w3m-border-radius-master": "8px",
    },
  },

  // ============================================================================
  // RainbowKit Configuration
  // ============================================================================
  rainbowkit: {
    // Optional: Override project ID (uses scaffoldConfig.walletConnectProjectId by default)
    // projectId: "your-custom-project-id",

    // Theme: Auto-syncs with app theme (no override option)

    // Modal size
    modalSize: "compact",

    // Show recent transactions
    showRecentTransactions: true,

    // Cool mode (confetti on connect)
    coolMode: false,

    // Initial chain (defaults to first in targetNetworks if not specified)
    // initialChainId: 1,
  },

  // ============================================================================
  // Privy Configuration (Email/Social Login)
  // ============================================================================
  privy: {
    // Required: Get your app ID at https://dashboard.privy.io
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",

    // Login methods to enable
    loginMethods: ["email", "wallet", "google", "twitter"],

    // Appearance customization
    appearance: {
      // Theme: Auto-syncs with app theme by default
      // Uncomment to override with static theme:
      // theme: "light",
      accentColor: "#2299dd",
      // logo: "https://your-logo-url.com/logo.png",
    },

    // Embedded wallet settings
    embeddedWallets: {
      createOnLogin: "users-without-wallets",
      requireUserPasswordOnCreate: false,
    },
  },

  // ============================================================================
  // Web3Auth Configuration (MPC-based Social Login)
  // ============================================================================
  web3auth: {
    // Required: Get your client ID at https://dashboard.web3auth.io
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "",

    // Network selection (use sapphire_devnet for testing, sapphire_mainnet for production)
    web3AuthNetwork: "sapphire_devnet",

    // UI mode: Static theme set at initialization (does not auto-sync with app theme)
    // uiMode: "dark",

    // Advanced: Custom login providers
    // loginConfig: {},
  },

  // ============================================================================
  // Common Settings (Shared across embedded wallet providers)
  // ============================================================================
  // Note: Not used for AppKit/RainbowKit
  common: {
    socialLogins: ["google", "apple", "twitter"],
    emailLogin: true,
    smsLogin: false,
  },
} as const satisfies EmbeddedWalletConfig;

export default scaffoldConfig;
