import * as stylex from "@stylexjs/stylex";
import { CircleAlert } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { color, container, font, layer, media, radius, size, space } from "@/styles/tokens.stylex";

export interface FormLayoutProps {
  /** The id that a submit button outside the form points to with `form`. */
  readonly id?: string;
  /** Runs on submit. The form never reloads the page and never shows browser validation bubbles. */
  readonly onSubmit: () => void;
  /** The accessible name of the form, when the page heading does not name it. */
  readonly "aria-label"?: string;
  /** ErrorSummary, then one `Section layout="split"` for each part of the form. */
  readonly children: ReactNode;
  /**
   * A FormPreview of the tangible thing that the form produces, such as a
   * printed badge or an invoice. Leave it out when the form only changes a
   * record in the app.
   */
  readonly preview?: ReactNode;
  /** A FormFooter with the summary and the submit button. */
  readonly footer?: ReactNode;
}

/**
 * Page layout for a long form. The sections take the main column, the preview
 * stays in view beside them on wide screens and goes under them on narrow
 * ones, and the footer sticks to the bottom of the window. Put a short form
 * in a Dialog instead.
 */
export function FormLayout({
  id,
  onSubmit,
  "aria-label": ariaLabel,
  children,
  preview,
  footer,
}: FormLayoutProps) {
  return (
    <form
      id={id}
      aria-label={ariaLabel}
      // TanStack Form validates and the fields show its messages, so the browser must not.
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      {...stylex.props(styles.form)}
    >
      <div {...stylex.props(styles.grid, preview === undefined && styles.gridSingle)}>
        <div {...stylex.props(styles.main)}>{children}</div>
        {preview === undefined ? null : <div {...stylex.props(styles.side)}>{preview}</div>}
      </div>
      {footer}
    </form>
  );
}

/**
 * Fields that belong together on one line, such as a name and an email, or a
 * floor and a room. Each field keeps the width of its answer, and the row
 * wraps when it is narrow.
 */
export function FieldRow({ children }: { readonly children: ReactNode }) {
  return <div {...stylex.props(styles.fieldRow)}>{children}</div>;
}

export interface FormPreviewProps {
  /** Names the preview for assistive technology, such as "Visitor badge preview". */
  readonly label: string;
  /** One sentence under the preview, such as where the thing goes next: "Prints at the reception desk." */
  readonly description?: string;
  /**
   * An app-owned component that looks like the real thing, built from kit
   * tokens, with a quiet placeholder for each empty answer. Use a
   * DescriptionList only when the thing that the form produces is a record.
   */
  readonly children: ReactNode;
}

/**
 * The end result of the form, filled in while people type. Give it a thing
 * that people see or hold outside the form, such as a printed badge, a label,
 * an invoice, or an outgoing message, in the shape of that thing. The kit
 * gives no frame for the thing, because each kind of thing has its own shape.
 * It does not announce changes, because it changes on every key.
 */
export function FormPreview({ label, description, children }: FormPreviewProps) {
  return (
    <aside aria-label={label} {...stylex.props(styles.preview)}>
      {children}
      {description === undefined ? null : (
        <p {...stylex.props(styles.previewDescription)}>{description}</p>
      )}
    </aside>
  );
}

export interface FormFooterProps {
  /** Live facts about the answers, such as a count or a total. Short text that fits one line. */
  readonly summary?: ReactNode;
  /** A quiet cancel action, then the primary submit Button with `type="submit"`. */
  readonly children: ReactNode;
}

/** Bar at the bottom of the window that keeps the summary and the submit button in view. */
export function FormFooter({ summary, children }: FormFooterProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const footer = ref.current;
    if (footer === null) return;
    // The browser scrolls a focused field clear of the scroll padding, so the bar never covers it.
    const scroller = scrollContainer(footer);
    const previous = scroller.style.scrollPaddingBlockEnd;
    const observer = new ResizeObserver(() => {
      scroller.style.scrollPaddingBlockEnd = `${footer.offsetHeight}px`;
    });
    observer.observe(footer);
    return () => {
      observer.disconnect();
      scroller.style.scrollPaddingBlockEnd = previous;
    };
  }, []);
  return (
    <div ref={ref} {...stylex.props(styles.footer)}>
      <div {...stylex.props(styles.footerInner)}>
        <div {...stylex.props(styles.footerSummary)}>{summary}</div>
        <div {...stylex.props(styles.footerActions)}>{children}</div>
      </div>
    </div>
  );
}

function scrollContainer(element: HTMLElement): HTMLElement {
  for (let parent = element.parentElement; parent !== null; parent = parent.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(parent).overflowY)) return parent;
  }
  return document.documentElement;
}

export interface FormError {
  /** The id of the field. The link moves focus to the field. */
  readonly fieldId: string;
  /** The same message as the field shows: what is wrong and how to fix it. */
  readonly message: string;
}

export interface ErrorSummaryProps {
  /** Counts the problems and names the action, such as "2 things to fix before you send the request". */
  readonly title: string;
  /** The errors in the order of the fields on the page. */
  readonly errors: ReadonlyArray<FormError>;
  /**
   * The number of submit attempts. The summary takes focus each time it
   * changes while errors remain, so people hear the problems at once.
   */
  readonly submitCount: number;
}

const focusableSelector = [
  'input:not([type="hidden"]):not([tabindex="-1"]):not([disabled])',
  "textarea:not([disabled])",
  'button:not([tabindex="-1"]):not([disabled])',
  '[tabindex="0"]',
].join(", ");

/**
 * The list of problems after a failed submit, at the top of the form. Each
 * item links to its field. Show it only after a submit attempt; it renders
 * nothing when no errors remain.
 */
export function ErrorSummary({ title, errors, submitCount }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const focusedAttempt = useRef(0);
  const hasErrors = errors.length > 0;
  useEffect(() => {
    // Focus moves on a new submit attempt only, never while people fix the fields.
    if (!hasErrors || submitCount === focusedAttempt.current) return;
    focusedAttempt.current = submitCount;
    ref.current?.focus();
  }, [hasErrors, submitCount]);
  if (!hasErrors) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      role="group"
      {...stylex.props(styles.summary)}
    >
      <CircleAlert aria-hidden {...stylex.props(styles.summaryIcon)} />
      <div {...stylex.props(styles.summaryBody)}>
        <h2 id={titleId} {...stylex.props(styles.summaryTitle)}>
          {title}
        </h2>
        <ul {...stylex.props(styles.summaryList)}>
          {errors.map((error) => (
            <li key={error.fieldId}>
              <a
                href={`#${error.fieldId}`}
                onClick={(event) => {
                  event.preventDefault();
                  focusField(error.fieldId);
                }}
                {...stylex.props(styles.summaryLink)}
              >
                {error.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function focusField(fieldId: string) {
  const target = document.getElementById(fieldId);
  if (target === null) throw new Error(`ErrorSummary: no element has the id "${fieldId}".`);
  const control = target.matches(focusableSelector)
    ? target
    : target.querySelector<HTMLElement>(focusableSelector);
  if (control === null)
    throw new Error(`ErrorSummary: the element "${fieldId}" holds no control that can take focus.`);
  control.focus({ preventScroll: true });
  // The label sits above the control, so center the field to show the label and the message.
  target.scrollIntoView({ block: "center" });
}

const styles = stylex.create({
  // The form is the container, so the preview column follows the width of the form, not the window.
  form: {
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    gap: space.xxxl,
    minWidth: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) minmax(16rem, 20rem)",
      [container.belowLg]: "minmax(0, 1fr)",
    },
    columnGap: space.xxxl,
    rowGap: space.xxxl,
    alignItems: "start",
  },
  gridSingle: { gridTemplateColumns: "minmax(0, 1fr)" },
  main: { display: "flex", flexDirection: "column", gap: space.xxl, minWidth: 0 },
  side: {
    position: { default: "sticky", [container.belowLg]: "static" },
    top: space.xxl,
    minWidth: 0,
  },
  fieldRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    columnGap: space.xl,
    rowGap: space.xxl,
  },
  preview: { display: "flex", flexDirection: "column", gap: space.md },
  previewDescription: {
    margin: 0,
    fontSize: font.sm,
    lineHeight: font.leadingNormal,
    color: color.textMuted,
  },
  footer: {
    position: "sticky",
    bottom: 0,
    zIndex: layer.sticky,
    // Bleeds over the Page padding so the bar meets the edges and the bottom of the window.
    marginInline: { default: `calc(-1 * ${space.lg})`, [media.md]: `calc(-1 * ${space.xxl})` },
    marginBottom: { default: `calc(-1 * ${space.lg})`, [media.md]: `calc(-1 * ${space.xxl})` },
    paddingInline: { default: space.lg, [media.md]: space.xxl },
    paddingBlock: space.md,
    backgroundColor: color.page,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.border,
  },
  footerInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    columnGap: space.xl,
    rowGap: space.sm,
  },
  footerSummary: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: space.lg,
    rowGap: space.xs,
    minWidth: 0,
    fontSize: font.sm,
    color: color.textMuted,
    fontVariantNumeric: "tabular-nums",
  },
  footerActions: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    marginInlineStart: "auto",
  },
  summary: {
    display: "flex",
    alignItems: "flex-start",
    gap: space.md,
    padding: space.lg,
    backgroundColor: color.dangerMuted,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.dangerBorder,
    borderRadius: radius.lg,
    outlineStyle: { default: "none", ":focus": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
    // Keeps the summary clear of the window edge when it takes focus.
    scrollMarginBlock: space.xxl,
  },
  summaryIcon: {
    flexShrink: 0,
    width: size.icon,
    height: size.icon,
    marginTop: "0.125rem",
    color: color.danger,
  },
  summaryBody: { display: "flex", flexDirection: "column", gap: space.sm, minWidth: 0 },
  summaryTitle: {
    margin: 0,
    fontSize: font.md,
    fontWeight: font.semibold,
    lineHeight: font.leadingNormal,
    color: color.text,
  },
  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  summaryLink: {
    fontSize: font.md,
    lineHeight: font.leadingNormal,
    color: color.danger,
    textDecorationLine: "underline",
    textUnderlineOffset: "0.2em",
    textDecorationThickness: { default: "1px", ":hover": "2px" },
    borderRadius: radius.sm,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "2px",
  },
});
