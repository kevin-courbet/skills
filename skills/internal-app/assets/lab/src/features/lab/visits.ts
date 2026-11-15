import { Schema } from "effect";
import { Briefcase, Coffee, FlaskConical, HardHat, Presentation, Truck } from "lucide-react";
import type { ChoiceOption } from "@/components/helpers/choice";
import { appLocale } from "@/lib/locale";

/**
 * The schema, the options, and the example values of the PreviewForm recipe:
 * the registration of a visitor and the badge that reception prints.
 */

const Host = Schema.Literals(["amara", "jonas", "mei", "tomas"]);
export type Host = typeof Host.Type;
const BadgeType = Schema.Literals(["visitor", "contractor"]);
export type BadgeType = typeof BadgeType.Type;
const Area = Schema.Literals(["lobby", "offices", "meeting", "labs", "dock"]);
export type Area = typeof Area.Type;

const notBlank = (message: string) => Schema.isPattern(/\S/, { message });

/** The visit schema. The visit day check needs today, so the page builds the schema. */
export function visitSchema(today: string) {
  return Schema.Struct({
    name: Schema.String.pipe(
      Schema.check(notBlank("Enter the full name of the visitor, as it goes on the badge.")),
    ),
    email: Schema.String.pipe(
      Schema.check(
        notBlank("Enter the email of the visitor. The visit details go to it."),
        Schema.isPattern(/^\s*$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
          message: "Enter the email in the form name@example.com.",
        }),
      ),
    ),
    host: Schema.NullOr(Host),
    visitDay: Schema.NullOr(Schema.String).pipe(
      Schema.check(
        Schema.makeFilter((value: string | null) => {
          if (value === null) return "Pick a day, or enter a date in the date field.";
          if (value < today) return "Pick a visit day of today or later.";
          return true;
        }),
      ),
    ),
    badgeType: BadgeType,
    areas: Schema.Array(Area).pipe(
      Schema.check(
        Schema.isMinLength(1, {
          message: "Pick at least one area. The badge opens only the areas on it.",
        }),
      ),
    ),
  });
}

export type VisitValues = ReturnType<typeof visitSchema>["Type"];

export const emptyVisit: VisitValues = {
  name: "",
  email: "",
  host: null,
  visitDay: null,
  badgeType: "visitor",
  areas: [],
};

/** The page order of the fields and their element ids, for the error summary. */
export const visitFieldOrder = [
  { name: "name", id: "visit-name" },
  { name: "email", id: "visit-email" },
  { name: "host", id: "visit-host" },
  { name: "visitDay", id: "visit-day" },
  { name: "badgeType", id: "visit-badge-type" },
  { name: "areas", id: "visit-areas" },
] as const;

export const hostOptions: ReadonlyArray<ChoiceOption<Host>> = [
  { id: "amara", label: "Amara Okafor", avatar: {}, meta: "Floor 4" },
  { id: "jonas", label: "Jonas Berg", avatar: {}, meta: "Floor 2" },
  { id: "mei", label: "Mei Tanaka", avatar: {}, meta: "Floor 6" },
  { id: "tomas", label: "Tomas Silva", avatar: {}, meta: "Floor 3" },
];

export const badgeTypeOptions: ReadonlyArray<ChoiceOption<BadgeType>> = [
  { id: "visitor", label: "Visitor", description: "Walks with the host in every area." },
  {
    id: "contractor",
    label: "Contractor",
    icon: HardHat,
    description: "Works alone in the areas on the badge after a safety briefing.",
  },
];

/** The time each area closes, as 24-hour text. The badge is valid until the earliest one. */
const areaCloses: Record<Area, string> = {
  lobby: "20:00",
  offices: "18:00",
  meeting: "19:00",
  labs: "17:00",
  dock: "15:00",
};

const areaKinds: ReadonlyArray<ChoiceOption<Area>> = [
  { id: "lobby", label: "Lobby and café", icon: Coffee },
  { id: "offices", label: "Office floors", icon: Briefcase },
  { id: "meeting", label: "Meeting rooms", icon: Presentation },
  { id: "labs", label: "Labs", icon: FlaskConical },
  { id: "dock", label: "Loading dock", icon: Truck },
];

export const areaOptions: ReadonlyArray<ChoiceOption<Area>> = areaKinds.map((option) => ({
  ...option,
  meta: `until ${areaCloses[option.id]}`,
}));

export const badgeNumber = "V-2318";

export function labelOf<Value extends string>(
  options: ReadonlyArray<ChoiceOption<Value>>,
  id: Value,
): string {
  const option = options.find((candidate) => candidate.id === id);
  if (option === undefined) throw new Error(`No option has the id "${id}".`);
  return option.label;
}

/** The earliest closing time of the areas, or null when no area is picked. */
export function validUntil(areas: ReadonlyArray<Area>): string | null {
  return areas.map((area) => areaCloses[area]).toSorted()[0] ?? null;
}

/** The summary of the form footer: when the badge stops working. */
export function validity(areas: ReadonlyArray<Area>): string {
  const until = validUntil(areas);
  return until === null ? "No areas picked yet" : `Valid until ${until}`;
}

export function formatVisitDay(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(appLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
