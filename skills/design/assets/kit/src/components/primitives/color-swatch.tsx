// Derived from HeroUI (https://heroui.com), Apache License 2.0, Copyright 2025 NextUI Inc. See THIRD_PARTY_NOTICES.md in the design skill.
/**
 * A color of the category palette, as a `ColorSwatch` next to the name of a
 * category or as a `ColorSwatchPicker` that picks one palette color.
 *
 * @layer primitive
 * @keywords color swatch, color picker, pick a color, swatch picker, category color, project color, tag color, team color, color dot, palette
 * @related Select, TagGroup, RadioGroup, Badge
 * @notes kit-tokens, color, contrast, accessibility
 *
 * Use them for the color of a category, such as a project, a team, or a tag.
 * Do not use them for a status: use `Badge` or `StatusDot` with an intent.
 * The kit has no free color picker: people pick from the palette in
 * `src/styles/category.ts`, and the app stores the key, such as `"blue"`.
 *
 * ## Behavior
 * - `ColorSwatch` is a decorative circle in the `line` role of the color. It
 *   follows the theme. `Select` options and `TagGroup` tags with `color` show
 *   it before the label.
 * - `ColorSwatchPicker` is a radio group. Tab goes to the picked swatch, the
 *   arrow keys pick the next swatch, and each swatch has the name of its
 *   color, such as "Blue". The picked swatch shows a check and a ring, so the
 *   pick does not depend on the color alone.
 * - The swatches of the picker use the control size, so touch density makes
 *   them larger.
 *
 * ## Rules
 * - Always show the name of the category in text next to a `ColorSwatch`.
 * - Validate a stored key with `categoryColorKeys`. `categoryColor` throws for
 *   a key that is not in the palette.
 *
 * ## ColorSwatchPicker
 * A form field for the color of a category. Show the result where it is
 * used, such as a `TagGroup` tag next to the field.
 *
 * ## Example
 * ```tsx
 * <ColorSwatchPicker label="Project color" value={project.color} onChange={setColor} />
 * <span {...stylex.props(styles.category)}><ColorSwatch color={project.color} />{project.name}</span>
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Check } from "lucide-react";
import { Radio, RadioGroup, type RadioGroupProps } from "react-aria-components";
import { field, FieldDescription, FieldErrorMessage, FieldLabel } from "@/components/helpers/field";
import { renderStyles } from "@/lib/rac";
import {
  type CategoryColor,
  categoryColor,
  categoryColors,
  categoryEntry,
} from "@/styles/category";
import { color, media, motion, radius, size, space } from "@/styles/tokens.stylex";

export interface ColorSwatchProps {
  /** The key of a palette color, such as `"blue"`. */
  readonly color: CategoryColor;
  /** `sm` sits before a label of 12px or 13px text. `md` sits before larger text. */
  readonly size?: "sm" | "md";
}

export function ColorSwatch({ color: key, size: sizeKey = "sm" }: ColorSwatchProps) {
  return (
    <span
      aria-hidden
      {...stylex.props(
        styles.swatch,
        swatchSizes[sizeKey],
        styles.fill(categoryColor(key, "line")),
      )}
    />
  );
}

export interface ColorSwatchPickerProps extends Omit<
  RadioGroupProps,
  "className" | "style" | "children" | "value" | "defaultValue" | "onChange" | "orientation"
> {
  /** Visible name of the field, in sentence case, such as "Project color". */
  readonly label: string;
  /** The picked key, or null before people pick one. */
  readonly value: CategoryColor | null;
  /** Receives the key of the picked color. */
  readonly onChange: (value: CategoryColor) => void;
  /** The palette colors to offer, from first to last. The default is the whole palette. */
  readonly colors?: ReadonlyArray<CategoryColor>;
  /** Hint between the label and the swatches, such as where the color shows. */
  readonly description?: string;
  /** Error text under the swatches. It also marks the field invalid. */
  readonly errorMessage?: string;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

const allColors: ReadonlyArray<CategoryColor> = categoryColors.map((entry) => entry.key);

export function ColorSwatchPicker({
  label,
  value,
  onChange,
  colors = allColors,
  description,
  errorMessage,
  style,
  ...props
}: ColorSwatchPickerProps) {
  if (colors.length === 0) throw new Error("ColorSwatchPicker: give at least one color.");
  const entries = colors.map(categoryEntry);
  return (
    <RadioGroup
      {...props}
      orientation="horizontal"
      isInvalid={props.isInvalid ?? errorMessage !== undefined}
      value={value}
      onChange={(next) => {
        const entry = entries.find((candidate) => candidate.key === next);
        if (entry === undefined)
          throw new Error(`ColorSwatchPicker: "${next}" is not an offered color.`);
        onChange(entry.key);
      }}
      {...stylex.props(field.root, style)}
    >
      <FieldLabel>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <div {...stylex.props(styles.row)}>
        {entries.map((entry) => (
          <Radio
            key={entry.key}
            value={entry.key}
            aria-label={entry.label}
            {...renderStyles<{ isFocusVisible: boolean; isSelected: boolean; isDisabled: boolean }>(
              (state) => [
                styles.option,
                state.isSelected && styles.optionSelected,
                state.isFocusVisible && styles.optionFocused,
                state.isDisabled && styles.disabled,
              ],
            )}
          >
            {({ isSelected }) => (
              <span
                {...stylex.props(styles.optionFill, styles.fill(categoryColor(entry.key, "line")))}
              >
                <Check
                  aria-hidden
                  {...stylex.props(
                    styles.check,
                    styles.ink(categoryColor(entry.key, "onLine")),
                    isSelected && styles.checkShown,
                  )}
                />
              </span>
            )}
          </Radio>
        ))}
      </div>
      <FieldErrorMessage>{errorMessage}</FieldErrorMessage>
    </RadioGroup>
  );
}

const styles = stylex.create({
  swatch: { display: "inline-block", flexShrink: 0, borderRadius: radius.full },
  fill: (value: string) => ({ backgroundColor: value }),
  ink: (value: string) => ({ color: value }),
  row: { display: "flex", flexWrap: "wrap", gap: space.xs },
  option: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.controlSm,
    height: size.controlSm,
    borderRadius: radius.full,
    // The ring of the picked swatch sits on the surface, 2px outside the fill, so it shows next to each color.
    boxShadow: "inset 0 0 0 2px transparent",
    cursor: "pointer",
    outlineStyle: "none",
    transitionProperty: "box-shadow",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  optionSelected: { boxShadow: `inset 0 0 0 2px ${color.text}` },
  optionFocused: {
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
  optionFill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "calc(100% - 8px)",
    height: "calc(100% - 8px)",
    borderRadius: radius.full,
  },
  check: {
    width: size.iconSm,
    height: size.iconSm,
    strokeWidth: 3,
    opacity: 0,
    transform: { default: "scale(0.6)", [media.reducedMotion]: "none" },
    transitionProperty: "opacity, transform",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.easeOut,
  },
  checkShown: { opacity: 1, transform: "none" },
  disabled: { opacity: "0.5", cursor: "default" },
});

const swatchSizes = stylex.create({
  sm: { width: "0.625rem", height: "0.625rem" },
  md: { width: "0.875rem", height: "0.875rem" },
});
