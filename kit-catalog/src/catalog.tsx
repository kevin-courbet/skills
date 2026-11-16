import * as stylex from "@stylexjs/stylex";
import { Columns2, Hand, Monitor, Moon, Sun } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { UNSAFE_PortalProvider } from "react-aria";
import type { Density } from "@/components/helpers/density";
import { Badge } from "@/components/primitives/badge";
import { Code, Page } from "@/components/primitives/layout";
import { SearchField } from "@/components/primitives/search-field";
import { SegmentedControl } from "@/components/primitives/segmented-control";
import { Toaster } from "@/components/primitives/toaster";
import { kitComponents, type KitComponent } from "@/kit-catalog-index";
import { darkTheme, lightTheme } from "@/styles/themes";
import { color, font, radius, size, space } from "@/styles/tokens.stylex";
import { catalogExclusions, excludedLayers } from "./exclusions";
import { foundationSpecimens } from "./foundations";
import type { Section, Specimen } from "./specimen";

type ThemeMode = "light" | "dark" | "both";
type Theme = "light" | "dark";

const sectionModules = import.meta.glob<Section>("./sections/**/*.tsx", {
  eager: true,
  import: "default",
});

/** The section of each component id. A section file has the path of its kit file under `sections/`. */
const sectionsById: ReadonlyMap<string, Section> = (() => {
  const byFile = new Map(kitComponents.map((component) => [component.file, component]));
  const sections = new Map<string, Section>();
  for (const [path, section] of Object.entries(sectionModules)) {
    const file = path.replace(/^\.\/sections\//, "src/components/");
    const component = byFile.get(file);
    if (component === undefined) {
      throw new Error(`The catalog section ${path} has no kit file at ${file}.`);
    }
    if (section.component !== component.id) {
      throw new Error(
        `The catalog section ${path} declares "${section.component}", but its kit file is "${component.id}".`,
      );
    }
    sections.set(component.id, section);
  }
  return sections;
})();

const layerOrder: ReadonlyArray<{ readonly layer: string; readonly title: string }> = [
  { layer: "primitive", title: "Primitives" },
  { layer: "pattern", title: "Patterns" },
  { layer: "shell", title: "Shell" },
];

const shownComponents = kitComponents.filter(
  (component) => !excludedLayers.includes(component.layer),
);

function matches(component: KitComponent, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const text = `${component.id} ${component.summary}`.toLowerCase();
  return words.every((word) => text.includes(word));
}

/** The page that shows every kit component in its states, for a review by people. */
export function Catalog() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("both");
  const [density, setDensity] = useState<Density>("default");
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => shownComponents.filter((component) => matches(component, query)),
    [query],
  );
  const showFoundations =
    query.trim() === "" || "foundations tokens colors".includes(query.trim().toLowerCase());
  const chromeTheme = themeMode === "both" ? undefined : themeStyles(themeMode);

  return (
    <div {...stylex.props(chromeTheme, styles.root)}>
      {/* An app mounts the Toaster in AppShell, which the catalog does not show. */}
      <Toaster />
      <header {...stylex.props(styles.topbar)}>
        <div {...stylex.props(styles.brand)}>
          <span {...stylex.props(styles.brandName)}>Design Kit</span>
          <span {...stylex.props(styles.brandMeta)}>
            {shownComponents.length} components, {sectionsById.size} with specimens
          </span>
        </div>
        <div {...stylex.props(styles.controls)}>
          <SearchField
            label="Filter components"
            hideLabel
            placeholder="Filter by name or summary"
            value={query}
            onChange={setQuery}
            style={styles.search}
          />
          <SegmentedControl
            label="Theme"
            options={[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "both", label: "Both", icon: Columns2 },
            ]}
            value={themeMode}
            onChange={setThemeMode}
          />
          <SegmentedControl
            label="Density"
            options={[
              { id: "default", label: "Default", icon: Monitor },
              { id: "touch", label: "Touch", icon: Hand },
            ]}
            value={density}
            onChange={setDensity}
          />
        </div>
      </header>
      <div {...stylex.props(styles.body)}>
        <nav aria-label="Components" {...stylex.props(styles.nav)}>
          {showFoundations ? (
            <NavGroup title="Foundations">
              <NavItem id="foundations" label="Tokens" />
            </NavGroup>
          ) : null}
          {layerOrder.map(({ layer, title }) => {
            const items = visible.filter((component) => component.layer === layer);
            if (items.length === 0) return null;
            return (
              <NavGroup key={layer} title={title}>
                {items.map((component) => (
                  <NavItem
                    key={component.id}
                    id={component.id}
                    label={component.id}
                    isMissing={!sectionsById.has(component.id)}
                  />
                ))}
              </NavGroup>
            );
          })}
        </nav>
        <main {...stylex.props(styles.main)}>
          {showFoundations ? (
            <CatalogSection
              id="foundations"
              title="Foundations"
              layerTitle="Tokens"
              summary="The surfaces, text, accent, status and category colors, the type scale, the spacing, the radii, and the shadows."
              docsCommand="design read kit-tokens"
            >
              {foundationSpecimens.map((specimen) => (
                <SpecimenBlock
                  key={specimen.title}
                  specimen={specimen}
                  themeMode={themeMode}
                  density={density}
                />
              ))}
            </CatalogSection>
          ) : null}
          {visible.length === 0 && !showFoundations ? (
            <p {...stylex.props(styles.empty)}>No component matches “{query}”.</p>
          ) : null}
          {layerOrder.flatMap(({ layer, title }) =>
            visible
              .filter((component) => component.layer === layer)
              .map((component) => (
                <ComponentSection
                  key={component.id}
                  component={component}
                  layerTitle={title}
                  themeMode={themeMode}
                  density={density}
                />
              )),
          )}
        </main>
      </div>
    </div>
  );
}

function themeStyles(theme: Theme) {
  return theme === "dark" ? darkTheme : lightTheme;
}

function NavGroup({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <div {...stylex.props(styles.navGroup)}>
      <span {...stylex.props(styles.navTitle)}>{title}</span>
      <ul {...stylex.props(styles.navList)}>{children}</ul>
    </div>
  );
}

function NavItem({
  id,
  label,
  isMissing = false,
}: {
  readonly id: string;
  readonly label: string;
  readonly isMissing?: boolean;
}) {
  return (
    <li>
      <a href={`#${id}`} {...stylex.props(styles.navLink, isMissing && styles.navLinkMissing)}>
        {label}
      </a>
    </li>
  );
}

function ComponentSection({
  component,
  layerTitle,
  themeMode,
  density,
}: {
  readonly component: KitComponent;
  readonly layerTitle: string;
  readonly themeMode: ThemeMode;
  readonly density: Density;
}) {
  const section = sectionsById.get(component.id);
  const exclusion = catalogExclusions[component.id];
  return (
    <CatalogSection
      id={component.id}
      title={component.id}
      layerTitle={layerTitle}
      summary={component.summary}
      docsCommand={`design docs ${component.id}`}
    >
      {section === undefined ? (
        <p {...stylex.props(styles.empty)}>{exclusion ?? "This component has no specimens yet."}</p>
      ) : (
        section.specimens.map((specimen) => (
          <SpecimenBlock
            key={specimen.title}
            specimen={specimen}
            themeMode={themeMode}
            density={density}
          />
        ))
      )}
    </CatalogSection>
  );
}

function CatalogSection({
  id,
  title,
  layerTitle,
  summary,
  docsCommand,
  children,
}: {
  readonly id: string;
  readonly title: string;
  readonly layerTitle: string;
  readonly summary: string;
  readonly docsCommand: string;
  readonly children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} {...stylex.props(styles.section)}>
      <header {...stylex.props(styles.sectionHeader)}>
        <div {...stylex.props(styles.sectionTitleRow)}>
          <h2 id={headingId} {...stylex.props(styles.sectionTitle)}>
            {title}
          </h2>
          <Badge appearance="outline">{layerTitle}</Badge>
        </div>
        <p {...stylex.props(styles.sectionSummary)}>{summary}</p>
        <Code>{docsCommand}</Code>
      </header>
      {children}
    </section>
  );
}

function SpecimenBlock({
  specimen,
  themeMode,
  density,
}: {
  readonly specimen: Specimen;
  readonly themeMode: ThemeMode;
  readonly density: Density;
}) {
  const themes: ReadonlyArray<Theme> = themeMode === "both" ? ["light", "dark"] : [themeMode];
  return (
    <div {...stylex.props(styles.specimen)}>
      <div {...stylex.props(styles.specimenHeading)}>
        <h3 {...stylex.props(styles.specimenTitle)}>{specimen.title}</h3>
        {specimen.note === undefined ? null : (
          <p {...stylex.props(styles.specimenNote)}>{specimen.note}</p>
        )}
      </div>
      <div
        {...stylex.props(
          styles.columns,
          themes.length === 2 && !specimen.wide && styles.columnsSideBySide,
        )}
      >
        {themes.map((theme) => (
          <ThemeColumn key={theme} theme={theme} density={density} showLabel={themes.length === 2}>
            {specimen.render()}
          </ThemeColumn>
        ))}
      </div>
    </div>
  );
}

/**
 * One theme of a specimen. The overlays that the specimen opens render in this
 * column, so a popover in the dark column also has the dark theme.
 */
function ThemeColumn({
  theme,
  density,
  showLabel,
  children,
}: {
  readonly theme: Theme;
  readonly density: Density;
  readonly showLabel: boolean;
  readonly children: ReactNode;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setContainer}
      data-theme={theme}
      {...stylex.props(themeStyles(theme), styles.themeColumn)}
    >
      {showLabel ? (
        <span {...stylex.props(styles.themeLabel)}>{theme === "dark" ? "Dark" : "Light"}</span>
      ) : null}
      {container === null ? null : (
        <UNSAFE_PortalProvider getContainer={() => container}>
          <Page density={density}>{children}</Page>
        </UNSAFE_PortalProvider>
      )}
    </div>
  );
}

const styles = stylex.create({
  root: {
    colorScheme: color.scheme,
    minHeight: "100dvh",
    backgroundColor: color.frame,
    color: color.text,
    fontFamily: font.sans,
    fontSize: font.md,
    lineHeight: font.leadingNormal,
  },
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    paddingBlock: space.sm,
    paddingInline: space.lg,
    backgroundColor: color.frame,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: color.borderSubtle,
  },
  brand: { display: "flex", alignItems: "baseline", gap: space.md, flexWrap: "wrap" },
  brandName: { fontSize: font.lg, fontWeight: font.semibold },
  brandMeta: { fontSize: font.sm, color: color.textMuted },
  controls: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: space.sm },
  search: { width: { default: "100%", "@media (min-width: 640px)": size.fieldMd } },
  body: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (min-width: 1024px)": "13rem minmax(0, 1fr)",
    },
  },
  nav: {
    display: { default: "none", "@media (min-width: 1024px)": "flex" },
    flexDirection: "column",
    gap: space.lg,
    position: "sticky",
    top: "3.5rem",
    alignSelf: "start",
    maxHeight: "calc(100dvh - 3.5rem)",
    overflowY: "auto",
    paddingBlock: space.lg,
    paddingInline: space.md,
  },
  navGroup: { display: "flex", flexDirection: "column", gap: space.xs },
  navTitle: {
    paddingInline: space.sm,
    fontSize: font.sm,
    fontWeight: font.medium,
    color: color.textFaint,
  },
  navList: { listStyle: "none", margin: 0, padding: 0 },
  navLink: {
    display: "block",
    paddingBlock: space.xs,
    paddingInline: space.sm,
    borderRadius: radius.md,
    color: { default: color.textMuted, ":hover": color.text },
    backgroundColor: { default: "transparent", ":hover": color.frameHover },
    textDecoration: "none",
    fontSize: font.md,
  },
  navLinkMissing: { color: color.textFaint, fontStyle: "italic" },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: space.section,
    minWidth: 0,
    paddingBlock: space.xl,
    paddingInline: { default: space.lg, "@media (min-width: 768px)": space.xxl },
  },
  section: { display: "flex", flexDirection: "column", gap: space.xl, scrollMarginTop: "4.5rem" },
  sectionHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: space.sm,
  },
  sectionTitleRow: { display: "flex", alignItems: "center", gap: space.md },
  sectionTitle: {
    margin: 0,
    fontSize: font.xxl,
    fontWeight: font.semibold,
    lineHeight: font.leadingTight,
  },
  sectionSummary: { margin: 0, maxWidth: size.readingMax, color: color.textMuted },
  specimen: { display: "flex", flexDirection: "column", gap: space.md },
  specimenHeading: { display: "flex", flexDirection: "column", gap: space.xs },
  specimenTitle: { margin: 0, fontSize: font.lg, fontWeight: font.medium },
  specimenNote: { margin: 0, maxWidth: size.readingMax, fontSize: font.md, color: color.textMuted },
  columns: { display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: space.md },
  columnsSideBySide: {
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (min-width: 1280px)": "repeat(2, minmax(0, 1fr))",
    },
  },
  themeColumn: {
    position: "relative",
    minWidth: 0,
    colorScheme: color.scheme,
    backgroundColor: color.page,
    color: color.text,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: color.borderSubtle,
    borderRadius: radius.xl,
  },
  themeLabel: {
    position: "absolute",
    top: space.sm,
    insetInlineEnd: space.md,
    fontSize: font.xs,
    color: color.textFaint,
  },
  empty: { margin: 0, color: color.textMuted, fontStyle: "italic" },
});
