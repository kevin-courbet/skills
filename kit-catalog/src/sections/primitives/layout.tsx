import * as stylex from "@stylexjs/stylex";
import { Download, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge, StatusDot } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Identifier } from "@/components/primitives/identifier";
import {
  Card,
  CardSection,
  Code,
  DescriptionList,
  Kbd,
  MetaLine,
  PageHeader,
  Section,
  Separator,
  SettingRow,
  SettingsCard,
  StatStrip,
  StatTile,
  Toolbar,
} from "@/components/primitives/layout";
import { SearchField } from "@/components/primitives/search-field";
import { Select } from "@/components/primitives/select";
import { Sparkline } from "@/components/primitives/sparkline";
import { Switch } from "@/components/primitives/switch";
import { TextField } from "@/components/primitives/text-field";
import { TextLink } from "@/components/primitives/text-link";
import { formatCurrency, formatInteger } from "@/lib/locale";
import { color, font, media, space } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled } from "../../specimen";

const openOrdersSeries = [
  { date: "2026-11-04", value: 15 },
  { date: "2026-11-05", value: 17 },
  { date: "2026-11-06", value: 16 },
  { date: "2026-11-07", value: 19 },
  { date: "2026-11-09", value: 18 },
  { date: "2026-11-10", value: 21 },
  { date: "2026-11-11", value: 20 },
  { date: "2026-11-12", value: 22 },
  { date: "2026-11-13", value: 21 },
  { date: "2026-11-14", value: 23 },
];

const revenueSeries = [
  { date: "2026-11-04", value: 1120 },
  { date: "2026-11-05", value: 980 },
  { date: "2026-11-06", value: 1340 },
  { date: "2026-11-07", value: 1210 },
  { date: "2026-11-09", value: 1460 },
  { date: "2026-11-10", value: 1390 },
  { date: "2026-11-11", value: 1520 },
  { date: "2026-11-12", value: 1610 },
  { date: "2026-11-13", value: 1580 },
  { date: "2026-11-14", value: 1720 },
];

type Scope = "all" | "mine" | "unassigned";

const scopeOptions: ReadonlyArray<{ readonly id: Scope; readonly label: string }> = [
  { id: "all", label: "All work orders" },
  { id: "mine", label: "Assigned to me" },
  { id: "unassigned", label: "Unassigned" },
];

type Stock = "all" | "low" | "out";

const stockOptions: ReadonlyArray<{ readonly id: Stock; readonly label: string }> = [
  { id: "all", label: "All parts" },
  { id: "low", label: "Low stock" },
  { id: "out", label: "Out of stock" },
];

type Reminder = "same-day" | "day-before" | "two-days-before";

const reminderOptions: ReadonlyArray<{ readonly id: Reminder; readonly label: string }> = [
  { id: "same-day", label: "On the pickup day" },
  { id: "day-before", label: "One day before pickup" },
  { id: "two-days-before", label: "Two days before pickup" },
];

function NotificationSettings() {
  const [readySms, setReadySms] = useState(true);
  const [estimateEmail, setEstimateEmail] = useState(false);
  return (
    <SettingsCard
      title="Customer notifications"
      description="These messages go to the customer of each work order."
      actions={<Button>Send a test message</Button>}
    >
      <SettingRow
        label="Ready for pickup"
        description="A text message goes out when the mechanic closes the work order."
      >
        <Switch aria-label="Ready for pickup" isSelected={readySms} onChange={setReadySms} />
      </SettingRow>
      <SettingRow
        label="Estimate approval"
        description="An email asks the customer to approve an estimate above the limit."
      >
        <Switch
          aria-label="Estimate approval"
          isSelected={estimateEmail}
          onChange={setEstimateEmail}
        />
      </SettingRow>
      <SettingRow label="Pickup reminder">
        <Select
          label="Pickup reminder"
          hideLabel
          options={reminderOptions}
          defaultValue="day-before"
        />
      </SettingRow>
      <SettingRow label="Sender name" description="Customers see this name on texts and emails.">
        Spoke & Chain
      </SettingRow>
    </SettingsCard>
  );
}

export default defineSection({
  component: "Layout",
  specimens: [
    {
      title: "PageHeader",
      note: "Start each page with a PageHeader. Put one primary action at most in actions.",
      wide: true,
      render: () => (
        <Column>
          <Labeled label="list page">
            <div {...stylex.props(styles.fill)}>
              <PageHeader
                title="Work orders"
                description={
                  <>
                    Repairs that are open in the workshop. Press <Kbd>/</Kbd> to search, or filter
                    by <Code>status:waiting</Code>. Prices follow the{" "}
                    <TextLink to="/">labor rates</TextLink>.
                  </>
                }
                actions={
                  <Button intent="primary" icon={Plus}>
                    Create work order
                  </Button>
                }
              />
            </div>
          </Labeled>
          <Labeled label="detail page, with an Identifier and a Badge in the title">
            <div {...stylex.props(styles.fill)}>
              <PageHeader
                title={
                  <>
                    <Identifier value="WO-1042" label="work order ID" size="lg" />{" "}
                    <Badge intent="info">In repair</Badge>
                  </>
                }
                description={
                  <MetaLine
                    items={[
                      "Trek Domane SL 5",
                      <TextLink key="customer" to="/">
                        Amélie Durand
                      </TextLink>,
                      "Due today at 17:00",
                    ]}
                  />
                }
                actions={<Button>Print work order</Button>}
              />
            </div>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Section",
      note: "stacked puts the title over the content. split puts the title in a column on the left, for the parts of a long form or a settings page.",
      wide: true,
      render: () => (
        <Column>
          <Labeled label="stacked, with actions and a Separator">
            <div {...stylex.props(styles.fill)}>
              <Section
                title="Intake notes"
                description="What the customer reported at the front desk."
                actions={<Button size="sm">Edit notes</Button>}
              >
                <p {...stylex.props(styles.text)}>
                  A click from the bottom bracket when climbing, and the rear brake feels soft.
                </p>
                <Separator />
                <p {...stylex.props(styles.text)}>
                  The customer needs the bike back today by 17:00.
                </p>
              </Section>
            </div>
          </Labeled>
          <Labeled label="split">
            <div {...stylex.props(styles.fill)}>
              <Section
                layout="split"
                title="Shop details"
                description="Customers see these details on estimates and invoices."
              >
                <TextField label="Shop name" defaultValue="Spoke & Chain" />
                <TextField label="Phone" defaultValue="+33 1 43 55 12 08" width="md" />
              </Section>
              <Section
                layout="split"
                title="Labor rates"
                description="The rates apply to new estimates."
              >
                <TextField label="Hourly rate" defaultValue="60" suffix="€" width="sm" />
              </Section>
            </div>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Card and CardSection",
      note: "A card holds its content directly. To divide a card, set layout to sections and use one CardSection for each block. Do not put a bordered box in a card.",
      wide: true,
      render: () => (
        <Column>
          <div {...stylex.props(styles.cardGrid)}>
            <Card
              title="Today at the workshop"
              description="Updated at 15:40"
              actions={<TextLink to="/">View schedule</TextLink>}
              footer="6 mechanics on shift"
            >
              <p {...stylex.props(styles.text)}>
                11 bikes are in repair, 5 wait for parts, and 7 are ready for pickup.
              </p>
            </Card>
            <Card>
              <p {...stylex.props(styles.text)}>
                The shop closes at 18:30 today. Customers can collect bikes until 18:15.
              </p>
            </Card>
          </div>
          <Card
            title="WO-1042, Trek Domane SL 5"
            description={<MetaLine items={["Brake bleed and pad swap", "Karim Haddad"]} />}
            actions={<Badge intent="info">In repair</Badge>}
            layout="sections"
          >
            <CardSection>
              <DescriptionList
                layout="grid"
                items={[
                  { term: "Customer", detail: "Amélie Durand" },
                  { term: "Checked in", detail: "16 Nov 2026, 09:12" },
                  { term: "Due", detail: "16 Nov 2026, 17:00" },
                  { term: "Estimate", detail: formatCurrency(156.4) },
                ]}
              />
            </CardSection>
            <CardSection padding="flush">
              <StatStrip
                framed={false}
                items={[
                  { label: "Parts", value: formatInteger(2) },
                  { label: "Labor", value: formatInteger(60), hint: "min" },
                  { label: "Total", value: formatCurrency(156.4) },
                ]}
              />
            </CardSection>
            <CardSection tone="inset">
              <Code>diagnostic: rear caliper piston sticks, pads worn to 0.8 mm</Code>
            </CardSection>
          </Card>
        </Column>
      ),
    },
    {
      title: "StatTile and StatStrip",
      note: "StatTile cards make an overview. StatStrip is a lighter row of key facts for the top of a detail page or a sheet.",
      wide: true,
      render: () => (
        <Column>
          <div {...stylex.props(styles.tileGrid)}>
            <StatTile
              label="Open work orders"
              value={formatInteger(23)}
              delta={{ value: "12%", direction: "up", tone: "bad" }}
              hint="vs last week"
              chart={
                <Sparkline
                  label="Open work orders per day"
                  description="Open work orders per day for the last 10 working days."
                  series={openOrdersSeries}
                />
              }
              footnote="Counted from the work order list"
            />
            <StatTile
              label="Revenue last week"
              value={formatCurrency(9280)}
              delta={{ value: "8%", direction: "up" }}
              hint="vs the week before"
              chart={
                <Sparkline
                  label="Revenue per day"
                  description="Revenue in euros per day for the last 10 working days."
                  series={revenueSeries}
                />
              }
              footnote="Paid invoices, tax included"
            />
            <StatTile
              label="Average turnaround"
              value="2.4 days"
              delta={{ value: "0.3 days", direction: "down", tone: "good" }}
              hint="vs last month"
            />
          </div>
          <Labeled label="StatStrip metric, with links and tones">
            <div {...stylex.props(styles.fill)}>
              <StatStrip
                items={[
                  { label: "Open", value: formatInteger(23), link: { to: "/" } },
                  {
                    label: "Waiting for parts",
                    value: formatInteger(5),
                    tone: "warning",
                    link: { to: "/" },
                  },
                  { label: "Overdue", value: formatInteger(2), tone: "danger", link: { to: "/" } },
                  { label: "Ready for pickup", value: formatInteger(7), tone: "success" },
                ]}
              />
            </div>
          </Labeled>
          <Labeled label="StatStrip status">
            <div {...stylex.props(styles.fill)}>
              <StatStrip
                variant="status"
                items={[
                  {
                    label: "Diagnosis",
                    value: "Done",
                    tone: "success",
                    detail: "Rear caliper piston sticks",
                  },
                  {
                    label: "Repair",
                    value: "In progress",
                    tone: "info",
                    detail: "Karim Haddad, bay 2",
                  },
                  {
                    label: "Test ride",
                    value: "Not started",
                    tone: "muted",
                    detail: "After the brake bleed",
                  },
                ]}
              />
            </div>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "DescriptionList and MetaLine",
      note: "rows puts each label left of its value. grid puts the label above the value, for the key facts of a record in a card.",
      wide: true,
      render: () => (
        <Column>
          <Labeled label="rows">
            <div {...stylex.props(styles.fill, styles.reading)}>
              <DescriptionList
                items={[
                  { term: "Customer", detail: <TextLink to="/">Amélie Durand</TextLink> },
                  { term: "Bike", detail: "Trek Domane SL 5, size 56" },
                  {
                    term: "Frame serial",
                    detail: <Identifier value="WTU284C0912J" label="frame serial" size="sm" />,
                  },
                  {
                    term: "Status",
                    detail: <StatusDot intent="info">In repair</StatusDot>,
                  },
                  {
                    term: "Mechanic",
                    detail: <MetaLine items={["Karim Haddad", "Bay 2", "Shift ends at 18:30"]} />,
                  },
                  {
                    term: "Intake notes",
                    detail:
                      "A click from the bottom bracket when climbing out of the saddle, and the rear brake lever reaches the bar under hard braking.",
                  },
                ]}
              />
            </div>
          </Labeled>
          <Labeled label="grid, with wide and full spans">
            <div {...stylex.props(styles.fill)}>
              <DescriptionList
                layout="grid"
                items={[
                  { term: "Status", detail: <Badge intent="info">In repair</Badge> },
                  { term: "Checked in", detail: "16 Nov 2026, 09:12" },
                  { term: "Due", detail: "16 Nov 2026, 17:00" },
                  { term: "Total", detail: formatCurrency(156.4) },
                  {
                    term: "Parts",
                    detail: "Shimano B05S pads, Shimano RT-MT800 rotor",
                    span: "wide",
                  },
                  {
                    term: "Work done",
                    detail:
                      "Bled both brakes, freed the rear caliper piston, fitted new rear pads and a rear rotor, and regreased the bottom bracket.",
                    span: "full",
                  },
                ]}
              />
            </div>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "SettingsCard",
      note: "Each SettingRow puts the label on the left and the value or the control on the right. Set hideLabel on a field in a row.",
      wide: true,
      render: () => (
        <div {...stylex.props(styles.fill, styles.reading)}>
          <NotificationSettings />
        </div>
      ),
    },
    {
      title: "Toolbar",
      note: "Put the search field first. Do not set size on the controls in a toolbar: set it on the Toolbar.",
      wide: true,
      render: () => (
        <Column>
          <Labeled label="default size">
            <div {...stylex.props(styles.fill)}>
              <Toolbar
                label="Filter work orders"
                actions={
                  <>
                    <Button
                      intent="ghost"
                      iconOnly
                      icon={RefreshCw}
                      aria-label="Refresh work orders"
                    />
                    <Button
                      intent="ghost"
                      iconOnly
                      icon={Download}
                      aria-label="Export work orders"
                    />
                  </>
                }
              >
                <SearchField
                  label="Search work orders"
                  hideLabel
                  placeholder="Search by customer or bike"
                />
                <Select label="Scope" hideLabel options={scopeOptions} defaultValue="all" />
              </Toolbar>
            </div>
          </Labeled>
          <Labeled label="size sm">
            <div {...stylex.props(styles.fill)}>
              <Toolbar label="Filter parts" size="sm">
                <SearchField label="Search parts" hideLabel placeholder="Search by name or SKU" />
                <Select label="Stock" hideLabel options={stockOptions} defaultValue="low" />
              </Toolbar>
            </div>
          </Labeled>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  text: { margin: 0, fontSize: font.md, lineHeight: font.leadingNormal, color: color.text },
  fill: { display: "flex", flexDirection: "column", width: "100%", minWidth: 0 },
  reading: { maxWidth: "40rem" },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.sm]: "repeat(2, minmax(0, 1fr))" },
    gap: space.lg,
  },
  tileGrid: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.sm]: "repeat(3, minmax(0, 1fr))" },
    gap: space.lg,
  },
});
