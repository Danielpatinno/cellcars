import {
  normalizeVehiclePriceCurrency,
  type VehiclePriceCurrency,
} from "@/lib/vehicle-currency";

export const formatCurrency = (value: number): string => {
  if (value === 0 || value === null || value === undefined) return "0,00";
  const formatted = (value / 100).toFixed(2).replace(".", ",");
  const parts = formatted.split(",");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
};

/** Guaraníes enteros guardados en BD: miles con punto (1.000.000). */
export function formatPygWholeGuaranies(stored: number): string {
  const whole = Math.round(stored);
  if (!Number.isFinite(whole) || whole === 0) return "0";
  return whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Precio de vehículo para mostrar.
 * - USD: `stored` = dólares enteros (ej. 38000 → US$ 38.000,00).
 * - PYG: `stored` = guaraníes enteros.
 */
export function formatVehiclePrice(
  stored: number,
  currency?: string | null,
): string {
  const c: VehiclePriceCurrency = normalizeVehiclePriceCurrency(currency);
  if (!Number.isFinite(stored)) {
    return c === "USD" ? "US$ 0,00" : "Gs. 0";
  }
  if (c === "USD") {
    // En vehículos, USD se guarda en dólares enteros; formatCurrency espera centavos (÷100).
    return `US$ ${formatCurrency(Math.round(stored) * 100)}`;
  }
  if (stored === 0) return "Gs. 0";
  return `Gs. ${formatPygWholeGuaranies(stored)}`;
}
