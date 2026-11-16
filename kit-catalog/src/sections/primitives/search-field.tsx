import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/primitives/button";
import { Toolbar } from "@/components/primitives/layout";
import { SearchField } from "@/components/primitives/search-field";
import { Column, defineSection, Labeled } from "../../specimen";

function OrderSearch() {
  const [query, setQuery] = useState("");
  return (
    <Toolbar
      label="Filter work orders"
      actions={<Button iconOnly icon={Download} intent="ghost" aria-label="Export work orders" />}
    >
      <SearchField
        label="Search work orders"
        hideLabel
        focusShortcut
        placeholder="Search by customer, bike, or order number"
        value={query}
        onChange={setQuery}
      />
    </Toolbar>
  );
}

export default defineSection({
  component: "SearchField",
  specimens: [
    {
      title: "In a toolbar",
      note: "Put the search first in its row. With focusShortcut, the / key focuses the field, and the hint shows while it is empty. Give focusShortcut only to the main search of a page. This page shows the specimen in two themes, so the / key focuses the last one.",
      render: () => (
        <Column width="40rem">
          <OrderSearch />
        </Column>
      ),
    },
    {
      title: "Visible label",
      render: () => (
        <Column width="24rem">
          <SearchField label="Search parts" placeholder="Search by name or SKU" />
        </Column>
      ),
    },
    {
      title: "With text",
      note: "The clear button shows while the field has text. Escape clears the value too.",
      render: () => (
        <Column width="24rem">
          <SearchField label="Search customers" hideLabel defaultValue="Laurent" />
        </Column>
      ),
    },
    {
      title: "Compact toolbar",
      render: () => (
        <Column width="40rem">
          <Toolbar label="Filter invoices" size="sm">
            <SearchField
              label="Search invoices"
              hideLabel
              placeholder="Search by invoice number or customer"
            />
          </Toolbar>
        </Column>
      ),
    },
    {
      title: "Disabled and long text",
      render: () => (
        <Column width="18rem">
          <Labeled label="isDisabled">
            <SearchField
              label="Search mechanics"
              hideLabel
              isDisabled
              placeholder="Search by name"
            />
          </Labeled>
          <Labeled label="long value">
            <SearchField
              label="Search parts"
              hideLabel
              defaultValue="Shimano Deore XT M8100 12-speed cassette 10-51 teeth"
            />
          </Labeled>
        </Column>
      ),
    },
  ],
});
