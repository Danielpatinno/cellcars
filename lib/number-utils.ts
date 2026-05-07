export function formatThousands(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "";
  const digits =
    typeof value === "number" ? String(Math.trunc(value)) : String(value);
  const onlyNumbers = digits.replace(/\D/g, "");
  if (!onlyNumbers) return "";
  return onlyNumbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseThousands(value: string) {
  const onlyNumbers = value.replace(/\D/g, "");
  if (!onlyNumbers) return 0;
  const n = Number(onlyNumbers);
  return Number.isFinite(n) ? n : 0;
}

