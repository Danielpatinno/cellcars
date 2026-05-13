export const VEHICLE_PRICE_CURRENCIES = ["PYG", "USD"] as const;

export type VehiclePriceCurrency = (typeof VEHICLE_PRICE_CURRENCIES)[number];

export const VEHICLE_PRICE_CURRENCY_LABELS: Record<VehiclePriceCurrency, string> = {
  PYG: "Guaraníes (Gs.)",
  USD: "Dólares (US$)",
};

export function normalizeVehiclePriceCurrency(
  v: string | null | undefined,
): VehiclePriceCurrency {
  if (v === "USD" || v === "PYG") return v;
  return "PYG";
}

/**
 * Precio del vehículo en BD → escala del formulario de venta (centésimos al mostrar con formatCurrency).
 * - PYG: guaraníes enteros → ×100.
 * - USD: dólares enteros → ×100 (pasa a “centavos” del mismo valor monetario).
 */
export function vehiclePriceToSaleTotalMinorUnits(
  price: number,
  currency?: string | null,
): number {
  if (!Number.isFinite(price) || price < 0) return 0;
  const rounded = Math.round(price);
  return rounded * 100;
}
