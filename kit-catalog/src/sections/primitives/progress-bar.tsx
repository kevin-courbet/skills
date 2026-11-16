import * as stylex from "@stylexjs/stylex";
import { ProgressBar } from "@/components/primitives/progress-bar";
import { Column, defineSection, Labeled } from "../../specimen";

export default defineSection({
  component: "ProgressBar",
  specimens: [
    {
      title: "Value text",
      note: "Without valueLabel, the value text shows the percentage.",
      render: () => (
        <Column width="24rem">
          <Labeled label="valueLabel">
            <ProgressBar
              label="Import of the parts catalog"
              value={3}
              maxValue={12}
              valueLabel="3 of 12 files"
              style={styles.fill}
            />
          </Labeled>
          <Labeled label="percentage (default)">
            <ProgressBar label="Export of the November invoices" value={64} style={styles.fill} />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Indeterminate",
      note: "Pass isIndeterminate while the total is unknown. The value text does not show.",
      render: () => (
        <Column width="24rem">
          <ProgressBar label="Sync of the supplier price list" isIndeterminate />
        </Column>
      ),
    },
    {
      title: "Start and end",
      render: () => (
        <Column width="24rem">
          <Labeled label="value 0">
            <ProgressBar
              label="Import of the customer list"
              value={0}
              maxValue={480}
              valueLabel="0 of 480 customers"
              style={styles.fill}
            />
          </Labeled>
          <Labeled label="value at maxValue">
            <ProgressBar
              label="Import of the customer list"
              value={480}
              maxValue={480}
              valueLabel="480 of 480 customers"
              style={styles.fill}
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Hidden label",
      note: "hideLabel keeps the label for assistive technology only, such as in a file row that names the file.",
      render: () => (
        <Column width="24rem">
          <ProgressBar label="Uploading wo-4821-rear-derailleur.jpg" hideLabel value={45} />
        </Column>
      ),
    },
    {
      title: "Long label",
      render: () => (
        <Column width="18rem">
          <ProgressBar
            label="Import of the spare parts catalog from the Shimano and SRAM distributors"
            value={1240}
            maxValue={3800}
            valueLabel="1,240 of 3,800 parts"
          />
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  // Labeled aligns its children to the start, so a bar without a width shrinks to its text.
  fill: { width: "100%" },
});
