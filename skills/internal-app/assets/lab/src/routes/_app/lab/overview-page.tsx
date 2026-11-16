/**
 * An overview page: the numbers that say whether the work is on track, the trend behind them, and a link to each set of records.
 *
 * @keywords overview page, dashboard, home page, kpi, key numbers, metrics page, stat tiles, trend chart, summary page, numbers and charts
 * @components Page, PageHeader, StatStrip, StatTile, Sparkline, TrendChart, Section, LinkButton
 * @notes dashboards, charts, kit-charts, internal-app-page-patterns, kit-states
 * @files src/features/lab/tickets.ts
 *
 * Use it as the first page of an area, when people come to see if something
 * needs them and then go to the records. Do not use it to edit records, and
 * do not put a long list on it: link to the ListPage recipe.
 *
 * The page answers three questions in order. The strip says how much work
 * waits in each stage, and each number opens the list filtered to it. The
 * tiles say how the week compares with the last one. The chart shows the
 * trend of the measure that matters most.
 *
 * ## Adapt it
 * - Replace `src/features/lab/tickets.ts` with the summary query of the
 *   feature. The server counts and aggregates. The page only shows numbers.
 * - Choose the strip facts: the counts that people act on, each with a link
 *   to the filtered list. Use `tone` only when the number is a status, such
 *   as the work that nobody owns.
 * - Choose three or four tiles. Give each a period in `hint` or `footnote`,
 *   and set the `tone` of the delta when down is good.
 * - Give the chart the one measure that explains the tiles, in a `Section`
 *   whose title says what the chart answers.
 */
import * as stylex from "@stylexjs/stylex";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TrendChart } from "@/components/patterns/trend-chart";
import { LinkButton } from "@/components/primitives/button";
import {
  Page,
  PageHeader,
  Section,
  StatStrip,
  type StatDelta,
  StatTile,
} from "@/components/primitives/layout";
import { Sparkline } from "@/components/primitives/sparkline";
import {
  type DailyPoint,
  statusDisplay,
  type TicketStatus,
  ticketsOverviewQueryOptions,
} from "@/features/lab/tickets";
import { formatInteger } from "@/lib/locale";
import { media, space } from "@/styles/tokens.stylex";

export const Route = createFileRoute("/_app/lab/overview-page")({
  staticData: { crumb: "Help desk" },
  loader: ({ context }) => context.queryClient.ensureQueryData(ticketsOverviewQueryOptions()),
  component: HelpDeskOverviewPage,
});

const sum = (points: ReadonlyArray<DailyPoint>) =>
  points.reduce((total, point) => total + point.value, 0);
const average = (points: ReadonlyArray<DailyPoint>) => sum(points) / points.length;

function directionOf(change: number): StatDelta["direction"] {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

/** Compares the last seven days with the seven days before them. */
function weekOverWeek(
  points: ReadonlyArray<DailyPoint>,
  measure: (week: ReadonlyArray<DailyPoint>) => number,
  goodDirection: "up" | "down",
): { readonly value: number; readonly delta: StatDelta } {
  const current = measure(points.slice(-7));
  const previous = measure(points.slice(-14, -7));
  const change = previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
  const direction = directionOf(change);
  const tone = direction === goodDirection ? "good" : "bad";
  return {
    value: current,
    delta: {
      value: `${Math.abs(change)}%`,
      direction,
      tone: direction === "flat" ? "neutral" : tone,
    },
  };
}

const stages: ReadonlyArray<TicketStatus> = ["new", "open", "pending"];

function HelpDeskOverviewPage() {
  const { data } = useSuspenseQuery(ticketsOverviewQueryOptions());
  const opened = weekOverWeek(data.opened, sum, "down");
  const solved = weekOverWeek(data.solved, sum, "up");
  const reply = weekOverWeek(data.firstReplyHours, average, "down");

  return (
    <Page>
      <PageHeader
        title="Help desk"
        description="The tickets that wait for the team and how this week compares with the last one."
        actions={
          <LinkButton to="/lab/list-page" intent="primary">
            Open tickets
          </LinkButton>
        }
      />
      <StatStrip
        items={[
          ...stages.map((status) => ({
            label: statusDisplay[status].label,
            value: formatInteger(data.byStatus[status]),
            link: { to: "/lab/list-page", search: { status } } as const,
          })),
          {
            label: "Not assigned",
            value: formatInteger(data.unassigned),
            tone: data.unassigned === 0 ? undefined : "warning",
            hint: "open tickets",
          },
        ]}
      />
      <div {...stylex.props(styles.tiles)}>
        <StatTile
          label="Opened"
          value={formatInteger(opened.value)}
          delta={opened.delta}
          hint="last 7 days"
          chart={
            <Sparkline
              label="Tickets opened per day"
              description="Tickets opened per day for the last 14 days."
              series={data.opened}
            />
          }
        />
        <StatTile
          label="Solved"
          value={formatInteger(solved.value)}
          delta={solved.delta}
          hint="last 7 days"
          chart={
            <Sparkline
              label="Tickets solved per day"
              description="Tickets solved per day for the last 14 days."
              series={data.solved}
            />
          }
        />
        <StatTile
          label="First reply"
          value={`${reply.value.toFixed(1)} h`}
          delta={reply.delta}
          hint="average, last 7 days"
          footnote="Measured from the creation of the ticket to the first public reply"
        />
      </div>
      <Section
        title="Time to first reply"
        description="Does the team answer new tickets faster than two weeks ago?"
      >
        <TrendChart
          title="Average first reply"
          description="Average hours from a new ticket to its first public reply, per UTC day."
          unit="Hours"
          source="Help desk, example data"
          series={data.firstReplyHours}
        />
      </Section>
    </Page>
  );
}

const styles = stylex.create({
  tiles: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.sm]: "repeat(3, minmax(0, 1fr))" },
    gap: space.md,
  },
});
