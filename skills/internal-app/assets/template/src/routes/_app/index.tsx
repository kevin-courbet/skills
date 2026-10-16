import * as stylex from "@stylexjs/stylex";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TrendChart } from "@/components/charts/trend-chart";
import { LinkButton } from "@/components/ui/button";
import { Page, PageHeader, Section, StatTile } from "@/components/ui/layout";
import { itemsSummaryQueryOptions } from "@/features/items/api";
import { formatCurrency, formatInteger } from "@/lib/locale";
import { media, space } from "@/styles/tokens.stylex";

export const Route = createFileRoute("/_app/")({
  staticData: { crumb: "Overview" },
  loader: ({ context }) => context.queryClient.ensureQueryData(itemsSummaryQueryOptions()),
  component: OverviewPage,
});

function OverviewPage() {
  const { data } = useSuspenseQuery(itemsSummaryQueryOptions());
  return (
    <Page>
      <PageHeader
        title="Overview"
        description="Current state of all items."
        actions={
          <LinkButton to="/items" intent="primary">
            Open items
          </LinkButton>
        }
      />
      <div {...stylex.props(styles.stats)}>
        <StatTile
          label="Items"
          value={formatInteger(data.total)}
          footnote="Items service · UTC days"
        />
        <StatTile
          label="Active"
          value={formatInteger(data.active)}
          hint={`of ${formatInteger(data.total)}`}
        />
        <StatTile
          label="Total amount"
          value={formatCurrency(data.totalAmount)}
          delta={{ value: "4.2%", direction: "up" }}
          hint="vs last month"
        />
      </div>
      <Section title="Daily activity" description="Items updated per day over the last 30 days.">
        <TrendChart
          title="Updated items"
          description="Count of items updated per day."
          unit="Items"
          source="Items service, UTC days"
          series={data.series}
        />
      </Section>
    </Page>
  );
}

const styles = stylex.create({
  stats: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.sm]: "repeat(3, minmax(0, 1fr))" },
    gap: space.md,
  },
});
