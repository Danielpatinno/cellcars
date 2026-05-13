"use client";

import { Input } from "./input";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatPygWholeGuaranies, formatCurrency } from "@/lib/currency-utils";
import type { VehiclePriceCurrency } from "@/lib/vehicle-currency";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  /** Si se define, el prefijo refleja guaraníes o dólares (precios de vehículo). */
  vehicleCurrency?: VehiclePriceCurrency;
}

/** "43.000,50" / "43000,5" → 43000.5 (quita miles con punto, coma decimal). */
function parseLatinDecimal(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const noThousands = t.replace(/\./g, "");
  const normalized = noThousands.replace(",", ".");
  if (normalized === "" || normalized === "." || normalized === "-") return null;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

/** "1.000.000" → guaraníes enteros. */
function parsePygWhole(raw: string): number | null {
  const d = raw.replace(/\./g, "").replace(/[^\d]/g, "");
  if (d === "") return null;
  const n = parseInt(d, 10);
  return Number.isFinite(n) ? n : null;
}

function formatDisplayFromValue(
  value: number,
  vehicleCurrency: VehiclePriceCurrency | undefined,
): string {
  if (value === 0 || value === null || value === undefined) return "";
  if (vehicleCurrency === "PYG") {
    const whole = Math.round(value);
    return whole > 0 ? formatPygWholeGuaranies(whole) : "";
  }
  if (vehicleCurrency === "USD") {
    const whole = Math.round(value);
    return whole > 0 ? formatCurrency(whole * 100) : "";
  }
  const formatted = (value / 100).toFixed(2).replace(".", ",");
  const parts = formatted.split(",");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      vehicleCurrency,
      className,
      onBlur: onBlurProp,
      onFocus: onFocusProp,
      ...props
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = useState("");
    const [focused, setFocused] = useState(false);

    const syncFromParent = useCallback(() => {
      setDisplayValue(formatDisplayFromValue(value, vehicleCurrency));
    }, [value, vehicleCurrency]);

    useEffect(() => {
      if (focused) return;
      syncFromParent();
    }, [focused, syncFromParent]);

    const prefix =
      vehicleCurrency === "PYG"
        ? "Gs."
        : vehicleCurrency === "USD"
          ? "US$"
          : "$";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDisplayValue(raw);

      if (raw.trim() === "") {
        onChange(0);
        return;
      }

      if (vehicleCurrency === "PYG") {
        const n = parsePygWhole(raw);
        if (n === null) return;
        onChange(n);
        return;
      }

      if (vehicleCurrency === "USD") {
        const n = parseLatinDecimal(raw);
        if (n === null) return;
        onChange(Math.round(n));
        return;
      }

      const n = parseLatinDecimal(raw);
      if (n === null) return;
      onChange(Math.round(n * 100));
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocusProp?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      syncFromParent();
      onBlurProp?.(e);
    };

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 sm:text-sm">
          {prefix}
        </span>
        <Input
          {...props}
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={vehicleCurrency === "PYG" || vehicleCurrency === "USD" ? "0" : "0,00"}
          className={cn(
            "text-right border-black text-black focus:border-black focus:ring-0",
            vehicleCurrency === "PYG" && "pl-[2.75rem]",
            vehicleCurrency === "USD" && "pl-14",
            !vehicleCurrency && "pl-8",
            className,
          )}
          inputMode="decimal"
        />
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
