"use client";

import { useEffect, useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { Abi, AbiFunction } from "abitype";
import { Address, TransactionReceipt, encodeFunctionData } from "viem";
import { useAccount, useConfig, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { getWalletClient, getPublicClient } from "wagmi/actions";
import {
  ContractInput,
  TxReceipt,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/app/debug/_components/contract";
import { IntegerInput } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { simulateContractWriteAndNotifyError } from "~~/utils/scaffold-eth/contract";
import { localNode } from "../../../../scaffold.config"

type WriteOnlyFunctionFormProps = {
  abi: Abi;
  abiFunction: AbiFunction;
  onChange: () => void;
  contractAddress: Address;
  inheritedFrom?: string;
};

export const WriteOnlyFunctionForm = ({
  abi,
  abiFunction,
  onChange,
  contractAddress,
  inheritedFrom,
}: WriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [txValue, setTxValue] = useState<string>("");
  const { chain } = useAccount();
  const writeTxn = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;

  const { data: result, isPending, writeContractAsync } = useWriteContract();
  const wagmiConfig = useConfig();

  const handleWrite = async () => {
    try {
    // For local chain, use sendTransaction with explicit gas
      if (targetNetwork.id === localNode.id && writeContractAsync) {
        const data = encodeFunctionData({
          abi: abi,
          functionName: abiFunction.name,
          args: getParsedContractFunctionArgs(form),
        });

        const walletClient = await getWalletClient(wagmiConfig, { chainId: localNode.id });

        await writeTxn(async () => {
          // Use legacy transaction with explicit gasPrice instead of EIP-1559
          // The eth-rpc adapter may handle legacy transactions differently
          return walletClient!.sendTransaction({
            to: contractAddress,
            data,
            value: BigInt(txValue),
            gas: 1000000n,
            gasPrice: 25000000n, // Legacy transaction with explicit gas price
            type: 'legacy',
          });
        });
        onChange();
        return;
      }

      if (writeContractAsync) {
        const writeContractObj = {
          address: contractAddress,
          functionName: abiFunction.name,
          abi: abi,
          args: getParsedContractFunctionArgs(form),
          value: BigInt(txValue),
        };
       
        await simulateContractWriteAndNotifyError({ wagmiConfig, writeContractParams: writeContractObj });
        const makeWriteWithParams = () => writeContractAsync(writeContractObj);
        await writeTxn(makeWriteWithParams);
        onChange();
      }
    } catch (e: any) {
        console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
      }
  };

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransactionReceipt({
    hash: result,
  });
  
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

  const transformedFunction = transformAbiFunction(abiFunction);
  const inputs = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setDisplayedTxResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });
  
  const zeroInputs = inputs.length === 0 && abiFunction.stateMutability !== "payable";

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <p className="font-medium my-0 break-words">
          {abiFunction.name}
          <InheritanceTooltip inheritedFrom={inheritedFrom} />
        </p>
        {inputs}
        {abiFunction.stateMutability === "payable" ? (
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center ml-2">
              <span className="text-xs font-medium mr-2 leading-none">payable value</span>
              <span className="block text-xs font-extralight leading-none">wei</span>
            </div>
            <IntegerInput
              value={txValue}
              onChange={updatedTxValue => {
                setDisplayedTxResult(undefined);
                setTxValue(updatedTxValue);
              }}
              placeholder="value (wei)"
            />
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          {!zeroInputs && (
            <div className="grow basis-0">{displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}</div>
          )}
          <div
            className={`flex ${
              writeDisabled &&
              "tooltip tooltip-bottom tooltip-secondary before:content-[attr(data-tip)] before:-translate-x-1/3 before:left-auto before:transform-none"
            }`}
            data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
          >
            <button className="btn border-secondary-content btn-sm" disabled={writeDisabled || isPending} onClick={handleWrite}>
              {isPending && <span className="loading loading-spinner loading-xs"></span>}
              Send 💸
            </button>
          </div>
        </div>
      </div>
      {zeroInputs && txResult ? (
        <div className="grow basis-0">
          <TxReceipt txResult={txResult} />
        </div>
      ) : null}
    </div>
  );
};
