import { Breadcrumbs } from "@/components/primitives/breadcrumbs";
import { Column, defineSection } from "../../specimen";

export default defineSection({
  component: "Breadcrumbs",
  specimens: [
    {
      title: "Trail to a record",
      note: "The app shell renders the trail from route data through RouteBreadcrumbs. Do not add a second trail to a page.",
      render: () => (
        <Breadcrumbs
          items={[
            { id: "work-orders", label: "Work orders", href: "/" },
            { id: "wo-1048", label: "WO-1048", href: "/" },
            { id: "parts", label: "Parts", href: "/" },
          ]}
        />
      ),
    },
    {
      title: "Two levels",
      render: () => (
        <Breadcrumbs
          items={[
            { id: "customers", label: "Customers", href: "/" },
            { id: "lena-fischer", label: "Lena Fischer", href: "/" },
          ]}
        />
      ),
    },
    {
      title: "Current page only",
      render: () => <Breadcrumbs items={[{ id: "invoices", label: "Invoices", href: "/" }]} />,
    },
    {
      title: "Long names in a narrow frame",
      note: "The current page has priority: the items before it shrink first. Below the sm breakpoint, only the current page shows.",
      render: () => (
        <Column width="22rem">
          <Breadcrumbs
            items={[
              { id: "customers", label: "Customers", href: "/" },
              { id: "velo-club", label: "Velo Club Rhein-Neckar e.V.", href: "/" },
              { id: "wo-1062", label: "WO-1062 Full service and wheel build", href: "/" },
            ]}
          />
        </Column>
      ),
    },
  ],
});
