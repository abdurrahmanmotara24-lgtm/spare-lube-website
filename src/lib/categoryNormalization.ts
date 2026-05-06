export function normalizeCategoryName(category: string | null | undefined): string {
  const value = (category || "").trim();
  if (value.toLowerCase() === "engine oils") return "Engine Oil";
  return value;
}
