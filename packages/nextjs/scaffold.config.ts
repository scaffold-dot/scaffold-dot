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
  blockExplorers: {},
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

export const DEFAULT_ALCHEMY_API_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [localNode],

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

export default scaffoldConfig;
