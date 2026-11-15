import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Identifier } from "@/components/ui/identifier";
import { Page, PageHeader, SettingRow, SettingsCard } from "@/components/ui/layout";
import { appLocale, appTimeZone } from "@/lib/locale";

export const Route = createFileRoute("/_app/settings")({
  staticData: { crumb: "Settings" },
  component: SettingsPage,
});

const workspaceId = "ws_internal_app";

function SettingsPage() {
  return (
    <Page width="reading">
      <PageHeader title="Settings" description="Workspace configuration." />
      <SettingsCard title="Workspace">
        <SettingRow label="Workspace ID" description="Use this ID in support requests.">
          <Identifier value={workspaceId} label="workspace ID" />
        </SettingRow>
        <SettingRow label="Mode">
          <Badge>Managed</Badge>
        </SettingRow>
      </SettingsCard>
      <SettingsCard title="Presentation">
        <SettingRow label="Locale" description="Formats dates, numbers, and currency.">
          {appLocale}
        </SettingRow>
        <SettingRow label="Time zone">{appTimeZone}</SettingRow>
      </SettingsCard>
    </Page>
  );
}
