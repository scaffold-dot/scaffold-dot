"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Address } from "viem";
import { useAccount, useSwitchChain } from "wagmi";
import { Balance } from "./Balance";
import { AddressInfoDropdown } from "./RainbowKitCustomConnectButton/AddressInfoDropdown";
import { AddressQRCodeModal } from "./RainbowKitCustomConnectButton/AddressQRCodeModal";
import { WrongNetworkDropdown } from "./RainbowKitCustomConnectButton/WrongNetworkDropdown";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Privy Connect Button (watch balance + custom design)
 */
export const PrivyCustomConnectButton = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { chain } = useAccount();
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();

  // Get the embedded wallet (Privy creates this automatically on login)
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === "privy");
  const address = embeddedWallet?.address as Address | undefined;

  const blockExplorerAddressLink = address
    ? getBlockExplorerAddressLink(targetNetwork, address)
    : undefined;

  // Custom disconnect handler for Privy
  const handleDisconnect = async () => {
    await logout();
  };

  // Wait for Privy to be ready
  if (!ready) {
    return (
      <button className="btn btn-primary btn-sm" disabled type="button">
        Loading...
      </button>
    );
  }

  // Not authenticated - show login button
  if (!authenticated || !address) {
    return (
      <button className="btn btn-primary btn-sm" onClick={login} type="button">
        Connect Wallet
      </button>
    );
  }

  // Wrong network
  if (chain && chain.id !== targetNetwork.id) {
    return <WrongNetworkDropdown />;
  }

  // Connected - show address and balance
  return (
    <>
      <div className="flex flex-col items-center mr-1">
        <Balance address={address} className="min-h-0 h-auto" />
        <span className="text-xs" style={{ color: networkColor }}>
          {chain?.name || targetNetwork.name}
        </span>
      </div>
      <AddressInfoDropdown
        address={address}
        displayName={address?.slice(0, 6) + "..." + address?.slice(-4)}
        ensAvatar={undefined}
        blockExplorerAddressLink={blockExplorerAddressLink}
        onDisconnect={handleDisconnect}
      />
      <AddressQRCodeModal address={address} modalId="qrcode-modal" />
    </>
  );
};
