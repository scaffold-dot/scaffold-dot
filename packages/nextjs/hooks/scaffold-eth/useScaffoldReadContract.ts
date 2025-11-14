import { useEffect } from "react";
import { QueryObserverResult, RefetchOptions, useQueryClient } from "@tanstack/react-query";
import type { ExtractAbiFunctionNames } from "abitype";
import { ReadContractErrorType } from "viem";
import { useBlockNumber, useReadContract } from "wagmi";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { AllowedChainIds } from "~~/utils/scaffold-eth";
import {
  AbiFunctionReturnType,
  ContractAbi,
  ContractName,
  UseScaffoldReadConfig,
} from "~~/utils/scaffold-eth/contract";

/**
 * Wrapper around wagmi's useContractRead hook which automatically loads (by name) the contract ABI and address from
 * the contracts present in deployedContracts.ts & externalContracts.ts corresponding to targetNetworks configured in scaffold.config.ts
 * @param config - The config settings, including extra wagmi configuration
 * @param config.contractName - deployed contract name
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call
 * @param config.chainId - optional chainId that is configured with the scaffold project to make use for multi-chain interactions.
 */
export const useScaffoldReadContract = <
  TContractName extends ContractName,
  TFunctionName extends ExtractAbiFunctionNames<ContractAbi<TContractName>, "pure" | "view">,
>({
  contractName,
  functionName,
  args,
  chainId,
  ...readConfig
}: UseScaffoldReadConfig<TContractName, TFunctionName>) => {
  // Debug: Log initial hook call
  console.log("🔍 [useScaffoldReadContract] Hook called:", {
    contractName,
    functionName,
    args,
    chainId,
  });

  const selectedNetwork = useSelectedNetwork(chainId);
  console.log("🌐 [useScaffoldReadContract] Selected network:", {
    id: selectedNetwork.id,
    name: selectedNetwork.name,
  });

  const { data: deployedContract } = useDeployedContractInfo({
    contractName,
    chainId: selectedNetwork.id as AllowedChainIds,
  });

  // Debug: Log deployed contract info
  console.log("📋 [useScaffoldReadContract] Deployed contract info:", {
    contractName,
    address: deployedContract?.address,
    hasAbi: !!deployedContract?.abi,
    abiLength: deployedContract?.abi?.length,
    abiFunctions: deployedContract?.abi
      ?.filter((item: any) => item.type === "function")
      .map((item: any) => item.name),
    targetFunctionExists: deployedContract?.abi?.some(
      (item: any) => item.type === "function" && item.name === functionName,
    ),
  });

  const { query: queryOptions, watch, ...readContractConfig } = readConfig;
  // set watch to true by default
  const defaultWatch = watch ?? true;

  const isQueryEnabled = !Array.isArray(args) || !args.some(arg => arg === undefined);
  console.log("⚙️ [useScaffoldReadContract] Query config:", {
    enabled: isQueryEnabled && (queryOptions?.enabled ?? true),
    watch: defaultWatch,
    args,
    hasUndefinedArgs: Array.isArray(args) && args.some(arg => arg === undefined),
  });

  const readContractHookRes = useReadContract({
    chainId: selectedNetwork.id,
    functionName,
    address: deployedContract?.address,
    abi: deployedContract?.abi,
    args,
    ...(readContractConfig as any),
    query: {
      enabled: isQueryEnabled && (queryOptions?.enabled ?? true),
      ...queryOptions,
    },
  }) as Omit<ReturnType<typeof useReadContract>, "data" | "refetch"> & {
    data: AbiFunctionReturnType<ContractAbi, TFunctionName> | undefined;
    refetch: (
      options?: RefetchOptions | undefined,
    ) => Promise<QueryObserverResult<AbiFunctionReturnType<ContractAbi, TFunctionName>, ReadContractErrorType>>;
  };

  // Debug: Log read contract hook result
  console.log("📊 [useScaffoldReadContract] Read contract hook result:", {
    contractName,
    functionName,
    address: deployedContract?.address,
    data: readContractHookRes.data,
    error: readContractHookRes.error,
    isLoading: readContractHookRes.isLoading,
    isError: readContractHookRes.isError,
    isSuccess: readContractHookRes.isSuccess,
    status: readContractHookRes.status,
    errorMessage: readContractHookRes.error?.message,
    errorName: readContractHookRes.error?.name,
    errorDetails: readContractHookRes.error,
  });

  // Debug: Log error details if present
  if (readContractHookRes.error) {
    console.error("❌ [useScaffoldReadContract] Error details:", {
      contractName,
      functionName,
      address: deployedContract?.address,
      error: readContractHookRes.error,
      errorMessage: readContractHookRes.error?.message,
      errorStack: readContractHookRes.error?.stack,
      errorCause: readContractHookRes.error?.cause,
    });
  }

  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({
    watch: defaultWatch,
    chainId: selectedNetwork.id,
    query: {
      enabled: defaultWatch,
    },
  });

  useEffect(() => {
    if (defaultWatch) {
      console.log("🔄 [useScaffoldReadContract] Invalidating queries on block change:", {
        blockNumber,
        contractName,
        functionName,
      });
      queryClient.invalidateQueries({ queryKey: readContractHookRes.queryKey });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return readContractHookRes;
};
