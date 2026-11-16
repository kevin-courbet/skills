import * as stylex from "@stylexjs/stylex";
import { Card } from "@/components/primitives/layout";
import { ProgressCircle } from "@/components/primitives/progress-circle";
import { size } from "@/styles/tokens.stylex";
import { Column, defineSection, Labeled, Row } from "../../specimen";

export default defineSection({
  component: "ProgressCircle",
  specimens: [
    {
      title: "Sizes",
      note: "Use sm in a table row or next to body text, md in a card header, and lg next to a control.",
      render: () => (
        <Row>
          <Labeled label="sm">
            <ProgressCircle
              label="Export of the November invoices"
              value={64}
              size="sm"
              style={styles.slot}
            />
          </Labeled>
          <Labeled label="md (default)">
            <ProgressCircle
              label="Export of the November invoices"
              value={64}
              style={styles.slot}
            />
          </Labeled>
          <Labeled label="lg">
            <ProgressCircle
              label="Export of the November invoices"
              value={64}
              size="lg"
              style={styles.slot}
            />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Value text",
      note: "showValue puts the value text after the ring. valueLabel replaces the percentage.",
      render: () => (
        <Row>
          <Labeled label="showValue">
            <ProgressCircle
              label="Export of the November invoices"
              value={64}
              size="sm"
              showValue
              style={styles.slot}
            />
          </Labeled>
          <Labeled label="showValue valueLabel">
            <ProgressCircle
              label="Import of the parts catalog"
              value={3}
              maxValue={12}
              valueLabel="3 of 12"
              size="sm"
              showValue
              style={styles.slot}
            />
          </Labeled>
          <Labeled label="showValue lg">
            <ProgressCircle
              label="Export of the November invoices"
              value={64}
              size="lg"
              showValue
              style={styles.slot}
            />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Indeterminate",
      note: "Pass isIndeterminate until the total is known. The value text does not show.",
      render: () => (
        <Row>
          <Labeled label="sm">
            <ProgressCircle
              label="Sync of the supplier price list"
              isIndeterminate
              size="sm"
              showValue
              style={styles.slot}
            />
          </Labeled>
          <Labeled label="md">
            <ProgressCircle
              label="Sync of the supplier price list"
              isIndeterminate
              showValue
              style={styles.slot}
            />
          </Labeled>
          <Labeled label="lg">
            <ProgressCircle
              label="Sync of the supplier price list"
              isIndeterminate
              size="lg"
              showValue
              style={styles.slot}
            />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Empty and complete",
      render: () => (
        <Row>
          <Labeled label="value 0">
            <ProgressCircle label="Import of the customer list" value={0} showValue />
          </Labeled>
          <Labeled label="value at maxValue">
            <ProgressCircle
              label="Import of the customer list"
              value={480}
              maxValue={480}
              showValue
            />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "In a card header",
      note: "The ring fits where a bar has no room, such as the actions of a card header.",
      render: () => (
        <Column width="28rem">
          <Card
            title="Parts catalog import"
            description="Shimano distributor, started 10:42"
            actions={
              <ProgressCircle
                label="Import of the parts catalog"
                value={1240}
                maxValue={3800}
                valueLabel="1,240 of 3,800"
                showValue
              />
            }
          >
            The import adds new parts and updates the prices of the parts that the workshop already
            stocks.
          </Card>
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  // Each ring sits in a box as tall as the largest ring, so the captions of a row line up.
  slot: { height: size.controlLg },
});
