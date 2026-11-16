import * as stylex from "@stylexjs/stylex";
import { StatTile } from "@/components/primitives/layout";
import { Sparkline } from "@/components/primitives/sparkline";
import { formatCurrency, formatInteger } from "@/lib/locale";
import { media, space } from "@/styles/tokens.stylex";
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

const closedOrders = daily("2026-11-05", [18, 22, 19, 25, 27, 14, 9, 24, 28, 26, 31, 29]);
const repairHours = daily(
  "2026-11-05",
  [2.4, 2.6, 2.3, 2.9, 3.1, 2.7, 2.5, 2.2, 2.4, 2.1, 2.0, 1.9],
);
const partsRevenue = daily(
  "2026-11-05",
  [1240, 1385, 1190, 1610, 1720, 980, 640, 1530, 1795, 1660, 1910, 1845],
);
const flatBays = daily("2026-11-05", [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]);
const warrantyClaims = daily("2026-11-05", [0, 0, 1, 0, 0, 0, 7, 1, 0, 0, 0, 1]);
const newShopOrders = daily("2026-11-14", [4, 9, 7]);
const quarterOrders = daily(
  "2026-08-18",
  Array.from({ length: 90 }, (_, day) => 20 + Math.round(8 * Math.sin(day / 6) + day / 9)),
);

const sum = (series: ReadonlyArray<Point>) =>
  series.reduce((total, point) => total + point.value, 0);

export default defineSection({
  component: "Sparkline",
  specimens: [
    {
      title: "In a stat tile",
      note: "The tile label and value name the measure. The sparkline only shows its shape.",
      wide: true,
      render: () => (
        <div {...stylex.props(styles.grid)}>
          <StatTile
            label="Work orders closed"
            value={formatInteger(sum(closedOrders))}
            delta={{ value: "12%", direction: "up" }}
            hint="vs the previous 12 days"
            chart={
              <Sparkline
                label="Work orders closed per day"
                description="Work orders closed per day for the last 12 days."
                series={closedOrders}
              />
            }
            footnote="From closed work orders, UTC days"
          />
          <StatTile
            label="Average repair time"
            value={`${(sum(repairHours) / repairHours.length).toFixed(1)} h`}
            delta={{ value: "21%", direction: "down", tone: "good" }}
            hint="vs the previous 12 days"
            chart={
              <Sparkline
                label="Average repair time per day"
                description="Average hours from check-in to ready, per day for the last 12 days."
                series={repairHours}
              />
            }
            footnote="From mechanic time logs"
          />
          <StatTile
            label="Parts revenue"
            value={formatCurrency(sum(partsRevenue))}
            delta={{ value: "8%", direction: "up" }}
            hint="vs the previous 12 days"
            chart={
              <Sparkline
                label="Parts revenue per day"
                description="Parts revenue in euros per day for the last 12 days."
                series={partsRevenue}
              />
            }
            footnote="From paid invoices"
          />
        </div>
      ),
    },
    {
      title: "Flat and spiky series",
      note: "A line, not an area, so a single spike or a flat series keeps its true shape.",
      wide: true,
      render: () => (
        <div {...stylex.props(styles.grid)}>
          <StatTile
            label="Repair bays in use"
            value={formatInteger(6)}
            delta={{ value: "0%", direction: "flat" }}
            hint="All 6 bays every day"
            chart={
              <Sparkline
                label="Repair bays in use per day"
                description="Repair bays in use per day for the last 12 days."
                series={flatBays}
              />
            }
            footnote="From the bay schedule"
          />
          <StatTile
            label="Warranty claims"
            value={formatInteger(sum(warrantyClaims))}
            hint="7 of them on 11 Nov"
            chart={
              <Sparkline
                label="Warranty claims per day"
                description="Warranty claims opened per day for the last 12 days."
                series={warrantyClaims}
              />
            }
            footnote="A recalled chain batch caused the spike."
          />
        </div>
      ),
    },
    {
      title: "Few points and many points",
      wide: true,
      render: () => (
        <div {...stylex.props(styles.grid)}>
          <StatTile
            label="Orders at the new shop"
            value={formatInteger(sum(newShopOrders))}
            hint="Open since 14 Nov"
            chart={
              <Sparkline
                label="Orders at the new shop per day"
                description="Work orders created per day at the Canal Street shop since it opened 3 days ago."
                series={newShopOrders}
              />
            }
          />
          <StatTile
            label="Work orders this quarter"
            value={formatInteger(sum(quarterOrders))}
            delta={{ value: "15%", direction: "up" }}
            hint="vs last quarter"
            chart={
              <Sparkline
                label="Work orders per day"
                description="Work orders created per day for the last 90 days."
                series={quarterOrders}
              />
            }
          />
        </div>
      ),
    },
  ],
});

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [media.sm]: "repeat(auto-fill, minmax(15rem, 1fr))",
    },
    gap: space.lg,
    width: "100%",
  },
});
