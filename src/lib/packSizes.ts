// Brand-based pack sizes. Maps brand name -> size -> units per pack (box).
// If a brand or size isn't listed, no pack info is assigned (fallback to plain size).
export type PackSizeRules = Record<string, Record<string, number>>;

const normalizeBrandKey = (raw: string) =>
  raw.toLowerCase().trim().replace(/[-_]/g, " ").replace(/\s+/g, " ");

const compactBrandKey = (raw: string) => normalizeBrandKey(raw).replace(/\s+/g, "");
const normalizeBrandIdKey = (raw: string) => raw.toLowerCase().trim();

export const DEFAULT_PACK_RULES: PackSizeRules = {};

const normalizeBrand = (
  brand: string | null | undefined,
  rules: PackSizeRules,
): string | null => {
  if (!brand) return null;
  const brandIdKey = normalizeBrandIdKey(brand);
  if (rules[brandIdKey]) return brandIdKey;
  const key = normalizeBrandKey(brand);
  if (rules[key]) return key;
  const compactKey = compactBrandKey(brand);
  const compactMatch = Object.keys(rules).find((rule) => compactBrandKey(rule) === compactKey);
  if (compactMatch) return compactMatch;
  // Tolerate variants like "G4 Lubricants" by matching on the leading rule key
  const match = Object.keys(rules).find(
    (rule) => key === rule || key.startsWith(`${rule} `) || key.includes(rule),
  );
  return match ?? null;
};

const normalizeSize = (size: string | null | undefined): string | null => {
  if (!size) return null;
  return size.trim().toUpperCase().replace(/\s+/g, "");
};

export const getUnitsPerPack = (
  brand: string | null | undefined,
  size: string | null | undefined,
  rules: PackSizeRules = DEFAULT_PACK_RULES,
): number | null => {
  const brandKey = normalizeBrand(brand, rules);
  const sizeKey = normalizeSize(size);
  if (!brandKey || !sizeKey) return null;
  const rule = rules[brandKey];
  return rule?.[sizeKey] ?? null;
};

export const formatSizeWithPack = (
  brand: string | null | undefined,
  size: string | null | undefined,
  rules: PackSizeRules = DEFAULT_PACK_RULES,
): string => {
  if (!size) return "";
  const units = getUnitsPerPack(brand, size, rules);
  if (!units) return size;
  return `${units} × ${size}`;
};

export const makePackRulesMap = (
  rows: Array<{ brandId?: string; brandName: string; sizeName: string; unitsPerPack: number }>,
): PackSizeRules => {
  return rows.reduce<PackSizeRules>((acc, row) => {
    const brandKey = normalizeBrandKey(row.brandName);
    const brandIdKey = row.brandId ? normalizeBrandIdKey(row.brandId) : null;
    const sizeKey = normalizeSize(row.sizeName);
    if (!brandKey || !sizeKey || !Number.isFinite(row.unitsPerPack) || row.unitsPerPack <= 0) {
      return acc;
    }
    if (!acc[brandKey]) acc[brandKey] = {};
    acc[brandKey][sizeKey] = Math.floor(row.unitsPerPack);
    if (brandIdKey) {
      if (!acc[brandIdKey]) acc[brandIdKey] = {};
      acc[brandIdKey][sizeKey] = Math.floor(row.unitsPerPack);
    }
    return acc;
  }, {});
};