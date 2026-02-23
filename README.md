# 🏗 Scaffold-DOT


🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on Polkadot Hub blockchain with Solidity smart contracts. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, Reown AppKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.


## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)


## Quickstart

1. Install the latest version of Scaffold-DOT.

```
git clone https://github.com/scaffold-dot/scaffold-dot.git scaffold-dot
```
cd into scaffold-dot directory and yarn install

```
cd scaffold-dot && yarn install
```

> This runs `setup-binaries.js` which downloads the platform-specific binaries (`revive-dev-node`, `eth-rpc`) needed to run Polkadot Hub locally.

2. On a terminal, start all of the services:

```
yarn hub
```

3. On a second terminal, deploy your smart contract:

```
yarn deploy
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.


## Documentation

Visit the official Scaffold-DOT [documentation](https://docs.scaffolddot.dev/) to learn all the technical details and guides.

For additional resources, you can also refer to the Scaffold-ETH 2 [docs](https://docs.scaffoldeth.io) and [website](https://scaffoldeth.io).

## Contributing to Scaffold-DOT

We welcome contributions to Scaffold-DOT!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-dot/scaffold-dot/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-DOT.
