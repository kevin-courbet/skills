import { queryOptions } from "@tanstack/react-query";
import type { SelectOption } from "@/components/primitives/select";

/**
 * The example data of the SettingsPage recipe. It stands in for the api
 * module of a feature, which reads and saves the settings through server
 * functions.
 */

export type ReplyLanguage = "en" | "fr" | "de";

export interface DeskSettings {
  readonly deskId: string;
  readonly emailOnNewTicket: boolean;
  readonly dailySummary: boolean;
  readonly replyLanguage: ReplyLanguage;
  readonly firstReplyHours: number;
  readonly autoCloseDays: number;
}

export const replyLanguageOptions: ReadonlyArray<SelectOption<ReplyLanguage>> = [
  { id: "en", label: "English" },
  { id: "fr", label: "French" },
  { id: "de", label: "German" },
];

const store: { settings: DeskSettings } = {
  settings: {
    deskId: "desk_7f3a91",
    emailOnNewTicket: true,
    dailySummary: false,
    replyLanguage: "en",
    firstReplyHours: 4,
    autoCloseDays: 14,
  },
};

export const deskSettingsKeys = { all: ["lab", "desk-settings"] as const };

export const deskSettingsQueryOptions = () =>
  queryOptions({ queryKey: deskSettingsKeys.all, queryFn: async () => store.settings });

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type DeskSettingsChange = Partial<Omit<DeskSettings, "deskId">>;

/** Saves one change. The daily summary always fails, so that the recipe shows the rollback. */
export async function saveDeskSettings(change: DeskSettingsChange): Promise<void> {
  await pause(400);
  if (change.dailySummary !== undefined) {
    throw new Error("The mail service did not accept the daily summary.");
  }
  store.settings = { ...store.settings, ...change };
}
