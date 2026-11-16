import * as stylex from "@stylexjs/stylex";
import { Meter } from "@/components/primitives/meter";
import { Column, defineSection, Labeled } from "../../specimen";

export default defineSection({
  component: "Meter",
  specimens: [
    {
      title: "Value text",
      note: "The value text carries the meaning. Without valueLabel, it shows the percentage.",
      render: () => (
        <Column width="24rem">
          <Labeled label="valueLabel">
            <Meter
              label="Workshop bays in use"
              value={4}
              maxValue={6}
              valueLabel="4 of 6 bays"
              style={styles.fill}
            />
          </Labeled>
          <Labeled label="percentage (default)">
            <Meter label="Storage of the photo archive" value={38} style={styles.fill} />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Warning and danger levels",
      note: "The bar turns to the warning color at warningAt and to the danger color at dangerAt. At dangerAt, the value text also takes the danger color.",
      render: () => (
        <Column width="24rem">
          <Labeled label="below warningAt">
            <Meter
              label="Bike storage racks in use"
              value={18}
              maxValue={40}
              valueLabel="18 of 40 racks"
              warningAt={32}
              dangerAt={38}
              style={styles.fill}
            />
          </Labeled>
          <Labeled label="at warningAt">
            <Meter
              label="Bike storage racks in use"
              value={34}
              maxValue={40}
              valueLabel="34 of 40 racks"
              warningAt={32}
              dangerAt={38}
              style={styles.fill}
            />
          </Labeled>
          <Labeled label="at dangerAt">
            <Meter
              label="Bike storage racks in use"
              value={39}
              maxValue={40}
              valueLabel="39 of 40 racks, almost full"
              warningAt={32}
              dangerAt={38}
              style={styles.fill}
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Empty and full",
      render: () => (
        <Column width="24rem">
          <Labeled label="value 0">
            <Meter
              label="Loan bikes in use"
              value={0}
              maxValue={8}
              valueLabel="0 of 8 bikes"
              warningAt={6}
              dangerAt={8}
              style={styles.fill}
            />
          </Labeled>
          <Labeled label="value at maxValue">
            <Meter
              label="Loan bikes in use"
              value={8}
              maxValue={8}
              valueLabel="8 of 8 bikes, none free"
              warningAt={6}
              dangerAt={8}
              style={styles.fill}
            />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Long label",
      render: () => (
        <Column width="18rem">
          <Meter
            label="Hours booked this week for the mechanics of the Montreuil workshop"
            value={142}
            maxValue={160}
            valueLabel="142 of 160 h"
            warningAt={136}
          />
        </Column>
      ),
    },
  ],
});

const styles = stylex.create({
  // Labeled aligns its children to the start, so a meter without a width shrinks to its text.
  fill: { width: "100%" },
});
