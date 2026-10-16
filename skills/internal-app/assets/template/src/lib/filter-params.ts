// Derived from ReUI (https://reui.io), MIT License, Copyright (c) 2025 Keenthemes Inc. See THIRD_PARTY_NOTICES.md in the internal-app skill.
import { Schema } from "effect";
import type { LucideIcon } from "lucide-react";
import type { BadgeIntent } from "@/components/ui/badge";
import type { DateRange, DateRangePreset } from "@/components/ui/date-range-picker";

/**
 * Field definitions, values, and the URL codec of the Filters chip bar. The
 * functions here are pure: routes validate filter params with
 * `filterSearchFields`, read them with `parseFilters`, and write them with
 * `serializeFilters`.
 */

export interface FilterOption {
  /** Stable id stored in the URL. Letters, digits, "_", "-", and "." only. */
  readonly id: string;
  readonly label: string;
  /** Shows a status dot before the label in the list and the chip. */
  readonly intent?: BadgeIntent;
}

export interface FilterOperator {
  /** Stable id stored in the URL when the field has more than one operator. */
  readonly id: string;
  /** Reads between the field and the value: "is", "is not", "contains". */
  readonly label: string;
}

interface FilterFieldBase {
  /** Stable id. It is also the URL param name unless `param` is set. */
  readonly id: string;
  readonly label: string;
  readonly icon?: LucideIcon;
  /** URL param name, when the id would clash with another param such as `q`. */
  readonly param?: string;
  /**
   * Operators people can choose. With one operator, the operator step is
   * skipped and the URL value has no operator prefix. Defaults to one operator
   * per kind: "is", "is", "contains", or "between".
   */
  readonly operators?: ReadonlyArray<FilterOperator>;
}

export interface SelectFilterField extends FilterFieldBase {
  readonly kind: "select";
  readonly options: ReadonlyArray<FilterOption>;
}

export interface MultiSelectFilterField extends FilterFieldBase {
  readonly kind: "multiSelect";
  readonly options: ReadonlyArray<FilterOption>;
}

export interface TextFilterField extends FilterFieldBase {
  readonly kind: "text";
  readonly placeholder?: string;
}

export interface DateRangeFilterField extends FilterFieldBase {
  readonly kind: "dateRange";
  /** Quick ranges. Compute them from a stable reference date, such as the loader's `now`. */
  readonly presets?: ReadonlyArray<DateRangePreset>;
}

export type FilterField =
  | SelectFilterField
  | MultiSelectFilterField
  | TextFilterField
  | DateRangeFilterField;

/** A complete filter. Unfinished filters never leave the Filters component. */
export type ActiveFilter =
  | {
      readonly kind: "select";
      readonly field: string;
      readonly operator: string;
      readonly value: string;
    }
  | {
      readonly kind: "multiSelect";
      readonly field: string;
      readonly operator: string;
      readonly value: ReadonlyArray<string>;
    }
  | {
      readonly kind: "text";
      readonly field: string;
      readonly operator: string;
      readonly value: string;
    }
  | {
      readonly kind: "dateRange";
      readonly field: string;
      readonly operator: string;
      readonly value: DateRange;
    };

const defaultOperators: Record<FilterField["kind"], ReadonlyArray<FilterOperator>> = {
  select: [{ id: "is", label: "is" }],
  multiSelect: [{ id: "is", label: "is" }],
  text: [{ id: "contains", label: "contains" }],
  dateRange: [{ id: "between", label: "between" }],
};

const idPattern = /^[A-Za-z0-9_.-]+$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function filterOperators(field: FilterField): ReadonlyArray<FilterOperator> {
  const operators = field.operators ?? defaultOperators[field.kind];
  if (operators.length === 0) throw new Error(`Filter field "${field.id}" has no operators.`);
  return operators;
}

export function filterParam(field: FilterField): string {
  return field.param ?? field.id;
}

export function findFilterField(fields: ReadonlyArray<FilterField>, id: string): FilterField {
  const field = fields.find((candidate) => candidate.id === id);
  if (field === undefined) throw new Error(`Filter field "${id}" is not defined.`);
  return field;
}

/** Throws on definitions that cannot round-trip through the URL. A definition error is a bug, not input. */
function assertFields(fields: ReadonlyArray<FilterField>): void {
  const params = new Set<string>();
  for (const field of fields) {
    const param = filterParam(field);
    if (params.has(param)) throw new Error(`Two filter fields use the URL param "${param}".`);
    params.add(param);
    for (const operator of filterOperators(field)) {
      if (!idPattern.test(operator.id))
        throw new Error(`Filter operator id "${operator.id}" must match ${idPattern}.`);
    }
    if (field.kind === "select" || field.kind === "multiSelect") {
      for (const option of field.options) {
        if (!idPattern.test(option.id))
          throw new Error(`Filter option id "${option.id}" must match ${idPattern}.`);
      }
    }
  }
}

function isValidDate(iso: string): boolean {
  if (!isoDatePattern.test(iso)) return false;
  const date = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso;
}

type Decoded =
  | { readonly ok: true; readonly filter: ActiveFilter }
  | { readonly ok: false; readonly reason: string };

function decodeParam(field: FilterField, raw: string): Decoded {
  const operators = filterOperators(field);
  let operator = operators[0]?.id ?? "";
  let body = raw;
  if (operators.length > 1) {
    const separator = raw.indexOf(":");
    if (separator === -1)
      return { ok: false, reason: `"${raw}" has no operator. Use "<operator>:<value>".` };
    operator = raw.slice(0, separator);
    body = raw.slice(separator + 1);
    if (!operators.some((candidate) => candidate.id === operator))
      return { ok: false, reason: `"${operator}" is not an operator of ${field.label}.` };
  }
  switch (field.kind) {
    case "select": {
      if (!field.options.some((option) => option.id === body))
        return { ok: false, reason: `"${body}" is not a ${field.label} option.` };
      return { ok: true, filter: { kind: "select", field: field.id, operator, value: body } };
    }
    case "multiSelect": {
      const ids = body.split(",");
      const unknown = ids.find((id) => !field.options.some((option) => option.id === id));
      if (unknown !== undefined)
        return { ok: false, reason: `"${unknown}" is not a ${field.label} option.` };
      if (new Set(ids).size !== ids.length)
        return { ok: false, reason: `${field.label} lists an option twice.` };
      return { ok: true, filter: { kind: "multiSelect", field: field.id, operator, value: ids } };
    }
    case "text": {
      if (body.trim() === "") return { ok: false, reason: `${field.label} is empty.` };
      return { ok: true, filter: { kind: "text", field: field.id, operator, value: body } };
    }
    case "dateRange": {
      const [start, end, ...rest] = body.split("..");
      if (start === undefined || end === undefined || rest.length > 0)
        return {
          ok: false,
          reason: `"${body}" is not a date range. Use "YYYY-MM-DD..YYYY-MM-DD".`,
        };
      if (!isValidDate(start) || !isValidDate(end))
        return { ok: false, reason: `"${body}" has an invalid date.` };
      if (start > end) return { ok: false, reason: `${field.label} starts after it ends.` };
      return {
        ok: true,
        filter: { kind: "dateRange", field: field.id, operator, value: { start, end } },
      };
    }
  }
}

function encodeFilter(field: FilterField, filter: ActiveFilter): string {
  if (filter.kind !== field.kind)
    throw new Error(
      `Filter "${filter.field}" is a ${filter.kind} value for a ${field.kind} field.`,
    );
  const operators = filterOperators(field);
  if (!operators.some((operator) => operator.id === filter.operator))
    throw new Error(`Filter "${filter.field}" uses the unknown operator "${filter.operator}".`);
  let body: string;
  switch (filter.kind) {
    case "select":
    case "text":
      body = filter.value;
      break;
    case "multiSelect":
      body = filter.value.join(",");
      break;
    case "dateRange":
      body = `${filter.value.start}..${filter.value.end}`;
      break;
  }
  const encoded = operators.length > 1 ? `${filter.operator}:${body}` : body;
  const decoded = decodeParam(field, encoded);
  if (!decoded.ok) throw new Error(`Filter "${filter.field}" is invalid: ${decoded.reason}`);
  return encoded;
}

type ParamOf<Field> = Field extends { readonly param: infer Param extends string }
  ? Param
  : Field extends { readonly id: infer Id extends string }
    ? Id
    : never;

/** Filter params as `serializeFilters` writes them: one key per field, undefined when inactive. */
export type FilterParams<Fields extends ReadonlyArray<FilterField>> = {
  readonly [Param in ParamOf<Fields[number]>]: string | undefined;
};

export type FilterSearchFields<Fields extends ReadonlyArray<FilterField>> = {
  readonly [Param in ParamOf<Fields[number]>]: Schema.optionalKey<Schema.String>;
};

/**
 * Effect Schema fields for the filter params. Spread them into the route's
 * search schema, so an invalid filter param fails search validation and the
 * route shows its reset action.
 */
export function filterSearchFields<const Fields extends ReadonlyArray<FilterField>>(
  fields: Fields,
): FilterSearchFields<Fields> {
  assertFields(fields);
  const entries = fields.map((field) => [
    filterParam(field),
    Schema.optionalKey(
      Schema.String.pipe(
        Schema.check(
          Schema.makeFilter((raw: string) => {
            const decoded = decodeParam(field, raw);
            return decoded.ok ? undefined : decoded.reason;
          }),
        ),
      ),
    ),
  ]);
  // The mapped type names each param; Object.fromEntries cannot express it.
  return Object.fromEntries(entries) as FilterSearchFields<Fields>;
}

/**
 * Reads the active filters from validated search params, in field order.
 * It throws on an invalid value: validate the params with
 * `filterSearchFields` first.
 */
export function parseFilters(
  fields: ReadonlyArray<FilterField>,
  search: Readonly<Record<string, unknown>>,
): ReadonlyArray<ActiveFilter> {
  assertFields(fields);
  const filters: Array<ActiveFilter> = [];
  for (const field of fields) {
    const raw = search[filterParam(field)];
    if (raw === undefined) continue;
    if (typeof raw !== "string")
      throw new Error(`Filter param "${filterParam(field)}" is not a string.`);
    const decoded = decodeParam(field, raw);
    if (!decoded.ok) throw new Error(`Filter param "${filterParam(field)}": ${decoded.reason}`);
    filters.push(decoded.filter);
  }
  return filters;
}

/**
 * Writes filters as search params. Every field param is present, and the
 * params of inactive fields are `undefined`, so spreading the result over the
 * previous search removes them.
 */
export function serializeFilters<const Fields extends ReadonlyArray<FilterField>>(
  fields: Fields,
  filters: ReadonlyArray<ActiveFilter>,
): FilterParams<Fields> {
  assertFields(fields);
  const params: Record<string, string | undefined> = {};
  for (const field of fields) params[filterParam(field)] = undefined;
  for (const filter of filters) {
    const field = findFilterField(fields, filter.field);
    const param = filterParam(field);
    if (params[param] !== undefined)
      throw new Error(`Filter "${filter.field}" appears twice. A field holds one filter.`);
    params[param] = encodeFilter(field, filter);
  }
  // The keys are exactly the field params set above.
  return params as FilterParams<Fields>;
}
