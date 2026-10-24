import * as stylex from "@stylexjs/stylex";
import {
  ChevronDown,
  Copy,
  Database,
  GitBranch,
  GitCommitHorizontal,
  Globe,
  Mail,
  Minus,
  Plus,
  Rocket,
  Search,
  MessageSquare,
  Trash2,
  Undo2,
  Webhook,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonGroup } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState, Spinner } from "@/components/ui/feedback";
import { FileTypeIcon } from "@/components/ui/file-type-icon";
import { HoverCard, HoverCardLink } from "@/components/ui/hover-card";
import { IconTile } from "@/components/ui/icon-tile";
import { Item, ItemList } from "@/components/ui/item";
import { Card, Kbd, Section } from "@/components/ui/layout";
import { ContextMenu, Menu, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { NumberField } from "@/components/ui/number-field";
import { RangeSlider, Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/ui/text-field";
import { TimeField } from "@/components/ui/time-field";
import { toast } from "@/components/ui/toaster";
import { SurfaceButton } from "@/components/ui/surface-button";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { categoryColor } from "@/styles/category";
import { color, font, media, motion, radius, shadow, size, space } from "@/styles/tokens.stylex";

const weekdays = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
] as const;

type Weekday = (typeof weekdays)[number]["id"];

const channels = [
  { id: "email", label: "Email", icon: Mail },
  { id: "slack", label: "Slack", icon: MessageSquare },
  { id: "webhook", label: "Webhook", icon: Webhook },
] as const;

type Channel = (typeof channels)[number]["id"];

const files = [
  "payroll-october.csv",
  "invoice-2041.pdf",
  "webhook-payload.json",
  "backup-2026-10-12.tar.gz",
  "api-gateway.log",
  ".env.production",
  "tls-cert.pem",
  "dashboard.png",
] as const;

function Specimen({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div {...stylex.props(styles.specimen)}>
      <span {...stylex.props(styles.label)}>{label}</span>
      <div {...stylex.props(styles.specimenBody)}>{children}</div>
    </div>
  );
}

/**
 * Lists, field add-ons, toggles, previews, and menus ported from ReUI. Rendered
 * by WorkspaceShowcase on the design-kit route.
 */
export function ControlsShowcase() {
  const [slack, setSlack] = useState(true);
  const [github, setGithub] = useState(false);
  const [days, setDays] = useState<ReadonlyArray<Weekday>>(["mon", "tue", "wed", "thu", "fri"]);
  const [notify, setNotify] = useState<ReadonlyArray<Channel>>(["email", "slack"]);
  const [retries, setRetries] = useState(3);
  const [runAt, setRunAt] = useState<string | null>("02:00");
  const [sampling, setSampling] = useState(25);
  const [latency, setLatency] = useState<readonly [number, number]>([200, 800]);
  const [zoom, setZoom] = useState(100);

  return (
    <>
      <div id="kit-items">
        <Section
          title="Items and empty states"
          description="List rows with media, meta, and actions, and first-run states."
        >
          <div {...stylex.props(styles.pair)}>
            <ItemList label="Integrations">
              <Item
                media={<IconTile icon={MessageSquare} tone="accent" />}
                title="Slack"
                description="Posts failed runs to #finance-ops."
                meta={<Badge intent="success">Connected</Badge>}
                actions={
                  <Switch isSelected={slack} onChange={setSlack} aria-label="Slack alerts" />
                }
              />
              <Item
                media={<IconTile icon={GitCommitHorizontal} />}
                title="GitHub"
                description="Links deployments to commits."
                actions={
                  <Switch isSelected={github} onChange={setGithub} aria-label="GitHub links" />
                }
              />
              <Item
                media={<IconTile icon={Database} tone="info" />}
                title="Warehouse export"
                description="Every night at 03:00 UTC"
                meta="Last run 6h ago"
                onAction={() => toast("Opened Warehouse export")}
              />
            </ItemList>
            <Card title="Members" description="3 people">
              <ItemList label="Members" framed={false}>
                {["Ada Lovelace", "Grace Hopper", "Alan Turing"].map((name, index) => (
                  <Item
                    key={name}
                    size="sm"
                    media={<Avatar name={name} size="sm" />}
                    title={name}
                    description={index === 0 ? "Owner" : "Operator"}
                    onAction={() => toast(`Opened ${name}`)}
                  />
                ))}
              </ItemList>
            </Card>
          </div>
          <div {...stylex.props(styles.pair)}>
            <EmptyState
              variant="dashed"
              icon={Webhook}
              title="No webhooks yet"
              description="Webhooks send run results to your own systems."
              action={
                <>
                  <Button intent="primary">Add webhook</Button>
                  <Button>Read the guide</Button>
                </>
              }
            />
            <Card title="Search results">
              <EmptyState
                size="sm"
                icon={Search}
                title="No jobs match “ledger 2024”"
                description="Check the spelling or clear the filters."
                action={<Button size="sm">Clear filters</Button>}
              />
            </Card>
          </div>
          <Specimen label="File types and spinners">
            {files.map((name) => (
              <span key={name} {...stylex.props(styles.file)}>
                <FileTypeIcon name={name} size="sm" />
                <span>{name}</span>
              </span>
            ))}
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" />
          </Specimen>
        </Section>
      </div>

      <div id="kit-inputs">
        <Section
          title="Field add-ons, toggles, and sliders"
          description="Prefixes, units, steppers, times, toggle groups, button groups, and sliders."
        >
          <div {...stylex.props(styles.fields)}>
            <TextField
              label="Callback URL"
              prefix="https://"
              suffix=".example.com"
              defaultValue="hooks"
            />
            <TextField
              label="Search runs"
              prefix={<Search aria-hidden width={16} height={16} />}
              suffix={<Kbd>/</Kbd>}
              placeholder="Run ID or job"
            />
            <TextField
              label="API key"
              defaultValue="sk_live_51Hh2"
              isReadOnly
              suffix={<CopyButton value="sk_live_51Hh2" label="Copy API key" />}
            />
            <TextField
              label="Checking name"
              defaultValue="ledger-sync"
              suffix={<Spinner size="sm" label="Checking" />}
            />
            <NumberField
              label="Retries"
              value={retries}
              onChange={setRetries}
              minValue={0}
              maxValue={10}
              showStepper
            />
            <NumberField label="Timeout" defaultValue={30} unit="seconds" minValue={1} />
            <TimeField
              label="Daily run time"
              description="Pick from the clock button in steps of 15 minutes, or type any time."
              value={runAt}
              onChange={setRunAt}
              minuteStep={15}
              zoneLabel="UTC"
            />
            <TimeField
              label="Window start"
              value="22:30"
              onChange={() => undefined}
              minValue="23:00"
              errorMessage="Start at 23:00 or later."
            />
          </div>
          <div {...stylex.props(styles.grid)}>
            <Specimen label="Run on days">
              <ToggleGroup
                label="Run on days"
                options={weekdays}
                value={days}
                onChange={setDays}
                size="sm"
              />
            </Specimen>
            <Specimen label="Notify by">
              <ToggleGroup
                label="Notify by"
                options={channels}
                value={notify}
                onChange={setNotify}
              />
              <ToggleGroup
                label="Notify by, icons"
                options={channels}
                value={notify}
                onChange={setNotify}
                iconOnly
              />
            </Specimen>
            <Specimen label="Button groups">
              <ButtonGroup label="Deploy actions">
                <Button intent="primary">
                  <Rocket aria-hidden width={16} height={16} />
                  Deploy
                </Button>
                <MenuTrigger>
                  <Button intent="primary" iconOnly aria-label="More deploy actions">
                    <ChevronDown aria-hidden width={16} height={16} />
                  </Button>
                  <Menu aria-label="Deploy actions">
                    <MenuItem icon={<GitBranch width={16} height={16} />}>Deploy a branch</MenuItem>
                    <MenuItem icon={<Undo2 width={16} height={16} />}>Roll back</MenuItem>
                  </Menu>
                </MenuTrigger>
              </ButtonGroup>
              <ButtonGroup label="Zoom">
                <Button
                  iconOnly
                  aria-label="Zoom out"
                  onPress={() => setZoom(Math.max(50, zoom - 25))}
                >
                  <Minus aria-hidden width={16} height={16} />
                </Button>
                <Button onPress={() => setZoom(100)}>{zoom}%</Button>
                <Button
                  iconOnly
                  aria-label="Zoom in"
                  onPress={() => setZoom(Math.min(200, zoom + 25))}
                >
                  <Plus aria-hidden width={16} height={16} />
                </Button>
              </ButtonGroup>
            </Specimen>
            <Specimen label="Sliders">
              <div {...stylex.props(styles.sliders)}>
                <Slider
                  label="Trace sampling"
                  value={sampling}
                  onChange={setSampling}
                  formatOptions={{ style: "unit", unit: "percent" }}
                  marks={[0, 25, 50, 75, 100]}
                />
                <RangeSlider
                  label="Latency band"
                  value={latency}
                  onChange={setLatency}
                  minValue={0}
                  maxValue={2000}
                  step={50}
                  formatOptions={{ style: "unit", unit: "millisecond", unitDisplay: "short" }}
                  thumbLabels={["Lowest latency", "Highest latency"]}
                />
              </div>
            </Specimen>
          </div>
        </Section>
      </div>

      <div id="kit-menus">
        <Section
          title="Hover card and context menu"
          description="Hover or focus the name for a preview. Right-click a row, or press Shift+F10 on it."
        >
          <div {...stylex.props(styles.pair)}>
            <Specimen label="Hover card">
              <span {...stylex.props(styles.sentence)}>
                Deployed by{" "}
                <HoverCard
                  content={
                    <div {...stylex.props(styles.preview)}>
                      <div {...stylex.props(styles.previewHeader)}>
                        <Avatar name="Grace Hopper" />
                        <div {...stylex.props(styles.previewText)}>
                          <span {...stylex.props(styles.previewName)}>Grace Hopper</span>
                          <span {...stylex.props(styles.muted)}>Platform team · Europe/Paris</span>
                        </div>
                      </div>
                      <span {...stylex.props(styles.muted)}>
                        On call until Sunday 18:00. 12 deploys this week.
                      </span>
                      <Button size="sm" onPress={() => toast("Opened Grace Hopper")}>
                        Open profile
                      </Button>
                    </div>
                  }
                >
                  <HoverCardLink>Grace Hopper</HoverCardLink>
                </HoverCard>{" "}
                to <Badge intent="info">production</Badge> 3 hours ago.
              </span>
            </Specimen>
            <ContextMenu
              label="Job actions"
              onAction={(key) => toast(`${String(key)}: Ledger sync`)}
              menu={
                <>
                  <MenuItem id="Run now" icon={<Rocket width={16} height={16} />} shortcut="R">
                    Run now
                  </MenuItem>
                  <MenuItem id="Copied ID" icon={<Copy width={16} height={16} />}>
                    Copy job ID
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem id="Deleted" icon={<Trash2 width={16} height={16} />} isDestructive>
                    Delete job
                  </MenuItem>
                </>
              }
            >
              <ItemList label="Jobs with a context menu">
                <Item
                  media={<IconTile icon={Globe} />}
                  title="Ledger sync"
                  description="Right-click for actions"
                  onAction={() => toast("Opened Ledger sync")}
                />
              </ItemList>
            </ContextMenu>
          </div>
        </Section>
      </div>

      <div id="kit-surfaces">
        <Section
          title="Surfaces and categories"
          description="Custom surfaces that act as one control, category colors from a hue, and display numerals."
        >
          <div {...stylex.props(styles.grid)}>
            <Card
              title="Service map"
              description="Click a tile; drag handlers on the map still see its events"
            >
              <div {...stylex.props(styles.tiles)}>
                {categories.map((category) => (
                  <SurfaceButton
                    key={category.name}
                    onClick={() => toast(`Opened ${category.name}`)}
                    style={[
                      styles.tile,
                      styles.tileEdge(categoryColor(category.hue, "line")),
                      category.name === lifted && styles.tileLifted,
                    ]}
                  >
                    <span
                      {...stylex.props(
                        styles.tileProject,
                        styles.ink(categoryColor(category.hue, "text")),
                      )}
                    >
                      {category.project}
                    </span>
                    <span {...stylex.props(styles.tileName)}>{category.name}</span>
                  </SurfaceButton>
                ))}
              </div>
            </Card>
            <Card
              title="Categories"
              description="Text, surface, and line roles share lightness and chroma"
            >
              <ul {...stylex.props(styles.swatches)}>
                {categories.map((category) => (
                  <li
                    key={category.name}
                    {...stylex.props(
                      styles.swatch,
                      styles.wash(categoryColor(category.hue, "surface")),
                    )}
                  >
                    <span
                      aria-hidden
                      {...stylex.props(
                        styles.dot,
                        styles.fill(categoryColor(category.hue, "line")),
                      )}
                    />
                    <span {...stylex.props(styles.ink(categoryColor(category.hue, "text")))}>
                      {category.project}
                    </span>
                  </li>
                ))}
              </ul>
              <div {...stylex.props(styles.numerals)}>
                <Specimen label="font.displayLg">
                  <span {...stylex.props(styles.displayLg)}>1,284</span>
                </Specimen>
                <Specimen label="font.display">
                  <span {...stylex.props(styles.display)}>98.2%</span>
                </Specimen>
              </div>
            </Card>
          </div>
        </Section>
      </div>
    </>
  );
}

const categories = [
  { name: "Checkout", project: "Payments", hue: 28 },
  { name: "Search index", project: "Catalog", hue: 178 },
  { name: "Ledger sync", project: "Finance", hue: 305 },
  { name: "Mail relay", project: "Messaging", hue: 85 },
] as const;

/** The showcase lifts one tile to show shadow.xl, the elevation of an item being dragged. */
const lifted = "Ledger sync";

const styles = stylex.create({
  pair: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.lg]: "repeat(2, minmax(0, 1fr))" },
    gap: space.lg,
    alignItems: "start",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: { default: "1fr", [media.md]: "repeat(2, minmax(0, 1fr))" },
    gap: space.lg,
    alignItems: "start",
  },
  fields: {
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      [media.md]: "repeat(2, minmax(0, 1fr))",
      [media.xl]: "repeat(4, minmax(0, 1fr))",
    },
    gap: space.lg,
    alignItems: "start",
  },
  specimen: { display: "flex", flexDirection: "column", gap: space.sm, minWidth: 0 },
  specimenBody: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: space.sm },
  label: { fontSize: font.sm, fontWeight: font.medium, color: color.textMuted },
  file: { display: "inline-flex", alignItems: "center", gap: space.xs, fontSize: font.sm },
  sliders: {
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
    width: "100%",
    maxWidth: "24rem",
  },
  sentence: { fontSize: font.md, color: color.text },
  preview: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: space.sm },
  previewHeader: { display: "flex", alignItems: "center", gap: space.sm },
  previewText: { display: "flex", flexDirection: "column", gap: "2px" },
  previewName: { fontWeight: font.semibold },
  muted: { fontSize: font.sm, color: color.textMuted },
  icon: { width: size.icon, height: size.icon },
  tiles: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: space.md },
  tile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: space.xs,
    padding: space.md,
    borderRadius: radius.xl,
    backgroundColor: color.raised,
    boxShadow: shadow.md,
    transitionProperty: "box-shadow, translate",
    transitionDuration: { default: motion.normal, [media.reducedMotion]: "0ms" },
    transitionTimingFunction: motion.ease,
  },
  tileEdge: (line: string) => ({
    borderTopStyle: "solid",
    borderTopWidth: "2px",
    borderTopColor: line,
  }),
  tileLifted: { translate: "0 -4px", boxShadow: shadow.xl },
  tileProject: {
    fontFamily: font.mono,
    fontSize: font.xs,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  tileName: { fontSize: font.lg, fontWeight: font.semibold },
  swatches: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.sm,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  swatch: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.xs,
    paddingBlock: space.xs,
    paddingInline: space.sm,
    borderRadius: radius.full,
    fontSize: font.sm,
    fontWeight: font.medium,
  },
  dot: { width: "8px", height: "8px", borderRadius: radius.full },
  ink: (value: string) => ({ color: value }),
  wash: (value: string) => ({ backgroundColor: value }),
  fill: (value: string) => ({ backgroundColor: value }),
  numerals: { display: "flex", gap: space.xxl, marginTop: space.lg },
  displayLg: {
    fontSize: font.displayLg,
    fontWeight: font.semibold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  display: {
    fontSize: font.display,
    fontWeight: font.semibold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
});
