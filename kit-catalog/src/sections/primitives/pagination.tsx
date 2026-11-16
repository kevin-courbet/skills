import { FileText } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/primitives/badge";
import { IconTile } from "@/components/primitives/icon-tile";
import { Item, ItemList } from "@/components/primitives/item";
import { Pagination } from "@/components/primitives/pagination";
import { formatCurrency, formatInteger } from "@/lib/locale";
import { Column, defineSection, Labeled } from "../../specimen";

type Invoice = {
  readonly id: string;
  readonly customer: string;
  readonly total: number;
  readonly paid: boolean;
};

const invoicePages: ReadonlyArray<ReadonlyArray<Invoice>> = [
  [
    { id: "INV-2041", customer: "Amélie Durand", total: 184.5, paid: true },
    { id: "INV-2040", customer: "Lucas Moreau", total: 62, paid: false },
    { id: "INV-2039", customer: "Chloé Bernard", total: 312.9, paid: true },
  ],
  [
    { id: "INV-2038", customer: "Hugo Petit", total: 45, paid: true },
    { id: "INV-2037", customer: "Léa Fontaine", total: 129.99, paid: false },
    { id: "INV-2036", customer: "Nathan Girard", total: 88.4, paid: true },
  ],
  [
    { id: "INV-2035", customer: "Inès Lambert", total: 230, paid: true },
    { id: "INV-2034", customer: "Théo Rousseau", total: 19.5, paid: true },
    { id: "INV-2033", customer: "Manon Leroy", total: 405.75, paid: false },
  ],
];

function InvoiceListPages() {
  const [page, setPage] = useState(1);
  const invoices = invoicePages[page - 1] ?? [];
  return (
    <Column width="32rem">
      <ItemList label="Invoices">
        {invoices.map((invoice) => (
          <Item
            key={invoice.id}
            media={<IconTile icon={FileText} />}
            title={invoice.id}
            description={invoice.customer}
            meta={
              <>
                <Badge intent={invoice.paid ? "success" : "warning"}>
                  {invoice.paid ? "Paid" : "Due"}
                </Badge>
                {formatCurrency(invoice.total)}
              </>
            }
          />
        ))}
      </ItemList>
      <Pagination
        page={page}
        pageCount={invoicePages.length}
        onPageChange={setPage}
        format={formatInteger}
      />
    </Column>
  );
}

function Pager({
  initialPage,
  pageCount,
}: {
  readonly initialPage: number;
  readonly pageCount: number;
}) {
  const [page, setPage] = useState(initialPage);
  return (
    <Pagination page={page} pageCount={pageCount} onPageChange={setPage} format={formatInteger} />
  );
}

export default defineSection({
  component: "Pagination",
  specimens: [
    {
      title: "Under an ItemList",
      note: "Use it for a list that the server pages. A table uses the pagination footer of DataTable.",
      render: () => <InvoiceListPages />,
    },
    {
      title: "First and last page",
      note: "Previous is disabled on the first page, and Next on the last page.",
      render: () => (
        <Column width="32rem">
          <Pager initialPage={1} pageCount={8} />
          <Pager initialPage={8} pageCount={8} />
        </Column>
      ),
    },
    {
      title: "Large page numbers",
      note: "format gives the page numbers the app locale, such as a group separator.",
      render: () => (
        <Column width="32rem">
          <Pager initialPage={1024} pageCount={1240} />
        </Column>
      ),
    },
    {
      title: "One page",
      note: "With one page or no page, Pagination renders nothing.",
      render: () => (
        <Column width="32rem">
          <Labeled label="pageCount 1: nothing renders">
            <Pager initialPage={1} pageCount={1} />
          </Labeled>
        </Column>
      ),
    },
  ],
});
