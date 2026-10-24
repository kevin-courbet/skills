/**
 * Colors for categories that a hue identifies, such as projects, teams, or tags.
 * Every category shares the same lightness and chroma per role, so only the hue
 * tells categories apart and no category outranks another.
 *
 * Each value follows the active theme through `light-dark()`, which reads the
 * `color-scheme` that AppDocument and the explicit themes set from `color.scheme`.
 * Apply a value through a StyleX style function.
 */
export type CategoryRole = "text" | "surface" | "line";

interface Tone {
  readonly lightness: number;
  readonly chroma: number;
  readonly alpha?: number;
}

const roles: Readonly<Record<CategoryRole, { readonly light: Tone; readonly dark: Tone }>> = {
  /** Labels and icons on page, raised, and overlay surfaces. */
  text: { light: { lightness: 0.5, chroma: 0.16 }, dark: { lightness: 0.82, chroma: 0.12 } },
  /** A quiet wash behind category content. */
  surface: {
    light: { lightness: 0.93, chroma: 0.045 },
    dark: { lightness: 0.32, chroma: 0.07, alpha: 0.55 },
  },
  /** Edges, rules, dots, and other strokes that mark the category. */
  line: { light: { lightness: 0.6, chroma: 0.17 }, dark: { lightness: 0.72, chroma: 0.15 } },
};

function oklch(tone: Tone, hue: number): string {
  const alpha = tone.alpha === undefined ? "" : ` / ${tone.alpha}`;
  return `oklch(${tone.lightness} ${tone.chroma} ${hue}${alpha})`;
}

/** The color of one role for the category with this hue, in degrees from 0 to 360. */
export function categoryColor(hue: number, role: CategoryRole): string {
  if (!Number.isFinite(hue) || hue < 0 || hue > 360) {
    throw new RangeError(`A category hue must be between 0 and 360 degrees, not ${hue}.`);
  }
  const { light, dark } = roles[role];
  return `light-dark(${oklch(light, hue)}, ${oklch(dark, hue)})`;
}
