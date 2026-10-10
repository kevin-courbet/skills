import { createFileRoute } from "@tanstack/react-router";
import { DescriptionList, Page, PageHeader, Section } from "@/components/ui/layout";

export const Route = createFileRoute("/_app/settings")({
  staticData: { crumb: "Settings" },
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Page width="reading">
      <PageHeader title="Settings" description="Workspace configuration." />
      <Section title="Environment">
        <DescriptionList
          items={[
            { term: "Locale", detail: "en-GB" },
            { term: "Time zone", detail: "UTC" },
          ]}
        />
      </Section>
    </Page>
  );
}
