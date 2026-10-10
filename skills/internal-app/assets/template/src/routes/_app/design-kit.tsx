import { createFileRoute } from "@tanstack/react-router";
import { KitShowcase } from "@/components/kit/showcase";
import { Page } from "@/components/ui/layout";

export const Route = createFileRoute("/_app/design-kit")({
  staticData: { crumb: "Design kit" },
  component: DesignKitPage,
});

function DesignKitPage() {
  return (
    <Page>
      <KitShowcase />
    </Page>
  );
}
