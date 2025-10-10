import { useCallback, useEffect, useState } from "react";
import { parseUnits } from "viem";
import { CommonInputProps, InputBase, IntegerVariant, isValidInteger } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

type IntegerInputProps = CommonInputProps<string> & {
  variant?: IntegerVariant;
  disableMultiplyBy1e18?: boolean;
};

export const IntegerInput = ({
  value,
  onChange,
  name,
  placeholder,
  disabled,
  variant = IntegerVariant.UINT256,
  disableMultiplyBy1e18 = false,
}: IntegerInputProps) => {
  const [inputError, setInputError] = useState(false);
  const { targetNetwork } = useTargetNetwork();
  const decimals = targetNetwork.nativeCurrency.decimals;

  const multiplyByDecimals = useCallback(() => {
    if (!value) {
      return;
    }
    // Use chain-specific decimals (12 for Polkadot chains)
    return onChange(parseUnits(value, decimals).toString());
  }, [onChange, value, decimals]);

  useEffect(() => {
    if (isValidInteger(variant, value)) {
      setInputError(false);
    } else {
      setInputError(true);
    }
  }, [value, variant]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      error={inputError}
      onChange={onChange}
      disabled={disabled}
      suffix={
        !inputError &&
        !disableMultiplyBy1e18 && (
          <div
            className="space-x-4 flex tooltip tooltip-top tooltip-secondary before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
            data-tip={`Multiply by 1e${decimals} (wei)`}
          >
            <button
              className={`${disabled ? "cursor-not-allowed" : "cursor-pointer"} font-semibold px-4 text-xl text-primary`}
              onClick={multiplyByDecimals}
              disabled={disabled}
              type="button"
            >
              ∗
            </button>
          </div>
        )
      }
    />
  );
};
