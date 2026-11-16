import {
  CircleCheck,
  CreditCard,
  FilePlus2,
  MessageSquare,
  PackageX,
  Receipt,
  UserRoundCog,
  Wrench,
} from "lucide-react";
import { Code } from "@/components/primitives/layout";
import { TextLink } from "@/components/primitives/text-link";
import { Timeline, type TimelineTime } from "@/components/primitives/timeline";
import { formatCurrency, formatDateTime, formatRelative } from "@/lib/locale";
import { Column, defineSection } from "../../specimen";

// A fixed reference time, as a loader returns it, keeps the relative labels the same in each theme column.
const referenceTime = Date.parse("2026-11-16T10:00:00Z");

function at(iso: string): TimelineTime {
  return { label: formatRelative(iso, referenceTime), dateTime: iso, title: formatDateTime(iso) };
}

export default defineSection({
  component: "Timeline",
  specimens: [
    {
      title: "Work order history",
      note: "Sort the events newest first. Write each title as one sentence that names the action and the object.",
      render: () => (
        <Column width="36rem">
          <Timeline
            label="Activity"
            events={[
              {
                id: "wo-2041-ready",
                kind: "Status change",
                icon: CircleCheck,
                title: "Marked the work order ready for pick-up",
                actor: { name: "Lena Okafor" },
                time: at("2026-11-16T09:42:00Z"),
              },
              {
                id: "wo-2041-invoice",
                kind: "Invoice",
                icon: Receipt,
                title: (
                  <>
                    Issued invoice <Code>INV-2042</Code> for {formatCurrency(184.5)}
                  </>
                ),
                actor: { name: "Lena Okafor" },
                time: at("2026-11-16T09:40:00Z"),
                meta: <TextLink to="/">View invoice</TextLink>,
              },
              {
                id: "wo-2041-repair",
                kind: "Repair",
                icon: Wrench,
                title: "Replaced the chain and the rear cassette",
                description: "The old chain measured 0.75% stretch and had worn the cassette.",
                actor: { name: "Marco Ruiz" },
                time: at("2026-11-15T16:05:00Z"),
              },
              {
                id: "wo-2041-assign",
                kind: "Assignment",
                icon: UserRoundCog,
                title: "Assigned the work order to Marco Ruiz",
                actor: { name: "Lena Okafor" },
                time: at("2026-11-15T08:30:00Z"),
              },
              {
                id: "wo-2041-created",
                kind: "Created",
                icon: FilePlus2,
                title: "Created the work order for a Trek Domane AL 2",
                actor: { name: "Priya Shah" },
                time: at("2026-11-14T17:12:00Z"),
              },
            ]}
          />
        </Column>
      ),
    },
    {
      title: "Events that need attention",
      note: "Give tone only to an event that needs attention. A feed is a record, not a progress bar.",
      render: () => (
        <Column width="36rem">
          <Timeline
            label="Payment history"
            events={[
              {
                id: "pay-retry",
                kind: "Payment",
                icon: CreditCard,
                tone: "danger",
                title: "Card payment for invoice INV-2038 failed",
                description: "The bank declined the card. The customer must pay at the counter.",
                actor: { name: "Payments", isSystem: true },
                time: at("2026-11-16T08:15:00Z"),
              },
              {
                id: "part-backorder",
                kind: "Parts",
                icon: PackageX,
                tone: "warning",
                title: "Put the Shimano BR-R7170 brake caliper on backorder",
                description: "The supplier expects new stock on 21 November.",
                actor: { name: "Inventory sync", isSystem: true },
                time: at("2026-11-15T13:00:00Z"),
              },
              {
                id: "repair-done",
                kind: "Repair",
                icon: Wrench,
                title: "Bled the front hydraulic brake",
                actor: { name: "Marco Ruiz" },
                time: at("2026-11-15T11:20:00Z"),
              },
            ]}
          />
        </Column>
      ),
    },
    {
      title: "System actor and no actor",
      note: "A system actor shows the name without an avatar. An event without an actor shows only the time.",
      render: () => (
        <Column width="36rem">
          <Timeline
            label="Customer history"
            events={[
              {
                id: "reminder",
                kind: "Reminder",
                icon: MessageSquare,
                title: "Sent a pick-up reminder to Jonas Weber by text message",
                actor: { name: "Notifications", isSystem: true },
                time: at("2026-11-16T07:00:00Z"),
              },
              {
                id: "merged",
                kind: "Merge",
                title: "Merged two customer records with the same phone number",
                time: at("2026-11-12T22:00:00Z"),
              },
              {
                id: "created",
                kind: "Created",
                icon: FilePlus2,
                title: "Created the customer record",
                actor: { name: "Priya Shah" },
                time: at("2026-09-03T10:24:00Z"),
              },
            ]}
          />
        </Column>
      ),
    },
    {
      title: "Long text that wraps",
      render: () => (
        <Column width="24rem">
          <Timeline
            label="Activity"
            events={[
              {
                id: "note",
                kind: "Note",
                icon: MessageSquare,
                title:
                  "Added a note to work order WO-2041-CANAL-STREET-WARRANTY-REPLACEMENT about the frame inspection",
                description:
                  "The customer reports a creak from the bottom bracket under load on climbs. Check the press-fit cups, the crank preload, and the chainring bolts before you replace the bottom bracket, because the customer paid for a full service in October.",
                actor: { name: "Alexandrina Montgomery-Vasquez" },
                time: at("2026-11-16T09:55:00Z"),
                meta: <TextLink to="/">Open work order</TextLink>,
              },
            ]}
          />
        </Column>
      ),
    },
  ],
});
