# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Scaffold-DOT is a toolkit for building decentralized applications on Polkadot Hub blockchain with Solidity smart contracts. It's a fork of Scaffold-ETH 2 adapted for Polkadot's Asset Hub using the PolkaVM execution environment.

**Tech Stack:** NextJS (App Router), Reown AppKit, Hardhat, Wagmi, Viem, TypeScript

**Monorepo Structure:**
- `packages/hardhat`: Solidity development environment with PolkaVM support
- `packages/nextjs`: NextJS frontend with Scaffold-ETH components and hooks
- `packages/asset-hub-pvm`: Contains downloaded Polkadot binaries (revive-dev-node, eth-rpc)

## Development Workflow

### Initial Setup
```bash
yarn install  # Downloads platform-specific binaries (setup-binaries.js)
```

### Local Development
Start all services in separate terminals:
```bash
yarn chain    # Terminal 1: Start substrate node (revive-dev-node)
yarn rpc      # Terminal 2: Start eth-rpc server
yarn deploy   # Terminal 3: Deploy contracts
yarn start    # Terminal 4: Start NextJS frontend on http://localhost:3000
```

**Key Differences from Standard Hardhat:**
- Uses Hardhat Ignition for deployments (not hardhat-deploy)
- Deployment modules in `packages/hardhat/ignition/modules/`
- Default deployment script: `packages/hardhat/scripts/runHardhatDeployWithPK.ts`
- Uses PolkaVM-specific compiler (resolc) configured in hardhat.config.ts

### Testing & Build Commands
```bash
yarn test              # Run Hardhat tests with gas reporting
yarn compile           # Compile Solidity contracts
yarn hardhat:check-types  # Type-check Hardhat package
yarn next:check-types     # Type-check NextJS package
yarn lint              # Lint both packages
yarn format            # Format code with Prettier
```

### Account Management
```bash
yarn generate          # Generate new encrypted account
yarn account           # View account details
yarn account:import    # Import existing private key
yarn account:reveal-pk # Reveal private key from encrypted storage
yarn fund              # Fund account on testnet
```

## Network Configuration

**Networks defined in hardhat.config.ts:**
- `localNode`: Local development (http://127.0.0.1:8545, Chain ID: 420420420)
- `passetHub`: Paseo Asset Hub testnet (Chain ID: 420420422)
- `kusamaHub`: Kusama Asset Hub mainnet (Chain ID: 420420418)

**Frontend network config:** `packages/nextjs/scaffold.config.ts`
- Custom chain definitions for localNode, passetHub, kusamaHub
- LOCAL_CHAIN_GAS_CONFIG constant for local development gas settings

**Default network:** `localNode` (configured in hardhat.config.ts)

## Smart Contract Development

### Contract Location
- Solidity contracts: `packages/hardhat/contracts/`
- Example contract: `YourContract.sol`

### Deployment
- **Ignition modules:** `packages/hardhat/ignition/modules/`
- **Example module:** `YourContract.ts`
- Deployment runs `generateTsAbis.ts` automatically to update frontend contract types
- Generated ABIs: `packages/nextjs/contracts/deployedContracts.ts`

### Hardhat Configuration Specifics
- Solidity version: 0.8.28
- PolkaVM compiler (resolc) with npm source
- All networks require `polkavm: true` flag
- Local account for testing: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

## Frontend Architecture

### Contract Interaction Hooks
**ALWAYS use these hooks - located in `packages/nextjs/hooks/scaffold-eth/`:**

**Reading:** `useScaffoldReadContract`
```typescript
const { data } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "functionName",
  args: [arg1, arg2], // optional
});
```

**Writing:** `useScaffoldWriteContract`
```typescript
const { writeContractAsync } = useScaffoldWriteContract({
  contractName: "YourContract"
});

await writeContractAsync({
  functionName: "functionName",
  args: [arg1, arg2],
  value: parseEther("0.1"), // for payable functions
});
```

**Other hooks:**
- `useScaffoldWatchContractEvent`: Watch for contract events
- `useScaffoldEventHistory`: Get historical events
- `useDeployedContractInfo`: Get deployed contract info
- `useScaffoldContract`: Get contract instance
- `useTransactor`: Transaction wrapper

### UI Components
**Always use these for Ethereum-specific UI - located in `packages/nextjs/components/scaffold-eth/`:**
- `Address`: Display Ethereum addresses
- `AddressInput`: Input for Ethereum addresses
- `Balance`: Display ETH/token balance
- `EtherInput`: Input with ETH/USD conversion
- `FaucetButton`: Request testnet funds

### Contract Type Generation
- Contracts auto-imported from `packages/nextjs/contracts/deployedContracts.ts`
- External contracts: `packages/nextjs/contracts/externalContracts.ts`
- TypeChain types: `packages/hardhat/typechain-types/`

## Binary Management

The project uses prebuilt Polkadot binaries downloaded during `yarn install`:
- **Location:** `packages/asset-hub-pvm/bin/`
- **Binaries:** `revive-dev-node`, `eth-rpc`
- **Script:** `setup-binaries.js` handles platform-specific downloads
- **Supported platforms:** linux-x64, darwin-x64, darwin-arm64

## Deployment to Testnets

1. Generate or import account: `yarn generate`
2. Fund account via [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111)
3. Set network in `hardhat.config.ts` defaultNetwork or use `--network passetHub`
4. Deploy: `yarn deploy --network passetHub`
5. Update `scaffold.config.ts` targetNetworks to match deployment network

## Important Notes

- Uses NextJS App Router (not Pages Router)
- Frontend runs on port 3000, Debug UI at `/debug`
- **PolkaVM Fixed Fee Model:** Unlike Ethereum's dynamic gas, Polkadot revive uses fixed transaction fees (~22 billion wei). The eth-rpc adapter requires `gasLimit × gasPrice ≥ fixed_fee`. Current config uses `gasLimit: 1000000n` and `gasPrice × 25000` multiplier.
- **Decimal Places:** Polkadot uses 12 decimals (not 18 like Ethereum). All chains configured in `scaffold.config.ts` must have correct `nativeCurrency.decimals`.
- Encrypted private keys stored in `packages/hardhat/.env`
- Never commit `.env` files or unencrypted private keys
