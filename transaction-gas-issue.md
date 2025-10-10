# Transaction Gas Issue - Investigation Summary

## Problem Statement

Contract write transactions from the Debug UI fail with the error:
```
"Inability to pay some fees (e.g. account balance too low)"
eth_fee=999925
fixed_fee=22008157000
```

Simple ETH transfers via the FaucetButton work fine, but contract function calls consistently fail.

---

## Root Cause

The **eth-rpc adapter's dry-run validation** calculates transaction fees using the chain's `base_fee_per_gas` (~0.999925) instead of respecting the explicit `gasPrice` or `maxFeePerGas` provided in the transaction.

**Fee calculation during validation:**
```
eth_fee = gas × base_fee_per_gas
eth_fee = 1,000,000 × 0.999925 = 999,925 wei
```

**Required fee for Polkadot revive:**
```
fixed_fee = ~22,008,157,000 wei (22-25 billion wei)
```

**The mismatch:** `999,925 << 22,008,157,000` - The calculated fee is ~22,000x too low.

---

## Solutions Attempted

### 1. ✅ Fixed Decimal Display Issues (SUCCESSFUL)

**Problem:** Balance displays showing incorrect values (100+ tokens instead of 0.1 tokens) due to hardcoded 18-decimal formatting instead of Polkadot's 12 decimals.

**Files Modified:**
- `packages/nextjs/components/scaffold-eth/Faucet.tsx` - Changed `parseEther` to `parseUnits` with chain decimals
- `packages/nextjs/app/blockexplorer/transaction/_components/TransactionComp.tsx` - Changed `formatEther` to `formatUnits`
- `packages/nextjs/app/blockexplorer/_components/TransactionsTable.tsx` - Changed `formatEther` to `formatUnits`
- `packages/nextjs/app/debug/_components/contract/utilsDisplay.tsx` - Updated `NumberDisplay` to use chain decimals
- `packages/nextjs/components/scaffold-eth/Input/IntegerInput.tsx` - Updated to use `parseUnits` with chain decimals

**Result:** ✅ UI now correctly displays token amounts with 12 decimals.

---

### 2. ❌ Added Explicit Gas Parameters (FAILED)

**Attempt:** Manually set gas parameters in the transaction:
```typescript
return walletClient!.sendTransaction({
  to: contractAddress,
  data,
  value: BigInt(txValue),
  gas: 1000000n,
  gasPrice: 25000000n, // or maxFeePerGas for EIP-1559
});
```

**File:** `packages/nextjs/app/debug/_components/contract/WriteOnlyFunctionForm.tsx`

**Result:** ❌ Transaction sent correct parameters, but eth-rpc validation still used `base_fee_per_gas` instead of explicit `gasPrice`.

**Evidence:**
- Browser showed: `gasPrice: 0.025 gwei` (25,000,000 wei) ✅
- Revive node showed: `max_fee_per_gas: Some(25000000)` ✅
- But validation calculated: `eth_fee=999925` ❌

---

### 3. ❌ Custom Chain Fee Configuration (FAILED)

**Attempt:** Used viem's documented `fees.estimateFeesPerGas` API to override default fee estimation:

```typescript
export const localNode = defineChain({
  // ... chain config
  fees: {
    estimateFeesPerGas: async () => {
      return {
        maxFeePerGas: 25000000n,
        maxPriorityFeePerGas: 1000000n,
      };
    },
  },
});
```

**File:** `packages/nextjs/scaffold.config.ts`

**Result:** ❌ The custom fee estimator was called (confirmed via transaction params), but eth-rpc adapter's validation still ignored it.

**Evidence:**
- Transaction included `maxFeePerGas: 25000000` from custom config ✅
- But eth-rpc calculated `eth_fee=999925` during dry-run ❌

---

### 4. ❌ Removed Gas Parameters for Auto-Estimation (FAILED)

**Attempt:** Let viem handle all gas estimation automatically:
```typescript
return walletClient!.sendTransaction({
  to: contractAddress,
  data,
  value: BigInt(txValue),
  // No gas params - let viem estimate
});
```

**Result:** ❌ Transaction sent with `gas: None`, causing dry-run to fail before even checking fees.

---

### 5. ❌ Legacy Transaction Type (FAILED)

**Attempt:** Use legacy transactions with `gasPrice` instead of EIP-1559:
```typescript
return walletClient!.sendTransaction({
  to: contractAddress,
  data,
  value: BigInt(txValue),
  gas: 1000000n,
  gasPrice: 25000000n,
  type: 'legacy',
});
```

**Result:** ❌ Same validation error. Legacy vs EIP-1559 made no difference to eth-rpc validation logic.

**Evidence:**
- Transaction was legacy type (no `0x02` prefix) ✅
- But eth-rpc still calculated `eth_fee=999925` ❌

---

### 6. ❌ Increased Account Balance (FAILED)

**Attempt:** Fund account with 1000+ tokens to ensure sufficient balance for any fee calculation.

**File Modified:** `packages/nextjs/components/scaffold-eth/FaucetButton.tsx`
- Changed `NUM_OF_ETH` from `"100"` to `"1000"`

**Result:** ❌ Same error even with massive balance. Confirmed the issue is NOT insufficient funds, but incorrect fee calculation during validation.

---

### 7. ❌ Specified Chain ID for WalletClient (FAILED)

**Attempt:** Ensure wallet client uses the `localNode` chain configuration:
```typescript
const walletClient = await getWalletClient(wagmiConfig, { chainId: localNode.id });
```

**Result:** ❌ WalletClient used correct chain, custom fees were included in transaction, but eth-rpc validation still failed.

---

## Why FaucetButton Works

The FaucetButton successfully sends ETH transfers because:

1. **Simple transfers use 21,000 gas** (fixed, much lower than contract calls)
2. **No contract data** = simpler validation path in eth-rpc
3. Even with low `base_fee_per_gas`, the total cost is acceptable: `21,000 × 0.999925 = 20,998 wei`
4. The eth-rpc adapter may have different validation logic for simple transfers vs contract calls

**FaucetButton transaction:**
```typescript
await localWalletClient.sendTransaction({
  account: faucetAccount,
  to: address,
  value: parseUnits(NUM_OF_ETH, 12),
  // No gas params - auto-estimated correctly
});
```

---

## Technical Details

### Transaction Flow
1. User submits transaction via Debug UI
2. Viem prepares transaction with gas parameters
3. Transaction sent to eth-rpc adapter at `http://localhost:8545`
4. **eth-rpc performs dry-run validation:**
   - Calls `runtime::revive::dry_run_eth_transact`
   - Calculates `eth_fee = gas × base_fee_per_gas`
   - Checks if `balance >= eth_fee + value`
   - **FAILS** because `eth_fee (999,925) < fixed_fee (22,008,157,000)`
5. Transaction rejected before reaching the chain

### Key Evidence from Logs

**Browser (transaction being sent):**
```
gas:       1000000
gasPrice:  0.025 gwei (25,000,000 wei)
```

**eth-rpc adapter (validation):**
```
eth_fee=999925
fixed_fee=22008157000
```

**revive-node (transaction details):**
```
GenericTransaction {
  gas: Some(1000000),
  gas_price: None,
  max_fee_per_gas: Some(25000000),  // ✅ Correct value sent
  max_priority_fee_per_gas: Some(1000000),
  ...
}
```

### The Discrepancy

The transaction correctly includes `max_fee_per_gas: 25000000`, but the eth-rpc adapter calculates:
```
eth_fee = 1,000,000 × 0.999925 = 999,925
```

Instead of using the transaction's fee parameters:
```
eth_fee = 1,000,000 × 25,000,000 = 25,000,000,000 ✅
```

---

## Current State

### Working:
- ✅ Balance displays (correctly showing 12-decimal values)
- ✅ Simple ETH transfers via FaucetButton
- ✅ Contract read operations (no gas required)
- ✅ Gas parameters correctly included in transactions

### Not Working:
- ❌ Contract write transactions via Debug UI
- ❌ Any transaction with contract `data` field
- ❌ eth-rpc dry-run validation for high-gas operations

---

## Conclusion

**The issue is in the eth-rpc adapter's validation logic, NOT in the frontend code.**

The eth-rpc adapter needs to be modified to:
1. Use the transaction's explicit `gasPrice` or `maxFeePerGas` during dry-run validation, OR
2. Skip the balance check during dry-run and let actual transaction execution handle fee validation, OR
3. Correctly calculate fees based on Polkadot revive's fixed fee model

### Potential Solutions

1. **Modify eth-rpc adapter source code** - Update the dry-run validation to respect explicit gas prices
2. **Configure revive-dev-node** - Check if there are node-level configurations for fee calculation
3. **Bypass dry-run** - Find a way to skip dry-run validation (if possible)
4. **Use different RPC method** - Investigate if there's an alternative RPC method that bypasses validation

### Files in Final State

**Modified for decimal fixes (working correctly):**
- `packages/nextjs/components/scaffold-eth/Faucet.tsx`
- `packages/nextjs/components/scaffold-eth/FaucetButton.tsx`
- `packages/nextjs/components/scaffold-eth/Input/IntegerInput.tsx`
- `packages/nextjs/app/blockexplorer/transaction/_components/TransactionComp.tsx`
- `packages/nextjs/app/blockexplorer/_components/TransactionsTable.tsx`
- `packages/nextjs/app/debug/_components/contract/utilsDisplay.tsx`

**Modified for gas handling (not working due to eth-rpc issue):**
- `packages/nextjs/scaffold.config.ts` - Added custom `fees.estimateFeesPerGas`
- `packages/nextjs/app/debug/_components/contract/WriteOnlyFunctionForm.tsx` - Legacy transaction with explicit gasPrice

### Next Steps

1. Investigate eth-rpc adapter source code
2. Check Polkadot/pallet-revive documentation for fee configuration
3. Contact Polkadot/pallet-revive developers about this issue
4. Consider creating an issue in the pallet-revive repository

---

## Additional Notes

- **Polkadot uses 12 decimals** (not 18 like Ethereum)
- **Fixed fee model:** Polkadot revive uses ~22-25 billion wei total fee
- **Multi-dimensional metering:** `ref_time`, `proof_size`, `storage_deposit` mapped to single gas dimension
- **EIP-1559 support:** eth-rpc adapter supports EIP-1559 but fee calculation is problematic

**Date:** 2025-10-10
**Scaffold-DOT Version:** Fork of Scaffold-ETH 2 for Polkadot Asset Hub
**Node:** revive-dev-node with eth-rpc adapter
