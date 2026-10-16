// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import * as stylex from "@stylexjs/stylex";
import { parseDate } from "@internationalized/date";
import { ChevronLeft, ListFilter, Search, X } from "lucide-react";
import { Fragment, type ReactNode, useRef, useState } from "react";
import {
  Autocomplete,
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Form,
  Input,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  SearchField,
  useFilter,
} from "react-aria-components";
import { appLocale } from "@/lib/locale";
import {
  type ActiveFilter,
  type FilterField,
  type FilterOperator,
  type FilterOption,
  filterOperators,
  findFilterField,
} from "@/lib/filter-params";
import { renderStyles } from "@/lib/rac";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { Button } from "./button";
import { RangeCalendarView } from "./calendar";
import { type DateRange, DateRangePresetList, rangePanel } from "./date-range-picker";
import { field as fieldStyles } from "./field";
import { OptionList } from "./list-box";
import { overlay } from "./overlay";
import { TextField } from "./text-field";

export interface FiltersProps {
  /** Names the filter bar for screen readers, such as "Deployment filters". */
  readonly label: string;
  readonly fields: ReadonlyArray<FilterField>;
  /** Active filters, usually from `parseFilters` on the route search. */
  readonly value: ReadonlyArray<ActiveFilter>;
  /** Receives complete filters only. Write them with `serializeFilters`. */
  readonly onChange: (next: ReadonlyArray<ActiveFilter>) => void;
}

/** Option lists longer than this get a search box in the value step. */
const searchableOptionCount = 8;

/**
 * Chip bar filter builder. "Add filter" walks field, then operator (only when
 * the field has more than one), then value, and adds a complete filter. Each
 * chip edits its operator and value in place and has a remove button.
 * Fields: select, multi-select, text, and date range. One filter per field.
 */
export function Filters({ label, fields, value, onChange }: FiltersProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const activeIds = new Set(value.map((filter) => filter.field));
  const remaining = fields.filter((field) => !activeIds.has(field.id));
  const ordered = fields.flatMap((field) => value.filter((filter) => filter.field === field.id));

  // A removed chip takes the focus with it; move it to a control that stays.
  const focusBarControl = (selector: string) =>
    requestAnimationFrame(() =>
      barRef.current?.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true }),
    );

  const replace = (next: ActiveFilter) =>
    onChange(value.map((filter) => (filter.field === next.field ? next : filter)));

  return (
    <div ref={barRef} role="group" aria-label={label} {...stylex.props(styles.bar)}>
      {ordered.map((filter) => {
        const field = findFilterField(fields, filter.field);
        return (
          <FilterChipControl
            key={filter.field}
            field={field}
            filter={filter}
            onChange={replace}
            onRemove={() => {
              onChange(value.filter((candidate) => candidate.field !== filter.field));
              setAnnouncement(`${field.label} filter removed.`);
              focusBarControl("[data-filters-add]");
            }}
          />
        );
      })}
      {remaining.length > 0 ? (
        <AddFilter
          fields={remaining}
          hasFilters={value.length > 0}
          onAdd={(filter) => {
            onChange([...value, filter]);
            const field = findFilterField(fields, filter.field);
            setAnnouncement(`${field.label} filter added.`);
            if (remaining.length === 1) focusBarControl("[data-filters-clear]");
          }}
        />
      ) : null}
      {value.length > 0 ? (
        <AriaButton
          data-filters-clear
          onPress={() => {
            onChange([]);
            setAnnouncement("All filters cleared.");
            focusBarControl("[data-filters-add]");
          }}
          {...stylex.props(styles.clear)}
        >
          Clear all
        </AriaButton>
      ) : null}
      <span aria-live="polite" {...stylex.props(fieldStyles.hiddenLabel)}>
        {announcement}
      </span>
    </div>
  );
}

function FilterChipControl({
  field,
  filter,
  onChange,
  onRemove,
}: {
  readonly field: FilterField;
  readonly filter: ActiveFilter;
  readonly onChange: (next: ActiveFilter) => void;
  readonly onRemove: () => void;
}) {
  const [isEditing, setEditing] = useState(false);
  const operators = filterOperators(field);
  const operator = operators.find((candidate) => candidate.id === filter.operator);
  if (operator === undefined)
    throw new Error(`Filter "${field.id}" uses the unknown operator "${filter.operator}".`);
  const valueText = filterValueText(field, filter);
  const Icon = field.icon;
  return (
    <span {...stylex.props(styles.chip)}>
      <span {...stylex.props(styles.segment, styles.fieldSegment)}>
        {Icon ? <Icon aria-hidden {...stylex.props(styles.icon)} /> : null}
        {field.label}
      </span>
      {operators.length > 1 ? (
        <MenuTrigger>
          <AriaButton
            aria-label={`${field.label} operator: ${operator.label}`}
            {...stylex.props(styles.segment, styles.segmentButton, styles.operatorSegment)}
          >
            {operator.label}
          </AriaButton>
          <OperatorMenu
            operators={operators}
            selected={operator.id}
            onSelect={(next) => onChange({ ...filter, operator: next })}
          />
        </MenuTrigger>
      ) : (
        <span {...stylex.props(styles.segment, styles.operatorSegment)}>{operator.label}</span>
      )}
      <DialogTrigger isOpen={isEditing} onOpenChange={setEditing}>
        <AriaButton
          aria-label={`${field.label} ${operator.label} ${valueText}. Change value`}
          {...stylex.props(styles.segment, styles.segmentButton, styles.valueSegment)}
        >
          <span title={valueText} {...stylex.props(styles.valueText)}>
            <FilterValueDisplay field={field} filter={filter} />
          </span>
        </AriaButton>
        <FilterPopover label={`${field.label} value`}>
          <StepHeader title={`${field.label} ${operator.label}`} />
          <ValueEditor
            field={field}
            current={filter}
            onCommit={(next) => {
              onChange({ ...next, operator: filter.operator });
              setEditing(false);
            }}
          />
        </FilterPopover>
      </DialogTrigger>
      <AriaButton
        aria-label={`Remove ${field.label} filter`}
        onPress={onRemove}
        {...stylex.props(styles.segment, styles.segmentButton, styles.remove)}
      >
        <X aria-hidden {...stylex.props(styles.icon)} />
      </AriaButton>
    </span>
  );
}

type Draft =
  | { readonly step: "field" }
  | { readonly step: "operator"; readonly field: FilterField }
  | {
      readonly step: "value";
      readonly field: FilterField;
      readonly operator: FilterOperator;
      readonly cameFromOperator: boolean;
    };

function AddFilter({
  fields,
  hasFilters,
  onAdd,
}: {
  readonly fields: ReadonlyArray<FilterField>;
  readonly hasFilters: boolean;
  readonly onAdd: (filter: ActiveFilter) => void;
}) {
  const [isOpen, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ step: "field" });

  const chooseField = (field: FilterField) => {
    const operators = filterOperators(field);
    const [only] = operators;
    if (operators.length === 1 && only !== undefined)
      setDraft({ step: "value", field, operator: only, cameFromOperator: false });
    else setDraft({ step: "operator", field });
  };

  return (
    <DialogTrigger
      isOpen={isOpen}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) setDraft({ step: "field" });
      }}
    >
      <AriaButton data-filters-add {...stylex.props(styles.add)}>
        <ListFilter aria-hidden {...stylex.props(styles.icon)} />
        {hasFilters ? "Add filter" : "Filter"}
      </AriaButton>
      <FilterPopover label="Add filter">
        <AddFilterStep
          draft={draft}
          fields={fields}
          onChooseField={chooseField}
          onChooseOperator={(field, operator) =>
            setDraft({ step: "value", field, operator, cameFromOperator: true })
          }
          onBack={(field) => {
            if (draft.step === "value" && draft.cameFromOperator)
              setDraft({ step: "operator", field });
            else setDraft({ step: "field" });
          }}
          onCommit={(filter) => {
            onAdd(filter);
            setOpen(false);
            setDraft({ step: "field" });
          }}
        />
      </FilterPopover>
    </DialogTrigger>
  );
}

function AddFilterStep({
  draft,
  fields,
  onChooseField,
  onChooseOperator,
  onBack,
  onCommit,
}: {
  readonly draft: Draft;
  readonly fields: ReadonlyArray<FilterField>;
  readonly onChooseField: (field: FilterField) => void;
  readonly onChooseOperator: (field: FilterField, operator: FilterOperator) => void;
  readonly onBack: (field: FilterField) => void;
  readonly onCommit: (filter: ActiveFilter) => void;
}) {
  if (draft.step === "field")
    return (
      <>
        <StepHeader title="Filter by" />
        <Menu
          aria-label="Filter by"
          autoFocus="first"
          shouldCloseOnSelect={false}
          items={fields}
          onAction={(key) => {
            const field = fields.find((candidate) => candidate.id === key);
            if (field !== undefined) onChooseField(field);
          }}
          {...stylex.props(styles.menu)}
        >
          {(field) => (
            <MenuItem
              id={field.id}
              textValue={field.label}
              {...renderStyles<{ isFocused: boolean }>((state) => [
                styles.menuItem,
                state.isFocused && styles.menuItemFocused,
              ])}
            >
              {field.icon ? <field.icon aria-hidden {...stylex.props(styles.menuIcon)} /> : null}
              {field.label}
            </MenuItem>
          )}
        </Menu>
      </>
    );
  if (draft.step === "operator")
    return (
      <>
        <StepHeader title={draft.field.label} onBack={() => onBack(draft.field)} />
        <Menu
          aria-label={`${draft.field.label} condition`}
          autoFocus="first"
          shouldCloseOnSelect={false}
          items={filterOperators(draft.field)}
          onAction={(key) => {
            const operator = filterOperators(draft.field).find((candidate) => candidate.id === key);
            if (operator !== undefined) onChooseOperator(draft.field, operator);
          }}
          {...stylex.props(styles.menu)}
        >
          {(operator) => (
            <MenuItem
              id={operator.id}
              textValue={operator.label}
              {...renderStyles<{ isFocused: boolean }>((state) => [
                styles.menuItem,
                state.isFocused && styles.menuItemFocused,
              ])}
            >
              {operator.label}
            </MenuItem>
          )}
        </Menu>
      </>
    );
  return (
    <>
      <StepHeader
        title={`${draft.field.label} ${draft.operator.label}`}
        onBack={() => onBack(draft.field)}
      />
      <ValueEditor
        field={draft.field}
        current={undefined}
        onCommit={(filter) => onCommit({ ...filter, operator: draft.operator.id })}
      />
    </>
  );
}

function OperatorMenu({
  operators,
  selected,
  onSelect,
}: {
  readonly operators: ReadonlyArray<FilterOperator>;
  readonly selected: string;
  readonly onSelect: (id: string) => void;
}) {
  return (
    <Popover
      placement="bottom start"
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
        overlay.popover,
        styles.popover,
        state.isEntering && overlay.entering,
        state.isExiting && overlay.exiting,
      ])}
    >
      <Menu
        aria-label="Condition"
        items={operators}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[selected]}
        onSelectionChange={(keys) => {
          const next = operators.find((operator) => keys !== "all" && keys.has(operator.id));
          if (next !== undefined) onSelect(next.id);
        }}
        {...stylex.props(styles.menu)}
      >
        {(operator) => (
          <MenuItem
            id={operator.id}
            textValue={operator.label}
            {...renderStyles<{ isFocused: boolean; isSelected: boolean }>((state) => [
              styles.menuItem,
              state.isFocused && styles.menuItemFocused,
              state.isSelected && styles.menuItemSelected,
            ])}
          >
            {operator.label}
          </MenuItem>
        )}
      </Menu>
    </Popover>
  );
}

function FilterPopover({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <Popover
      placement="bottom start"
      {...renderStyles<{ isEntering: boolean; isExiting: boolean }>((state) => [
        overlay.popover,
        styles.popover,
        state.isEntering && overlay.entering,
        state.isExiting && overlay.exiting,
      ])}
    >
      <Dialog aria-label={label} {...stylex.props(styles.dialog)}>
        {children}
      </Dialog>
    </Popover>
  );
}

function StepHeader({ title, onBack }: { readonly title: string; readonly onBack?: () => void }) {
  return (
    <div {...stylex.props(styles.stepHeader)}>
      {onBack ? (
        <AriaButton aria-label="Back" onPress={onBack} {...stylex.props(styles.back)}>
          <ChevronLeft aria-hidden {...stylex.props(styles.icon)} />
        </AriaButton>
      ) : null}
      <span {...stylex.props(styles.stepTitle)}>{title}</span>
    </div>
  );
}

/** Edits the value of one field. `current` is the filter being changed, or undefined for a new one. */
function ValueEditor({
  field,
  current,
  onCommit,
}: {
  readonly field: FilterField;
  readonly current: ActiveFilter | undefined;
  /** The operator is set by the caller. */
  readonly onCommit: (filter: ActiveFilter) => void;
}) {
  const operator = current?.operator ?? "";
  switch (field.kind) {
    case "select":
      return (
        <SearchableOptions field={field} options={field.options}>
          <OptionList
            aria-label={field.label}
            options={field.options}
            autoFocus={field.options.length > searchableOptionCount ? undefined : "first"}
            selectionMode="single"
            escapeKeyBehavior="none"
            selectedKeys={current?.kind === "select" ? [current.value] : []}
            onSelectionChange={(keys) => {
              const option = field.options.find(
                (candidate) => keys !== "all" && keys.has(candidate.id),
              );
              if (option !== undefined)
                onCommit({ kind: "select", field: field.id, operator, value: option.id });
            }}
          />
        </SearchableOptions>
      );
    case "multiSelect":
      return (
        <MultiSelectEditor
          field={field}
          initial={current?.kind === "multiSelect" ? current.value : []}
          onCommit={(ids) =>
            onCommit({ kind: "multiSelect", field: field.id, operator, value: ids })
          }
        />
      );
    case "text":
      return (
        <TextEditor
          label={field.label}
          placeholder={field.placeholder}
          initial={current?.kind === "text" ? current.value : ""}
          onCommit={(text) => onCommit({ kind: "text", field: field.id, operator, value: text })}
        />
      );
    case "dateRange":
      return (
        <div {...stylex.props(rangePanel.root, styles.editorBody)}>
          <DateRangePresetList
            presets={field.presets ?? []}
            onSelect={(range) =>
              onCommit({ kind: "dateRange", field: field.id, operator, value: range })
            }
          />
          <RangeCalendarView
            aria-label={field.label}
            autoFocus
            defaultValue={
              current?.kind === "dateRange"
                ? { start: parseDate(current.value.start), end: parseDate(current.value.end) }
                : undefined
            }
            onChange={(range) =>
              onCommit({
                kind: "dateRange",
                field: field.id,
                operator,
                value: { start: range.start.toString(), end: range.end.toString() },
              })
            }
          />
        </div>
      );
  }
}

/** Wraps an option list in a search box when the list is long. */
function SearchableOptions({
  field,
  options,
  children,
}: {
  readonly field: FilterField;
  readonly options: ReadonlyArray<FilterOption>;
  readonly children: ReactNode;
}) {
  const { contains } = useFilter({ sensitivity: "base" });
  if (options.length <= searchableOptionCount) return children;
  return (
    <Autocomplete filter={contains}>
      <SearchField
        aria-label={`Search ${field.label.toLowerCase()}`}
        autoFocus
        {...stylex.props(styles.search)}
      >
        <Search aria-hidden {...stylex.props(styles.icon)} />
        <Input
          placeholder={`Search ${field.label.toLowerCase()}`}
          {...stylex.props(styles.searchInput)}
        />
      </SearchField>
      {children}
    </Autocomplete>
  );
}

function MultiSelectEditor({
  field,
  initial,
  onCommit,
}: {
  readonly field: FilterField & { readonly kind: "multiSelect" };
  readonly initial: ReadonlyArray<string>;
  readonly onCommit: (ids: ReadonlyArray<string>) => void;
}) {
  const [selected, setSelected] = useState<ReadonlyArray<string>>(initial);
  return (
    <>
      <SearchableOptions field={field} options={field.options}>
        <OptionList
          aria-label={field.label}
          options={field.options}
          autoFocus={field.options.length > searchableOptionCount ? undefined : "first"}
          selectionMode="multiple"
          escapeKeyBehavior="none"
          selectedKeys={selected}
          onSelectionChange={(keys) =>
            setSelected(
              field.options
                .filter((option) => keys === "all" || keys.has(option.id))
                .map((option) => option.id),
            )
          }
        />
      </SearchableOptions>
      <div {...stylex.props(styles.editorFooter)}>
        <span {...stylex.props(styles.footerCount)}>
          {selected.length === 0 ? "None selected" : `${selected.length} selected`}
        </span>
        <Button
          intent="primary"
          size="sm"
          isDisabled={selected.length === 0}
          onPress={() => onCommit(selected)}
        >
          Apply
        </Button>
      </div>
    </>
  );
}

function TextEditor({
  label,
  placeholder,
  initial,
  onCommit,
}: {
  readonly label: string;
  readonly placeholder: string | undefined;
  readonly initial: string;
  readonly onCommit: (text: string) => void;
}) {
  const [text, setText] = useState(initial);
  const isEmpty = text.trim() === "";
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        if (!isEmpty) onCommit(text.trim());
      }}
      {...stylex.props(styles.textForm)}
    >
      <TextField
        label={label}
        hideLabel
        autoFocus
        placeholder={placeholder}
        value={text}
        onChange={setText}
      />
      <div {...stylex.props(styles.editorFooter, styles.editorFooterFlush)}>
        <span />
        <Button intent="primary" size="sm" type="submit" isDisabled={isEmpty}>
          Apply
        </Button>
      </div>
    </Form>
  );
}

/** The value as plain text, for the accessible name and the tooltip. */
function filterValueText(field: FilterField, filter: ActiveFilter): string {
  switch (filter.kind) {
    case "select":
      return optionLabel(field, filter.value);
    case "multiSelect":
      return filter.value.map((id) => optionLabel(field, id)).join(", ");
    case "text":
      return `"${filter.value}"`;
    case "dateRange":
      return formatRange(filter.value);
  }
}

function FilterValueDisplay({
  field,
  filter,
}: {
  readonly field: FilterField;
  readonly filter: ActiveFilter;
}) {
  if (filter.kind !== "select" && filter.kind !== "multiSelect")
    return filterValueText(field, filter);
  const ids = filter.kind === "select" ? [filter.value] : filter.value;
  return ids.map((id, index) => {
    const option = findOption(field, id);
    return (
      <Fragment key={id}>
        {index > 0 ? ", " : null}
        {option.intent === undefined ? null : (
          <span aria-hidden {...stylex.props(styles.valueDot, dots[option.intent])} />
        )}
        {option.label}
      </Fragment>
    );
  });
}

function findOption(field: FilterField, id: string): FilterOption {
  if (field.kind !== "select" && field.kind !== "multiSelect")
    throw new Error(`Filter field "${field.id}" has no options.`);
  const option = field.options.find((candidate) => candidate.id === id);
  if (option === undefined) throw new Error(`"${id}" is not an option of filter "${field.id}".`);
  return option;
}

function optionLabel(field: FilterField, id: string): string {
  return findOption(field, id).label;
}

function formatDay(iso: string, withYear: boolean): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(appLocale, {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: withYear ? "numeric" : undefined,
  });
}

function formatRange(range: DateRange): string {
  const sameYear = range.start.slice(0, 4) === range.end.slice(0, 4);
  if (range.start === range.end) return formatDay(range.start, true);
  return `${formatDay(range.start, !sameYear)} – ${formatDay(range.end, true)}`;
}

const chipHeight = size.controlSm;

const styles = stylex.create({
  bar: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: space.sm, minWidth: 0 },
  chip: {
    display: "inline-flex",
    alignItems: "stretch",
    height: chipHeight,
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.raised,
    fontSize: font.sm,
  },
  segment: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    paddingInline: space.sm,
    whiteSpace: "nowrap",
    color: color.text,
    borderWidth: 0,
    borderInlineStartWidth: { default: "1px", ":first-child": 0 },
    borderStyle: "solid",
    borderColor: color.borderSubtle,
  },
  segmentButton: {
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    fontFamily: "inherit",
    fontSize: "inherit",
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "-2px",
  },
  fieldSegment: { fontWeight: font.medium },
  operatorSegment: { color: color.textMuted },
  valueSegment: { minWidth: 0, fontWeight: font.medium },
  valueText: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3em",
    maxWidth: "16rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  valueDot: {
    display: "inline-block",
    width: "0.5rem",
    height: "0.5rem",
    flexShrink: 0,
    borderRadius: radius.full,
  },
  remove: { paddingInline: space.xs, color: { default: color.textMuted, ":hover": color.text } },
  icon: { width: size.iconSm, height: size.iconSm, flexShrink: 0 },
  add: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    height: chipHeight,
    paddingInline: space.sm,
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: color.borderStrong,
    borderRadius: radius.md,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: color.text,
    fontFamily: "inherit",
    fontSize: font.sm,
    fontWeight: font.medium,
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
    outlineOffset: "1px",
  },
  clear: {
    height: chipHeight,
    paddingInline: space.sm,
    borderStyle: "none",
    borderRadius: radius.md,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: { default: color.textMuted, ":hover": color.text },
    fontFamily: "inherit",
    fontSize: font.sm,
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  popover: { minWidth: "14rem", maxWidth: "calc(100vw - 2rem)" },
  dialog: { display: "flex", flexDirection: "column", outlineStyle: "none" },
  stepHeader: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    minHeight: "2.25rem",
    paddingInline: space.sm,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  stepTitle: { fontSize: font.sm, fontWeight: font.medium, color: color.textMuted },
  back: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    borderStyle: "none",
    borderRadius: radius.sm,
    backgroundColor: { default: "transparent", ":hover": color.subtle },
    color: color.text,
    cursor: "pointer",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    outlineColor: color.focus,
  },
  menu: { outlineStyle: "none", padding: space.xs, maxHeight: "18rem", overflow: "auto" },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
    paddingBlock: "0.375rem",
    paddingInline: space.sm,
    borderRadius: radius.sm,
    fontSize: font.md,
    color: color.text,
    cursor: "default",
    outlineStyle: "none",
  },
  menuItemFocused: { backgroundColor: color.subtle },
  menuItemSelected: { fontWeight: font.medium },
  menuIcon: { width: size.icon, height: size.icon, color: color.textMuted, flexShrink: 0 },
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
  editorBody: { padding: space.md },
  editorFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    paddingBlock: space.sm,
    paddingInline: space.sm,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: color.borderSubtle,
  },
  editorFooterFlush: { paddingInline: 0, paddingBottom: 0, borderTopWidth: 0 },
  footerCount: { fontSize: font.sm, color: color.textMuted, fontVariantNumeric: "tabular-nums" },
  textForm: { display: "flex", flexDirection: "column", gap: space.sm, padding: space.md },
});

const dots = stylex.create({
  neutral: { backgroundColor: color.textFaint },
  accent: { backgroundColor: color.accent },
  success: { backgroundColor: color.success },
  warning: { backgroundColor: color.warning },
  danger: { backgroundColor: color.danger },
  info: { backgroundColor: color.info },
});
