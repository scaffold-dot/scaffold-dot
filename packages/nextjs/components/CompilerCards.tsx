"use client";

import { useEffect, useState } from "react";
import { DocumentDuplicateIcon, CheckIcon, QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Compiler = "solc" | "resolc";

const CARDS: Record<
  Compiler,
  { title: string; subtitle: string; pros: string[] }
> = {
  solc: {
    title: "REVM",
    subtitle: "revive, solc compiler",
    pros: [
      "Full Ethereum tooling compatibility",
      "Contract verification support",
      "Production-ready (Parity recommended)",
      "Standard Hardhat workflow",
    ],
  },
  resolc: {
    title: "PVM",
    subtitle: "PolkaVM, resolc compiler",
    pros: [
      "Native PolkaVM execution",
      "RISC-V optimized bytecode",
      "Lower-level chain integration",
      "Cutting-edge Polkadot technology",
    ],
  },
};

export const CompilerCards = () => {
  const [active, setActive] = useState<Compiler | null>(null);
  const [copied, setCopied] = useState<Compiler | null>(null);
  const [showDiagram, setShowDiagram] = useState(false);

  useEffect(() => {
    fetch("/api/compiler")
      .then(res => res.json())
      .then(data => setActive(data.compiler))
      .catch(() => setActive("solc"));
  }, []);

  const handleCopy = (compiler: Compiler) => {
    navigator.clipboard.writeText(`yarn compiler ${compiler}`);
    setCopied(compiler);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!active) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 px-5">
      <p className="text-center text-xl opacity-70 mb-9">
        Choose a Compiler, Hub routes your bytecode to the right environment auto-magically
        <button
          className="inline-flex align-middle ml-1 opacity-60 hover:opacity-100"
          onClick={() => setShowDiagram(true)}
        >
          <QuestionMarkCircleIcon className="h-5 w-5" />
        </button>
      </p>

      {showDiagram && (
        <div className="modal modal-open" onClick={() => setShowDiagram(false)}>
          <div className="modal-box relative max-w-lg text-center border border-base-content" onClick={e => e.stopPropagation()}>
            <button
              className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
              onClick={() => setShowDiagram(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold mb-2">How Deployment Works on Polkadot Hub</h3>
            <p className="text-sm opacity-70 mb-5">
              One chain, two runtimes. Your compiler choice determines which VM
              executes your contract &mdash; same deployment scripts either way.
            </p>
            <div className="flex justify-center mb-5">
              <pre className="bg-base-200 rounded-xl px-6 py-5 text-xs font-mono leading-relaxed inline-block text-left">{`
    Your Solidity Contract
             |
       yarn compiler ?
             |
       ┌─────┴─────┐
       |           |
     solc       resolc
       |           |
  EVM bytecode  RISC-V bytecode
       |           |
       └─────┬─────┘
             |
       yarn deploy
             |
      ┌──────┴──────┐
      |  Polkadot   |
      |     Hub     |
      |             |
      | ┌────┐┌───┐ |
      | |REVM||PVM| |
      | └────┘└───┘ |
      └─────────────┘
             |
    Hub detects bytecode
    format and routes to
      the correct VM
`.trim()}</pre>
            </div>
            <p className="text-sm opacity-70 mb-3">
              Run <code className="text-primary font-mono text-xs">yarn compiler</code> to
              switch &mdash; your deployment scripts stay the same.
            </p>
            <a
              href="https://docs.polkadot.com/smart-contracts/overview/"
              target="_blank"
              rel="noopener noreferrer"
              className="link text-primary text-sm"
            >
              Read the official Polkadot smart contracts docs
            </a>
          </div>
        </div>
      )}
      <div className="flex justify-center items-stretch gap-6 flex-col md:flex-row">
        {(["solc", "resolc"] as const).map(compiler => {
          const card = CARDS[compiler];
          const isActive = active === compiler;

          return (
            <div
              key={compiler}
              className={`flex flex-col flex-1 bg-base-100 px-8 py-8 text-center items-center rounded-3xl border-2 transition-colors ${
                isActive ? "border-primary" : "border-base-300 opacity-70"
              }`}
            >
              <div className="h-5 mb-4">
                {isActive && (
                  <span className="badge badge-primary badge-sm">Active</span>
                )}
              </div>
              <h3 className="text-xl font-bold mb-1">{card.title}</h3>
              <p className="text-sm opacity-60 mb-4">{card.subtitle}</p>
              <ul className="text-left text-sm space-y-1 mb-5">
                {card.pros.map(pro => (
                  <li key={pro}>
                    <span className="mr-1.5">&#x2022;</span>
                    {pro}
                  </li>
                ))}
              </ul>
              {isActive ? (
                <span className="text-xs opacity-50"> </span>
              ) : (
                <button
                  className="btn btn-sm btn-ghost font-mono text-xs gap-1"
                  onClick={() => handleCopy(compiler)}
                >
                  <code>yarn compiler {compiler}</code>
                  {copied === compiler ? (
                    <CheckIcon className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
