"use client";

import { Input } from "./input";
import { forwardRef, useState, useEffect } from "react";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      // Converter número para formato brasileiro (1.234,56)
      if (value === 0 || value === null || value === undefined) {
        setDisplayValue("");
        return;
      }

      const formatted = (value / 100).toFixed(2).replace(".", ",");
      const parts = formatted.split(",");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setDisplayValue(parts.join(","));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Remover tudo exceto números
      inputValue = inputValue.replace(/[^\d]/g, "");

      // Se vazio, definir como 0
      if (inputValue === "") {
        onChange(0);
        setDisplayValue("");
        return;
      }

      // Converter para número (centavos)
      const numericValue = parseInt(inputValue, 10);
      onChange(numericValue);
    };

    const handleBlur = () => {
      // Garantir que sempre tenha 2 casas decimais
      if (value > 0) {
        const formatted = (value / 100).toFixed(2).replace(".", ",");
        const parts = formatted.split(",");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setDisplayValue(parts.join(","));
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          $
        </span>
        <Input
          {...props}
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0,00"
          className="pl-8 text-right border-black text-black focus:border-black focus:ring-0"
          inputMode="numeric"
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };

