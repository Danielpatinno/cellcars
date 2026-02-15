export const formatCurrency = (value: number): string => {
  if (value === 0 || value === null || value === undefined) return "0,00";
  const formatted = (value / 100).toFixed(2).replace(".", ",");
  const parts = formatted.split(",");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
};

