/**
 * The fixed palette for categories, such as projects, teams, or tags. The app
 * stores the key of a palette color with the record, never a color value.
 * Every color shares the same lightness and chroma for each role, so only the
 * hue tells categories apart and no category is more prominent than another.
 *
 * Each value follows the active theme through `light-dark()`, which reads the
 * `color-scheme` that AppDocument and the explicit themes set from `color.scheme`.
 * Apply a value through a StyleX style function.
 */
export type CategoryRole = "text" | "surface" | "line" | "onLine";

/**
 * The palette, in the order that `ColorSwatchPicker` shows it. The hues stay at
 * least 25 degrees apart, so neighbors stay distinct. Some tones are outside
 * sRGB, so the contrast is measured after a clip to sRGB, which gives the
 * least contrast: `text` is 4.7:1 or more on the `surface` of the same color
 * and on the page surfaces in both themes, and `line` is 3.6:1 or more on the
 * raised and overlay surfaces.
 */
export const categoryColors = [
  { key: "red", label: "Red", hue: 25 },
  { key: "orange", label: "Orange", hue: 60 },
  { key: "amber", label: "Amber", hue: 85 },
  { key: "green", label: "Green", hue: 145 },
  { key: "teal", label: "Teal", hue: 185 },
  { key: "blue", label: "Blue", hue: 245 },
  { key: "indigo", label: "Indigo", hue: 275 },
  { key: "violet", label: "Violet", hue: 305 },
  { key: "pink", label: "Pink", hue: 350 },
] as const;

export type CategoryColor = (typeof categoryColors)[number]["key"];

/** The keys of the palette, for a schema that validates a stored key. */
export const categoryColorKeys: ReadonlyArray<CategoryColor> = categoryColors.map(
  (entry) => entry.key,
);

interface Tone {
  readonly lightness: number;
  readonly chroma: number;
  readonly alpha?: number;
}

const roles: Readonly<Record<CategoryRole, { readonly light: Tone; readonly dark: Tone }>> = {
  /** Labels and icons on page, raised, and overlay surfaces. */
  text: { light: { lightness: 0.47, chroma: 0.16 }, dark: { lightness: 0.82, chroma: 0.12 } },
  /** A quiet wash behind category content. */
  surface: {
    light: { lightness: 0.93, chroma: 0.045 },
    dark: { lightness: 0.32, chroma: 0.07, alpha: 0.55 },
  },
  /** Swatches, edges, rules, dots, and other marks of the category. */
  line: { light: { lightness: 0.58, chroma: 0.17 }, dark: { lightness: 0.72, chroma: 0.15 } },
  /** A glyph on a `line` fill, such as the check of a picked swatch. It has 3.6:1 or more on the fill. */
  onLine: { light: { lightness: 1, chroma: 0 }, dark: { lightness: 0.2, chroma: 0.02 } },
};

function oklch(tone: Tone, hue: number): string {
  const alpha = tone.alpha === undefined ? "" : ` / ${tone.alpha}`;
  return `oklch(${tone.lightness} ${tone.chroma} ${hue}${alpha})`;
}

/** The palette entry of a key. It throws for a key that is not in the palette, such as stale stored data. */
export function categoryEntry(key: CategoryColor): (typeof categoryColors)[number] {
  const entry = categoryColors.find((candidate) => candidate.key === key);
  if (entry === undefined) throw new RangeError(`"${key}" is not a category color.`);
  return entry;
}

/** The color of one role for a category color of the palette. */
export function categoryColor(key: CategoryColor, role: CategoryRole): string {
  const { hue } = categoryEntry(key);
  const { light, dark } = roles[role];
  return `light-dark(${oklch(light, hue)}, ${oklch(dark, hue)})`;
}
