import { PALETTE_COLOR } from "./palette_color";


/**
 * simple stable hash to map string -> integer
 */
const hashString = (str: string) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
};

const hexToRgb = (hex: string) => {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

const rgbToLuminance = (r: number, g: number, b: number) => {
  const srgb = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

/**
 * Get colors by PO number using a fixed palette of 100 clear distinct colors.
 * Returns background hex, text color (white or dark), palette index and rgb meta.
 */
export const getColorsByPoNumber = (poNumber: string) => {
  const hash = hashString(String(poNumber ?? ""));
  const idx = hash % PALETTE_COLOR.length;
  const hex = PALETTE_COLOR[idx];
  const { r, g, b } = hexToRgb(hex);
  const lum = rgbToLuminance(r, g, b);
  // choose text color for contrast: white for darker bg, dark for light bg
  const text = lum > 0.56 ? "#111827" : "#ffffff";
  // also return bg as CSS usable value
  return {
    bg: hex,
    text,
    index: idx,
    rgb: { r, g, b },
    meta: { luminance: lum },
  };
};
