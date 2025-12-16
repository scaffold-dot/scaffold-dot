"use client";

import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { passetHub } from "~~/scaffold.config";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { notification } from "~~/utils/scaffold-eth";

const PASSET_HUB_FAUCET_URL = "https://faucet.polkadot.io/?parachain=1111";

/**
 * FaucetLink button which links to Polkadot faucet for Passet Hub testnet.
 * Shows tooltip when balance is below 1 PAS.
 * Copies address and opens faucet in new tab on click.
 */
export const FaucetLink = () => {
  const { address, chain: ConnectedChain } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { data: balance } = useWatchBalance({ address });

  // Only render on Passet Hub network
  if (ConnectedChain?.id !== passetHub.id) {
    return null;
  }

  // Calculate balance in PAS (18 decimals)
  const formattedBalance = balance ? Number(balance.value) / 10 ** 18 : 0;
  const isBalanceLow = formattedBalance < 1;

  const handleClick = async () => {
    if (!address) return;

    try {
      // Copy address to clipboard
      await navigator.clipboard.writeText(address);

      // Show toast notification
      notification.info("Copied address! Opening faucet page...");

      // Wait 1.5 seconds before opening the faucet page
      setTimeout(() => {
        window.open(PASSET_HUB_FAUCET_URL, "_blank", "noopener,noreferrer");
      }, 1500);
    } catch (error) {
      console.error("Failed to copy address:", error);
      notification.error("Failed to copy address");
    }
  };

  return (
    <div
      className={
        !isBalanceLow
          ? "ml-1"
          : "ml-1 tooltip tooltip-bottom tooltip-primary tooltip-open font-bold before:left-auto before:transform-none before:content-[attr(data-tip)] before:-translate-x-2/5"
      }
      data-tip="Get PAS from faucet"
    >
      <button onClick={handleClick} className="btn btn-secondary btn-sm px-2 rounded-full">
        <BanknotesIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
