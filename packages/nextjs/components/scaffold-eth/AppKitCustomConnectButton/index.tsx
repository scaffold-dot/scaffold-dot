"use client";

// @refresh reset
import { Balance } from "../Balance";
import { AddressInfoDropdown } from "../RainbowKitCustomConnectButton/AddressInfoDropdown";
import { AddressQRCodeModal } from "../RainbowKitCustomConnectButton/AddressQRCodeModal";
import { WrongNetworkDropdown } from "../RainbowKitCustomConnectButton/WrongNetworkDropdown";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getAppKitModal } from "~~/services/web3/appkit";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

/**
 * Custom AppKit Connect Button (watch balance + custom design)
 */
export const AppKitCustomConnectButton = () => {
  const modal = getAppKitModal();
  const { address, isConnected, chain } = useAccount();
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();

  const blockExplorerAddressLink = address
    ? getBlockExplorerAddressLink(targetNetwork, address)
    : undefined;

  if (!isConnected || !address) {
    return (
      <button className="btn btn-primary btn-sm" onClick={() => modal?.open()} type="button">
        Connect Wallet
      </button>
    );
  }

  if (chain && chain.id !== targetNetwork.id) {
    return <WrongNetworkDropdown />;
  }

  return (
    <>
      <div className="flex flex-col items-center mr-1">
        <Balance address={address as Address} className="min-h-0 h-auto" />
        <span className="text-xs" style={{ color: networkColor }}>
          {chain?.name || targetNetwork.name}
        </span>
      </div>
      <AddressInfoDropdown
        address={address as Address}
        displayName={address?.slice(0, 6) + "..." + address?.slice(-4)}
        ensAvatar={undefined}
        blockExplorerAddressLink={blockExplorerAddressLink}
      />
      <AddressQRCodeModal address={address as Address} modalId="qrcode-modal" />
    </>
  );
};
