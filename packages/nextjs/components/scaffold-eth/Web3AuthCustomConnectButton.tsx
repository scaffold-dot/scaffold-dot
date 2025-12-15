"use client";

import { Address } from "viem";
import { useAccount } from "wagmi";
import { Balance } from "./Balance";
import { AddressInfoDropdown } from "./RainbowKitCustomConnectButton/AddressInfoDropdown";
import { AddressQRCodeModal } from "./RainbowKitCustomConnectButton/AddressQRCodeModal";
import { WrongNetworkDropdown } from "./RainbowKitCustomConnectButton/WrongNetworkDropdown";
import { useEmbeddedWallet, useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom Web3Auth Connect Button (watch balance + custom design)
 */
export const Web3AuthCustomConnectButton = () => {
  const { isAuthenticated, isLoading, login, logout, address: embeddedAddress } = useEmbeddedWallet();
  const { chain } = useAccount();
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();

  const address = embeddedAddress as Address | undefined;

  const blockExplorerAddressLink = address
    ? getBlockExplorerAddressLink(targetNetwork, address)
    : undefined;

  // Wait for Web3Auth to be ready
  if (isLoading) {
    return (
      <button className="btn btn-primary btn-sm" disabled type="button">
        Loading...
      </button>
    );
  }

  // Not authenticated - show login button
  if (!isAuthenticated || !address) {
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

  // Custom disconnect handler for Web3Auth
  const handleDisconnect = async () => {
    await logout();
  };

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
