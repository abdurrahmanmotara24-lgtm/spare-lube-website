// Optional theme color suggestions per brand. Admin must explicitly apply.
// Values are HSL strings matching the site_settings format.

export interface BrandThemeSuggestion {
  label: string;
  primary_color: string;
  accent_color: string;
  button_color: string;
  button_foreground_color: string;
}

export type BrandThemeEditable = Pick<
  BrandThemeSuggestion,
  "primary_color" | "accent_color" | "button_color" | "button_foreground_color"
>;

export const BRAND_THEME_OVERRIDE_STORAGE_KEY = "brand-theme-overrides-v1";

export const BRAND_THEME_SUGGESTIONS: Record<string, BrandThemeSuggestion> = {
  shell: {
    label: "Shell — yellow & red",
    primary_color: "0 85% 46%",
    accent_color: "48 100% 50%",
    button_color: "0 85% 46%",
    button_foreground_color: "0 0% 100%",
  },
  castrol: {
    label: "Castrol — green & red",
    primary_color: "142 72% 29%",
    accent_color: "0 85% 46%",
    button_color: "142 72% 29%",
    button_foreground_color: "0 0% 100%",
  },
  g4: {
    label: "G4 — blue industrial",
    primary_color: "215 90% 45%",
    accent_color: "210 15% 35%",
    button_color: "215 90% 45%",
    button_foreground_color: "0 0% 100%",
  },
  blixem: {
    label: "Blixem — neutral industrial",
    primary_color: "0 0% 20%",
    accent_color: "30 90% 55%",
    button_color: "0 0% 20%",
    button_foreground_color: "0 0% 100%",
  },
  valvoline: {
    label: "Valvoline — blue & red",
    primary_color: "215 90% 45%",
    accent_color: "0 85% 46%",
    button_color: "0 85% 46%",
    button_foreground_color: "0 0% 100%",
  },
  engen: {
    label: "Engen — deep blue",
    primary_color: "214 88% 40%",
    accent_color: "196 90% 48%",
    button_color: "214 88% 40%",
    button_foreground_color: "0 0% 100%",
  },
  fuchs: {
    label: "Fuchs — cobalt blue",
    primary_color: "224 82% 44%",
    accent_color: "206 95% 48%",
    button_color: "224 82% 44%",
    button_foreground_color: "0 0% 100%",
  },
  motolube: {
    label: "Motolube — graphite orange",
    primary_color: "24 92% 47%",
    accent_color: "210 10% 20%",
    button_color: "24 92% 47%",
    button_foreground_color: "0 0% 100%",
  },
  winners: {
    label: "Winners — victory gold",
    primary_color: "43 95% 47%",
    accent_color: "20 82% 44%",
    button_color: "43 95% 47%",
    button_foreground_color: "0 0% 10%",
  },
  bmw: {
    label: "BMW — brand blue",
    primary_color: "203 100% 42%",
    accent_color: "0 0% 20%",
    button_color: "203 100% 42%",
    button_foreground_color: "0 0% 100%",
  },
  plexus: {
    label: "Plexus — cool teal",
    primary_color: "189 77% 36%",
    accent_color: "207 76% 42%",
    button_color: "189 77% 36%",
    button_foreground_color: "0 0% 100%",
  },
};

function hashBrandId(brandId: string): number {
  let hash = 0;
  for (let i = 0; i < brandId.length; i += 1) {
    hash = (hash * 31 + brandId.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getStoredBrandThemeOverrides(): Record<string, BrandThemeEditable> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BRAND_THEME_OVERRIDE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, BrandThemeEditable>;
  } catch {
    return {};
  }
}

function setStoredBrandThemeOverrides(overrides: Record<string, BrandThemeEditable>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRAND_THEME_OVERRIDE_STORAGE_KEY, JSON.stringify(overrides));
}

export function setStoredBrandThemeOverride(brandId: string, theme: BrandThemeEditable) {
  const overrides = getStoredBrandThemeOverrides();
  overrides[brandId] = theme;
  setStoredBrandThemeOverrides(overrides);
}

export function removeStoredBrandThemeOverride(brandId: string) {
  const overrides = getStoredBrandThemeOverrides();
  if (!overrides[brandId]) return;
  delete overrides[brandId];
  setStoredBrandThemeOverrides(overrides);
}

// Generates a stable fallback palette so any custom brand still changes theme.
export function getBrandThemeSuggestion(
  brandId: string,
  brandName?: string,
  dbOverride?: Partial<BrandThemeEditable> | null,
): BrandThemeSuggestion {
  const preset = BRAND_THEME_SUGGESTIONS[brandId];
  const overrides = getStoredBrandThemeOverrides();
  const localOverride = overrides[brandId];
  const hasDbOverride = Boolean(
    dbOverride?.primary_color ||
      dbOverride?.accent_color ||
      dbOverride?.button_color ||
      dbOverride?.button_foreground_color,
  );
  const override = hasDbOverride ? dbOverride : localOverride;
  if (preset) {
    if (!override) return preset;
    return {
      ...preset,
      ...override,
      label: `${brandName || preset.label} — custom theme`,
    };
  }

  const hash = hashBrandId(brandId);
  const primaryHue = hash % 360;
  const accentHue = (primaryHue + 38) % 360;
  const lightness = 40 + (hash % 8);
  const accentLightness = Math.max(35, lightness - 5);

  const generated: BrandThemeSuggestion = {
    label: `${brandName || brandId} — auto theme`,
    primary_color: `${primaryHue} 72% ${lightness}%`,
    accent_color: `${accentHue} 78% ${accentLightness}%`,
    button_color: `${primaryHue} 72% ${lightness}%`,
    button_foreground_color: "0 0% 100%",
  };
  if (!override) return generated;
  return {
    ...generated,
    ...override,
    label: `${brandName || brandId} — custom theme`,
  };
}
