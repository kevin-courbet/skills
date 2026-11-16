import { useState } from "react";
import { ComboBox } from "@/components/primitives/combo-box";
import type { ListOption } from "@/components/helpers/list-box";
import { Column, defineSection, Labeled, Row } from "../../specimen";

const customers: ReadonlyArray<ListOption<string>> = [
  { id: "c-1042", label: "Amira Benali", description: "Gazelle Ultimate C380, 3 open orders" },
  { id: "c-1043", label: "Tom Becker", description: "Cube Attain GTC" },
  { id: "c-1051", label: "Clara Dubois", description: "Brompton C Line Explore" },
  { id: "c-1058", label: "Henrik Larsen", description: "Specialized Turbo Vado 4.0" },
  { id: "c-1060", label: "Yuki Tanaka", description: "Surly Long Haul Trucker" },
  { id: "c-1064", label: "Pedro Alves", description: "Trek Marlin 7" },
  { id: "c-1071", label: "Nora Kowalski", description: "Riese & Müller Load 75" },
  { id: "c-1077", label: "Felix Wagner", description: "Canyon Grail CF SL" },
];

const parts: ReadonlyArray<ListOption<string>> = [
  { id: "p-cn-11", label: "Chain, 11-speed", intent: "success" },
  { id: "p-bp-hyd", label: "Brake pads, hydraulic disc", intent: "warning" },
  { id: "p-tb-700", label: "Inner tube, 700x28c", intent: "success" },
  { id: "p-cs-1132", label: "Cassette, 11-32T", intent: "danger" },
  { id: "p-cb-shift", label: "Shift cable, stainless", intent: "success" },
  { id: "p-bb-bsa", label: "Bottom bracket, BSA threaded", intent: "warning" },
];

const suppliers: ReadonlyArray<ListOption<string>> = [
  { id: "s-velo", label: "Velo Parts Wholesale Europe, warehouse in Rotterdam" },
  { id: "s-cycle", label: "Cycle Supply Co." },
];

function CustomerLookup() {
  const [customer, setCustomer] = useState<string | null>(null);
  return (
    <ComboBox
      label="Customer"
      width="lg"
      placeholder="e.g. Amira Benali"
      options={customers}
      value={customer}
      onChange={setCustomer}
    />
  );
}

function PartLookup() {
  const [part, setPart] = useState<string | null>("p-bp-hyd");
  return (
    <ComboBox
      label="Part"
      width="lg"
      description="Open the list to see stock: green in stock, amber low, red out of stock."
      options={parts}
      value={part}
      onChange={setPart}
    />
  );
}

function SupplierLookup() {
  const [supplier, setSupplier] = useState<string | null>("s-velo");
  return (
    <ComboBox
      label="Supplier"
      width="md"
      options={suppliers}
      value={supplier}
      onChange={setSupplier}
    />
  );
}

export default defineSection({
  component: "ComboBox",
  specimens: [
    {
      title: "Type to filter",
      note: "Use it for a long list where people know the name, such as a customer. Type to filter, or press the chevron to see all options.",
      render: () => (
        <Row align="start">
          <Labeled label="empty, with description options">
            <CustomerLookup />
          </Labeled>
          <Labeled label="value, with intent options">
            <PartLookup />
          </Labeled>
        </Row>
      ),
    },
    {
      title: "Field states",
      render: () => (
        <Column width="26rem">
          <Labeled label="description, isRequired">
            <ComboBox
              label="Customer"
              width="lg"
              placeholder="e.g. Tom Becker"
              description="Search by name. The invoice goes to this customer."
              options={customers}
              isRequired
            />
          </Labeled>
          <Labeled label="isOptional">
            <ComboBox
              label="Referred by"
              width="lg"
              placeholder="e.g. Clara Dubois"
              options={customers}
              isOptional
            />
          </Labeled>
          <Labeled label="errorMessage">
            <ComboBox
              label="Customer"
              width="lg"
              placeholder="e.g. Tom Becker"
              options={customers}
              errorMessage="Choose a customer for the work order."
            />
          </Labeled>
          <Labeled label="isReadOnly">
            <ComboBox label="Customer" width="lg" options={customers} value="c-1051" isReadOnly />
          </Labeled>
          <Labeled label="isDisabled">
            <ComboBox label="Customer" width="lg" options={customers} value="c-1058" isDisabled />
          </Labeled>
        </Column>
      ),
    },
    {
      title: "Long option label",
      note: "A chosen label that is longer than the field ends with an ellipsis. It scrolls when the field has focus.",
      render: () => <SupplierLookup />,
    },
  ],
});
