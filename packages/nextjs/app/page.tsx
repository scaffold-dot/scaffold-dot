"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon, QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CompilerCards } from "~~/components/CompilerCards";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [showTips, setShowTips] = useState(false);

  return (
    <>
      <div className="flex bg-base-100 items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center flex items-center justify-center gap-2">
            <span className="block text-4xl font-bold">Welcome to Scaffold-DOT</span>
            <button
              className="btn btn-ghost btn-circle btn-sm opacity-60 hover:opacity-100"
              onClick={() => setShowTips(true)}
            >
              <QuestionMarkCircleIcon className="h-6 w-6" />
            </button>
          </h1>
        </div>

        {showTips && (
          <div className="modal modal-open" onClick={() => setShowTips(false)}>
            <div className="modal-box relative border border-base-content" onClick={e => e.stopPropagation()}>
              <button
                className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
                onClick={() => setShowTips(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-bold mb-4">Getting Started</h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <p className="font-semibold">Edit the landing page</p>
                  <p className="opacity-70">
                    Customize this page by editing{" "}
                    <code className="text-primary font-mono text-xs">packages/nextjs/app/page.tsx</code>
                  </p>
                </li>
                <li>
                  <p className="font-semibold">Modify your smart contract</p>
                  <p className="opacity-70">
                    Edit{" "}
                    <code className="text-primary font-mono text-xs">packages/hardhat/contracts/YourContract.sol</code>{" "}
                    and redeploy with <code className="text-primary font-mono text-xs">yarn deploy</code>
                  </p>
                </li>
                <li>
                  <p className="font-semibold">Edit your deployment</p>
                  <p className="opacity-70">
                    Configure how your contract is deployed in{" "}
                    <code className="text-primary font-mono text-xs">packages/hardhat/ignition/modules/YourContract.ts</code>
                  </p>
                </li>
                <li>
                  <p className="font-semibold">Learn about Polkadot Hub</p>
                  <p className="opacity-70">
                    Read about the current Polkadot Hub architecture at{" "}
                    <a
                      href="https://docs.polkadot.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link text-primary"
                    >
                      docs.polkadot.com
                    </a>
                  </p>
                </li>
              </ul>

            </div>
          </div>
        )}

        <CompilerCards />

      </div>
    </>
  );
};

export default Home;
