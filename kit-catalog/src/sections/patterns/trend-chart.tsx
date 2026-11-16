import { Section } from "@/components/primitives/layout";
import { TrendChart } from "@/components/patterns/trend-chart";
import { defineSection } from "../../specimen";

type Point = { readonly date: string; readonly value: number };

/** One point for each UTC day from `start`, in date order. */
function daily(start: string, values: ReadonlyArray<number>): ReadonlyArray<Point> {
  const origin = Date.parse(`${start}T00:00:00Z`);
  return values.map((value, index) => ({
    date: new Date(origin + index * 86_400_000).toISOString().slice(0, 10),
    value,
  }));
}

// Sundays are quiet because the shop opens only for pick-ups.
const createdOrders = daily(
  "2026-10-17",
  Array.from({ length: 30 }, (_, day) => (day % 7 === 1 ? 6 : 22 + ((day * 7) % 11))),
);
const repairHours = daily(
  "2026-08-18",
  Array.from(
    { length: 90 },
    (_, day) => Math.round((3.2 - day / 60 + 0.4 * Math.sin(day / 5)) * 10) / 10,
  ),
);
const backorderedParts = daily(
  "2026-11-02",
  Array.from({ length: 14 }, () => 3),
);
const newShopOrders = daily("2026-11-14", [4, 9, 7]);

export default defineSection({
  component: "TrendChart",
  specimens: [
    {
      title: "In a section",
      note: "The Section title says what the chart answers. The chart title names the measure.",
      wide: true,
      render: () => (
        <Section
          title="Daily intake"
          description="Work orders created per day over the last 30 days."
        >
          <TrendChart
            title="Created work orders"
            description="Count of work orders created per day, at the counter and online."
            unit="Work orders"
            source="Work order service, UTC days"
            series={createdOrders}
          />
        </Section>
      ),
    },
    {
      title: "Long period with decimal values",
      wide: true,
      render: () => (
        <TrendChart
          title="Average repair time"
          description="Average hours from check-in to ready for pick-up, per day over the last 90 days."
          unit="Hours"
          source="Mechanic time logs, UTC days"
          series={repairHours}
        />
      ),
    },
    {
      title: "Flat series",
      wide: true,
      render: () => (
        <TrendChart
          title="Backordered parts"
          description="Count of parts on backorder at the end of each day."
          unit="Parts"
          source="Parts inventory, end of UTC day"
          series={backorderedParts}
        />
      ),
    },
    {
      title: "Few points and a long description",
      note: "A series of less than a week has a tick on each day.",
      wide: true,
      render: () => (
        <TrendChart
          title="Work orders at the Canal Street shop"
          description="Count of work orders created per day at the Canal Street shop since it opened on 14 November, including warranty repairs that the main shop sent over during the first week."
          unit="Work orders"
          source="Work order service, Canal Street shop, UTC days"
          series={newShopOrders}
        />
      ),
    },
  ],
});
