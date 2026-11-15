/**
 * A settings page: groups of settings that apply at once, each change saved on its own.
 *
 * @keywords settings page, preferences, configuration page, account settings, toggles, switches, setting rows, save on change
 * @components Page, PageHeader, SettingsCard, SettingRow, Switch, Select, NumberField, Identifier, toast
 * @notes internal-app-page-patterns, internal-app-mutations, internal-app-forms, internal-app-writing
 * @files src/features/lab/desk-settings.ts
 *
 * Use it for settings that people change one at a time and that take effect
 * at once, such as notifications or defaults. Do not use it for a change that
 * people review before they commit it, such as a contract or a large import:
 * use a form with a submit button, as the PreviewForm recipe does.
 *
 * Each row names the setting on the left and holds its control on the right,
 * so the control hides its own label. A change shows at once and saves in the
 * background. A failed save puts the old value back and says which setting did
 * not change. A successful save shows no toast, because the control already
 * shows the result.
 *
 * ## Adapt it
 * - Replace `src/features/lab/desk-settings.ts` with the api module of the
 *   feature. Save one change at a time, so that a failure names one setting.
 * - Group the settings by what they change, one `SettingsCard` per group, and
 *   give each card one sentence that says what the group changes.
 * - Choose the control for each answer: `Switch` for on and off, `Select` for
 *   a closed list, and `NumberField` with a `unit` for a number.
 * - Show the facts that people cannot change as text or an `Identifier` in a
 *   row, without a disabled control.
 * - Move a setting that is destructive, such as a delete of the desk, to its
 *   own card with a `ConfirmDialog`. The daily summary always fails, so that
 *   you can see the rollback.
 */
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Identifier } from "@/components/primitives/identifier";
import { Page, PageHeader, SettingRow, SettingsCard } from "@/components/primitives/layout";
import { NumberField } from "@/components/primitives/number-field";
import { Select } from "@/components/primitives/select";
import { Switch } from "@/components/primitives/switch";
import { toast } from "@/components/primitives/toaster";
import {
  type DeskSettings,
  type DeskSettingsChange,
  deskSettingsKeys,
  deskSettingsQueryOptions,
  replyLanguageOptions,
  saveDeskSettings,
} from "@/features/lab/desk-settings";

export const Route = createFileRoute("/_app/lab/settings-page")({
  staticData: { crumb: "Desk settings" },
  loader: ({ context }) => context.queryClient.ensureQueryData(deskSettingsQueryOptions()),
  component: DeskSettingsPage,
});

/** The name of each setting in a failure message. */
const settingName: Record<keyof DeskSettingsChange, string> = {
  emailOnNewTicket: "Email on a new ticket",
  dailySummary: "Daily summary",
  replyLanguage: "Reply language",
  firstReplyHours: "First reply target",
  autoCloseDays: "Close solved tickets after",
};

function useDeskSettings() {
  const queryClient = useQueryClient();
  const { queryKey } = deskSettingsQueryOptions();
  const { data: settings } = useSuspenseQuery(deskSettingsQueryOptions());
  const save = useMutation({
    mutationFn: saveDeskSettings,
    onSettled: () => queryClient.invalidateQueries({ queryKey: deskSettingsKeys.all }),
  });

  // The control shows the new value at once. A failure restores the value
  // that the server still has and names the setting.
  const change = (next: DeskSettingsChange) => {
    const previous = queryClient.getQueryData<DeskSettings>(queryKey);
    if (previous === undefined) throw new Error("The desk settings are not loaded.");
    void queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData(queryKey, { ...previous, ...next });
    save.mutate(next, {
      onError: (error) => {
        queryClient.setQueryData(queryKey, previous);
        const names = Object.keys(next).map((key) => settingName[key as keyof DeskSettingsChange]);
        toast.error(`${names.join(", ")} did not change. ${error.message}`);
      },
    });
  };
  return { settings, change };
}

function DeskSettingsPage() {
  const { settings, change } = useDeskSettings();
  return (
    <Page width="reading">
      <PageHeader title="Desk settings" description="Each change applies to the whole help desk." />
      <SettingsCard title="Desk">
        <SettingRow label="Desk ID" description="Use this ID in support requests.">
          <Identifier value={settings.deskId} label="desk ID" />
        </SettingRow>
      </SettingsCard>
      <SettingsCard title="Notifications" description="Controls the emails that agents get.">
        <SettingRow
          label={settingName.emailOnNewTicket}
          description="Sends an email to the team of the ticket."
        >
          <Switch
            aria-label={settingName.emailOnNewTicket}
            isSelected={settings.emailOnNewTicket}
            onChange={(emailOnNewTicket) => change({ emailOnNewTicket })}
          />
        </SettingRow>
        <SettingRow
          label={settingName.dailySummary}
          description="Sends the open tickets of each team at 08:00."
        >
          <Switch
            aria-label={settingName.dailySummary}
            isSelected={settings.dailySummary}
            onChange={(dailySummary) => change({ dailySummary })}
          />
        </SettingRow>
      </SettingsCard>
      <SettingsCard
        title="Replies"
        description="Sets the defaults of every reply and the service targets."
      >
        <SettingRow
          label={settingName.replyLanguage}
          description="The language of the reply templates."
        >
          <Select
            label={settingName.replyLanguage}
            hideLabel
            width="sm"
            options={replyLanguageOptions}
            value={settings.replyLanguage}
            onChange={(replyLanguage) => change({ replyLanguage })}
          />
        </SettingRow>
        <SettingRow
          label={settingName.firstReplyHours}
          description="A ticket without a reply after this time shows as late."
        >
          <NumberField
            label={settingName.firstReplyHours}
            hideLabel
            width="xs"
            unit="hours"
            minValue={1}
            maxValue={72}
            value={settings.firstReplyHours}
            // An empty number field gives NaN. The field then shows the saved value again.
            onChange={(firstReplyHours) =>
              Number.isNaN(firstReplyHours) || change({ firstReplyHours })
            }
          />
        </SettingRow>
        <SettingRow
          label={settingName.autoCloseDays}
          description="A solved ticket without a new reply closes after this time."
        >
          <NumberField
            label={settingName.autoCloseDays}
            hideLabel
            width="xs"
            unit="days"
            minValue={1}
            maxValue={90}
            value={settings.autoCloseDays}
            onChange={(autoCloseDays) => Number.isNaN(autoCloseDays) || change({ autoCloseDays })}
          />
        </SettingRow>
      </SettingsCard>
    </Page>
  );
}
