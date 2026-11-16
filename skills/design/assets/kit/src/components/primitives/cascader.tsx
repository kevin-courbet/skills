// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the design skill.
/**
 * A choice of one option from a tree, such as a region, a country, and a city, in columns that open as people move.
 *
 * @layer primitive
 * @keywords cascader, cascading select, hierarchical select, nested select, tree select, region country city, category path, team and service
 * @related Select, ComboBox, Tree, TextField
 * @notes form-choices, form-fields, kit-forms
 *
 * Use it when the answer is a path in a hierarchy. Do not use it for a flat
 * list: use `Select`, or `ComboBox` when people type the name. To show or
 * edit the hierarchy itself, use `Tree`.
 *
 * ## Behavior
 * The field does these things. Do not build them again:
 * - A popover shows one column for each level. Arrow keys move in a column,
 *   Right opens a branch, Left goes back, and Enter chooses.
 * - The search box finds options at every level. It shows by default when
 *   the tree has more than 12 options in all.
 * - The trigger shows the labels of the path, such as "Europe / France / Lyon".
 * - The height follows the control size of its row.
 * - A `value` with an unknown id throws an error.
 *
 * ## Rules
 * - Give the field a `width` from its answer. See
 *   `design read kit-forms`.
 * - The field has no error message. Validate the path before the submit, or
 *   show the error in an `ErrorSummary`.
 *
 * ## Example
 * ```tsx
 * <Cascader
 *   label="Location"
 *   options={regions}
 *   value={location}
 *   onChange={setLocation}
 *   width="lg"
 * />
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { Check, ChevronDown, ChevronRight, Search } from "lucide-react";
import { type KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  SearchField,
  useFilter,
} from "react-aria-components";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import {
  control,
  field,
  FieldDescription,
  FieldLabel,
  type FieldWidth,
  fieldWidth,
} from "@/components/helpers/field";
import { overlay } from "@/components/helpers/overlay";
import { useControlSize } from "@/components/helpers/control-size";
import { useOverlayDensity } from "@/components/helpers/density";

export interface CascaderOption {
  /** Unique among its siblings. The value is the path of ids from the root. */
  readonly id: string;
  /** Visible text of the option. */
  readonly label: string;
  /** The options one level down. An option with children is a branch. */
  readonly children?: ReadonlyArray<CascaderOption>;
  /** Shows the option but people cannot choose it or open it. */
  readonly isDisabled?: boolean;
}

export interface CascaderProps {
  /** Visible name of the field, in sentence case. */
  readonly label: string;
  /** Hide the visible label in dense toolbars. Screen readers keep it. */
  readonly hideLabel?: boolean;
  /** The options of the top level, with their children. */
  readonly options: ReadonlyArray<CascaderOption>;
  /** Path of ids from the root to the chosen option, or null. */
  readonly value: ReadonlyArray<string> | null;
  /** Receives the path of ids to the chosen option. */
  readonly onChange: (path: ReadonlyArray<string>) => void;
  /** Lets people choose an option that has children, such as a whole region. */
  readonly allowsBranchSelection?: boolean;
  /** Shows a search box that finds options at every level. Defaults to on above 12 options. */
  readonly isSearchable?: boolean;
  /** Text of the trigger while no option is chosen. */
  readonly placeholder?: string;
  /** Hint between the label and the control. */
  readonly description?: string;
  /** Marks the label "optional" when people may leave the field empty. */
  readonly isOptional?: boolean;
  /** Control width from the expected length of the answer. See FieldWidth. */
  readonly width?: FieldWidth;
  /** StyleX styles for the root, such as a margin from the parent layout. */
  readonly style?: StyleXStyles;
}

interface FlatOption {
  readonly path: ReadonlyArray<string>;
  readonly labels: ReadonlyArray<string>;
  readonly option: CascaderOption;
}

const searchThreshold = 12;
const pathSeparator = " / ";

export function Cascader({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
  allowsBranchSelection = false,
  isSearchable,
  placeholder = "Select",
  description,
  isOptional = false,
  width = "full",
  style,
}: CascaderProps) {
  const controlSize = useControlSize();
  const overlayDensity = useOverlayDensity();
  const labelId = useId();
  const valueId = useId();
  const descriptionId = useId();
  const [isOpen, setOpen] = useState(false);
  const flat = flatten(options);
  const selected = value === null ? null : resolvePath(options, value);
  const searchable = isSearchable ?? flat.length > searchThreshold;
  return (
    <div {...stylex.props(field.root, style)}>
      <FieldLabel id={labelId} elementType="span" isOptional={isOptional} isHidden={hideLabel}>
        {label}
      </FieldLabel>
      <FieldDescription id={descriptionId}>{description}</FieldDescription>
      <DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
        <AriaButton
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={description ? descriptionId : undefined}
          {...stylex.props(
            control.base,
            styles.trigger,
            fieldWidth[width],
            controlSize === "sm" && control.compact,
          )}
        >
          <span
            id={valueId}
            {...stylex.props(styles.value, selected === null && control.placeholder)}
          >
            {selected === null ? placeholder : selected.labels.join(pathSeparator)}
          </span>
          <ChevronDown aria-hidden {...stylex.props(styles.chevron)} />
        </AriaButton>
        <Popover
          placement="bottom start"
          {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
            ...overlayDensity,
            overlay.popover,
            styles.popover,
            state.isEntering && overlay.entering,
            state.isExiting && overlay.exiting,
          ])}
        >
          <Dialog aria-label={label} {...stylex.props(styles.dialog)}>
            <CascaderPanel
              label={label}
              options={options}
              flat={flat}
              value={value}
              allowsBranchSelection={allowsBranchSelection}
              searchable={searchable}
              onChoose={(path) => {
                onChange(path);
                setOpen(false);
              }}
            />
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
}

function CascaderPanel({
  label,
  options,
  flat,
  value,
  allowsBranchSelection,
  searchable,
  onChoose,
}: {
  readonly label: string;
  readonly options: ReadonlyArray<CascaderOption>;
  readonly flat: ReadonlyArray<FlatOption>;
  readonly value: ReadonlyArray<string> | null;
  readonly allowsBranchSelection: boolean;
  readonly searchable: boolean;
  readonly onChoose: (path: ReadonlyArray<string>) => void;
}) {
  const [activePath, setActivePath] = useState<ReadonlyArray<string>>(value ?? []);
  const [query, setQuery] = useState("");
  const columnRefs = useRef<Array<HTMLDivElement | null>>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { contains } = useFilter({ sensitivity: "base" });
  const columns = columnsFor(options, activePath);
  const valueKey = value?.join("\u0000");

  // Reads refs only, so one function serves every render.
  const focusColumn = useCallback(
    (index: number, id?: string) =>
      requestAnimationFrame(() => {
        const column = columnRefs.current[index];
        const target =
          (id === undefined
            ? null
            : column?.querySelector<HTMLElement>(`[data-cascader-id="${CSS.escape(id)}"]`)) ??
          column?.querySelector<HTMLElement>('[role="option"]:not([aria-disabled="true"])');
        target?.focus();
      }),
    [],
  );

  // Open at the chosen option, or at the first option when there is no search box to focus.
  const opening = useRef({ value, searchable });
  useEffect(() => {
    const { value: initial, searchable: hasSearch } = opening.current;
    if (initial !== null && initial.length > 0) focusColumn(initial.length - 1, initial.at(-1));
    else if (!hasSearch) focusColumn(0);
  }, [focusColumn]);

  const choose = (level: number, option: CascaderOption) => {
    const path = [...activePath.slice(0, level), option.id];
    const isBranch = (option.children?.length ?? 0) > 0;
    if (isBranch && !allowsBranchSelection) {
      setActivePath(path);
      focusColumn(level + 1);
      return;
    }
    onChoose(path);
  };

  const onColumnKeyDown = (level: number) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      const branch = columns[level + 1];
      if (branch === undefined) return;
      event.preventDefault();
      focusColumn(level + 1);
    } else if (event.key === "ArrowLeft" && level > 0) {
      event.preventDefault();
      focusColumn(level - 1, activePath[level - 1]);
    }
  };

  const results =
    query.trim() === ""
      ? []
      : flat.filter(
          (entry) =>
            (allowsBranchSelection || (entry.option.children?.length ?? 0) === 0) &&
            contains(entry.labels.join(pathSeparator), query.trim()),
        );

  return (
    <div {...stylex.props(styles.panel)}>
      {searchable ? (
        <SearchField
          aria-label={`Search ${label.toLowerCase()}`}
          value={query}
          onChange={setQuery}
          autoFocus
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" || results.length === 0) return;
            event.preventDefault();
            resultsRef.current?.querySelector<HTMLElement>('[role="option"]')?.focus();
          }}
          {...stylex.props(styles.search)}
        >
          <Search aria-hidden {...stylex.props(styles.icon)} />
          <Input placeholder="Search all levels" {...stylex.props(styles.searchInput)} />
        </SearchField>
      ) : null}
      {query.trim() === "" ? (
        <div {...stylex.props(styles.columns)}>
          {columns.map((items, level) => (
            <div
              key={activePath.slice(0, level).join("/") || "root"}
              ref={(element) => {
                columnRefs.current[level] = element;
              }}
              role="presentation"
              onKeyDown={onColumnKeyDown(level)}
              {...stylex.props(styles.column)}
            >
              <ListBox
                aria-label={level === 0 ? label : labelAt(options, activePath.slice(0, level))}
                items={items}
                dependencies={[activePath, valueKey]}
                {...stylex.props(styles.list)}
              >
                {(option) => {
                  const isBranch = (option.children?.length ?? 0) > 0;
                  const isActive = activePath[level] === option.id;
                  const isChosen =
                    valueKey !== undefined &&
                    valueKey === [...activePath.slice(0, level), option.id].join("\u0000");
                  return (
                    <ListBoxItem
                      id={option.id}
                      textValue={option.label}
                      isDisabled={option.isDisabled}
                      data-cascader-id={option.id}
                      aria-label={isBranch ? `${option.label}, has options` : undefined}
                      onFocus={() => setActivePath([...activePath.slice(0, level), option.id])}
                      onHoverStart={() => {
                        if (isBranch) setActivePath([...activePath.slice(0, level), option.id]);
                      }}
                      onAction={() => choose(level, option)}
                      {...renderStyles<{ isFocused: boolean; isDisabled: boolean }>((state) => [
                        styles.item,
                        isActive && styles.itemActive,
                        state.isFocused && styles.itemFocused,
                        state.isDisabled && styles.itemDisabled,
                      ])}
                    >
                      <span {...stylex.props(styles.itemLabel)}>{option.label}</span>
                      {isChosen ? <Check aria-hidden {...stylex.props(styles.check)} /> : null}
                      {isBranch ? (
                        <ChevronRight aria-hidden {...stylex.props(styles.branchIcon)} />
                      ) : null}
                    </ListBoxItem>
                  );
                }}
              </ListBox>
            </div>
          ))}
        </div>
      ) : (
        <div ref={resultsRef}>
          <ListBox
            aria-label={`${label} results`}
            items={results.map((entry) => ({ ...entry, id: entry.path.join("\u0000") }))}
            renderEmptyState={() => <p {...stylex.props(styles.empty)}>No options match.</p>}
            {...stylex.props(styles.list, styles.results)}
          >
            {(entry) => (
              <ListBoxItem
                id={entry.id}
                textValue={entry.labels.join(pathSeparator)}
                isDisabled={entry.option.isDisabled}
                onAction={() => onChoose(entry.path)}
                {...renderStyles<{ isFocused: boolean; isDisabled: boolean }>((state) => [
                  styles.item,
                  state.isFocused && styles.itemFocused,
                  state.isDisabled && styles.itemDisabled,
                ])}
              >
                <span {...stylex.props(styles.itemLabel)}>
                  {entry.labels.slice(0, -1).map((ancestor) => (
                    <span key={ancestor} {...stylex.props(styles.ancestor)}>
                      {ancestor}
                      {pathSeparator}
                    </span>
                  ))}
                  {entry.option.label}
                </span>
              </ListBoxItem>
            )}
          </ListBox>
        </div>
      )}
    </div>
  );
}

/** The option lists to show: the roots, then the children of each active branch. */
function columnsFor(
  options: ReadonlyArray<CascaderOption>,
  activePath: ReadonlyArray<string>,
): ReadonlyArray<ReadonlyArray<CascaderOption>> {
  const columns: Array<ReadonlyArray<CascaderOption>> = [options];
  let level = options;
  for (const id of activePath) {
    const option = level.find((candidate) => candidate.id === id);
    const children = option?.children;
    if (children === undefined || children.length === 0) break;
    columns.push(children);
    level = children;
  }
  return columns;
}

function labelAt(options: ReadonlyArray<CascaderOption>, path: ReadonlyArray<string>): string {
  return resolvePath(options, path).labels.join(pathSeparator);
}

/** Resolves a value path to its labels. An unknown id is a bug in the caller's data. */
function resolvePath(
  options: ReadonlyArray<CascaderOption>,
  path: ReadonlyArray<string>,
): { readonly labels: ReadonlyArray<string> } {
  const labels: Array<string> = [];
  let level: ReadonlyArray<CascaderOption> = options;
  for (const id of path) {
    const option = level.find((candidate) => candidate.id === id);
    if (option === undefined)
      throw new Error(`Cascader value "${path.join(" > ")}" has the unknown id "${id}".`);
    labels.push(option.label);
    level = option.children ?? [];
  }
  return { labels };
}

function flatten(
  options: ReadonlyArray<CascaderOption>,
  path: ReadonlyArray<string> = [],
  labels: ReadonlyArray<string> = [],
): ReadonlyArray<FlatOption> {
  return options.flatMap((option) => {
    const entry: FlatOption = {
      path: [...path, option.id],
      labels: [...labels, option.label],
      option,
    };
    return [entry, ...flatten(option.children ?? [], entry.path, entry.labels)];
  });
}

const styles = stylex.create({
  trigger: {
    justifyContent: "space-between",
    gap: space.sm,
    cursor: "pointer",
    textAlign: "start",
    fontFamily: "inherit",
  },
  value: {
    flex: "1",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chevron: { width: size.icon, height: size.icon, flexShrink: 0, color: color.textMuted },
  popover: { maxWidth: "calc(100vw - 1rem)" },
  dialog: { outlineStyle: "none" },
  panel: { display: "flex", flexDirection: "column", minWidth: "12rem" },
  search: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    height: size.controlMd,
    paddingInline: space.md,
    color: color.textMuted,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  searchInput: {
    flex: "1",
    minWidth: 0,
    borderStyle: "none",
    backgroundColor: "transparent",
    color: color.text,
    fontFamily: "inherit",
    fontSize: font.md,
    outlineStyle: "none",
  },
  icon: { width: size.iconSm, height: size.iconSm, flexShrink: 0 },
  columns: { display: "flex", overflowX: "auto" },
  column: {
    width: "11rem",
    flexShrink: 0,
    borderInlineStartWidth: { default: "1px", ":first-child": 0 },
    borderInlineStartStyle: "solid",
    borderInlineStartColor: color.borderSubtle,
  },
  list: { outlineStyle: "none", maxHeight: "18rem", overflow: "auto", padding: space.xs },
  results: { width: "22rem", maxWidth: "100%" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    minHeight: size.controlSm,
    paddingBlock: "0.375rem",
    paddingInline: space.sm,
    borderRadius: radius.sm,
    fontSize: font.md,
    color: color.text,
    cursor: "default",
    outlineStyle: "none",
  },
  itemActive: { backgroundColor: color.selected },
  itemFocused: { backgroundColor: color.subtle, boxShadow: `inset 0 0 0 1px ${color.border}` },
  itemDisabled: { opacity: "0.5" },
  itemLabel: {
    flex: "1",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  ancestor: { color: color.textMuted },
  check: { width: size.iconSm, height: size.iconSm, flexShrink: 0, color: color.accentText },
  branchIcon: { width: size.iconSm, height: size.iconSm, flexShrink: 0, color: color.textMuted },
  empty: { margin: 0, padding: space.md, fontSize: font.md, color: color.textMuted },
});
