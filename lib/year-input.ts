/** Solo dígitos, máximo 4 (evita 20267); vacío → 0. */
export function parseVehicleYearInput(raw: string): number {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits === "") return 0;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}
