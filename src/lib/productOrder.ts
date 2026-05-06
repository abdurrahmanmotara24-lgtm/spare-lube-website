export const BRAND_PRODUCT_ORDER_STORAGE_KEY = "brand-product-order-v1";

export type BrandProductOrderMap = Record<string, string[]>;

export function getStoredBrandProductOrder(): BrandProductOrderMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BRAND_PRODUCT_ORDER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as BrandProductOrderMap;
  } catch {
    return {};
  }
}

export function setStoredBrandProductOrder(orderMap: BrandProductOrderMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRAND_PRODUCT_ORDER_STORAGE_KEY, JSON.stringify(orderMap));
}

export function getBrandOrderRank(brandId: string, productId: string): number {
  const order = getStoredBrandProductOrder()[brandId] || [];
  const index = order.indexOf(productId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
