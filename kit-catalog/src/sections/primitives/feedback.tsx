import * as stylex from "@stylexjs/stylex";
import { Bike, ClipboardList, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { EmptyState, ErrorState, Skeleton, Spinner } from "@/components/primitives/feedback";
import { Card } from "@/components/primitives/layout";
import { TextField } from "@/components/primitives/text-field";
import { radius, space } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled, Row } from "../../specimen";

export default defineSection({
  component: "Feedback",
  specimens: [
    {
      title: "EmptyState variants",
      note: "plain sits in a table, card, or panel. dashed frames a first-run area of a page.",
      render: () => (
        <Column>
          <Labeled label="plain">
            <Card headingLevel={3} title="Work orders" style={styles.fill}>
              <EmptyState
                icon={ClipboardList}
                title="No work orders yet"
                description="Create a work order when a customer drops off a bike."
                action={<Button intent="primary">Create work order</Button>}
              />
            </Card>
          </Labeled>
          <Labeled label="dashed">
            <div {...stylex.props(styles.fill)}>
              <EmptyState
                icon={Bike}
                variant="dashed"
                title="No bikes on file"
                description="Add the bikes of this customer to see their service history."
                action={
                  <>
                    <Button intent="primary">Add bike</Button>
                    <Button>Import from CSV</Button>
                  </>
                }
              />
            </div>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "EmptyState size sm and filtered result",
      note: "A result that filters to empty gets a Clear filters action. sm fits a card section or a popover.",
      render: () => (
        <Column width="28rem">
          <Labeled label="size sm, filtered">
            <Card headingLevel={3} title="Parts in stock" style={styles.fill}>
              <EmptyState
                icon={Package}
                size="sm"
                title="No parts match the filters"
                description="Remove a filter to see more parts."
                action={<Button size="sm">Clear filters</Button>}
              />
            </Card>
          </Labeled>
          <Labeled label="size sm, no icon">
            <Card headingLevel={3} title="Notes" style={styles.fill}>
              <EmptyState size="sm" title="No notes" />
            </Card>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "ErrorState",
      note: "Show the failure in place of the data. Never replace an error with an empty state.",
      render: () => (
        <Column width="36rem">
          <Labeled label="title and action">
            <div {...stylex.props(styles.fill)}>
              <ErrorState
                title="Work orders did not load"
                message="The shop server did not answer. Check the connection, then try again."
                action={<Button icon={RefreshCw}>Try again</Button>}
              />
            </div>
          </Labeled>
          <Labeled label="default title">
            <div {...stylex.props(styles.fill)}>
              <ErrorState message="The invoice INV-2291 could not be read. Contact the shop owner." />
            </div>
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Spinner",
      note: "Use sm in the suffix of a field. A button shows its own spinner with isPending. Name what loads in label.",
      render: () => (
        <Column>
          <Row>
            <Labeled label="sm">
              <span {...stylex.props(styles.spinnerStage)}>
                <Spinner size="sm" label="Loading parts" />
              </span>
            </Labeled>
            <Labeled label="md">
              <span {...stylex.props(styles.spinnerStage)}>
                <Spinner label="Loading parts" />
              </span>
            </Labeled>
            <Labeled label="lg">
              <span {...stylex.props(styles.spinnerStage)}>
                <Spinner size="lg" label="Loading the parts catalog" />
              </span>
            </Labeled>
          </Row>
          <Labeled label="in a field suffix">
            <TextField
              label="Part number"
              width="sm"
              defaultValue="CN-HG601"
              suffix={<Spinner size="sm" label="Checking stock" />}
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Skeleton",
      note: "Use it only for a load that the client starts and that takes more than about 300 ms. Data that the server loads renders directly.",
      render: () => (
        <Column width="24rem">
          {[0, 1, 2].map((row) => (
            <div key={row} {...stylex.props(styles.skeletonRow)}>
              <Skeleton style={styles.avatar} />
              <div {...stylex.props(styles.skeletonLines)}>
                <Skeleton style={styles.lineWide} />
                <Skeleton style={styles.lineShort} />
              </div>
            </div>
          ))}
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  fill: { width: "100%" },
  // One height for each spinner size, so that the captions line up.
  spinnerStage: { display: "flex", alignItems: "center", height: "1.5rem" },
  skeletonRow: { display: "flex", alignItems: "center", gap: space.md },
  skeletonLines: { display: "flex", flexDirection: "column", gap: space.sm, flexGrow: 1 },
  avatar: { width: "2rem", height: "2rem", borderRadius: radius.full, flexShrink: 0 },
  lineWide: { width: "80%", height: "0.75rem" },
  lineShort: { width: "45%", height: "0.75rem" },
});
