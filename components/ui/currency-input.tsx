"use client";

import { Input } from "./input";
import { forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatPygWholeGuaranies, formatCurrency } from "@/lib/currency-utils";
import type { VehiclePriceCurrency } from "@/lib/vehicle-currency";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  /** Si se define, el prefijo refleja guaraníes o dólares (precios de vehículo). */
  vehicleCurrency?: VehiclePriceCurrency;
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

    const prefix =
      vehicleCurrency === "PYG"
        ? "Gs."
        : vehicleCurrency === "USD"
          ? "US$"
          : "$";

    useEffect(() => {
      if (value === 0 || value === null || value === undefined) {
        setDisplayValue("");
        return;
      }
      if (vehicleCurrency === "PYG") {
        setDisplayValue(value > 0 ? formatPygWholeGuaranies(value) : "");
        return;
      }
      if (vehicleCurrency === "USD") {
        const whole = Math.round(value || 0);
        setDisplayValue(whole > 0 ? formatCurrency(whole * 100) : "");
        return;
      }
      const formatted = (value / 100).toFixed(2).replace(".", ",");
      const parts = formatted.split(",");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setDisplayValue(parts.join(","));
    }, [value, vehicleCurrency]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value.replace(/[^\d]/g, "");

      if (inputValue === "") {
        onChange(0);
        setDisplayValue("");
        return;
      }

      if (vehicleCurrency === "PYG") {
        const guaranies = parseInt(inputValue, 10);
        if (!Number.isFinite(guaranies)) {
          onChange(0);
          setDisplayValue("");
          return;
        }
        onChange(guaranies);
        return;
      }

      if (vehicleCurrency === "USD") {
        const dollars = parseInt(inputValue, 10);
        if (!Number.isFinite(dollars)) {
          onChange(0);
          setDisplayValue("");
          return;
        }
        onChange(dollars);
        return;
      }

      const numericValue = parseInt(inputValue, 10);
      onChange(numericValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocusProp?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (!vehicleCurrency && value > 0) {
        const formatted = (value / 100).toFixed(2).replace(".", ",");
        const parts = formatted.split(",");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setDisplayValue(parts.join(","));
      }
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
          inputMode="numeric"
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };

