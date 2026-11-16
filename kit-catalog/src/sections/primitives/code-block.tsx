import { Badge } from "@/components/primitives/badge";
import { CodeBlock } from "@/components/primitives/code-block";
import { Card, CardSection, DescriptionList } from "@/components/primitives/layout";
import { Column, defineSection } from "../../specimen";

const shopHours = `# Opening hours of the workshop and the front desk.
shop: Spoke & Chain
timezone: Europe/Paris
workshop:
  weekdays: "08:30-18:30"
  saturday: "09:00-17:00"
  sunday: closed
booking:
  slotMinutes: 30
  maxJobsPerMechanic: 6`;

const pricingConfig = `labor:
  hourlyRate: 60
  minimumMinutes: 15
discounts:
  clubMembers: 0.1
  fleetAccounts: 1.4
tax:
  rate: 0.2
  includedInPrices: yes`;

const pricingDiff = `@@ -1,5 +1,5 @@
 labor:
-  hourlyRate: 55
+  hourlyRate: 60
   minimumMinutes: 15
 discounts:
-  clubMembers: 0.05
+  clubMembers: 0.1`;

const estimateSource = `export function estimateTotal(order: WorkOrder, rates: LaborRates): number {
  const parts = order.parts.reduce((sum, part) => sum + part.unitPrice * part.quantity, 0);
  const minutes = Math.max(order.laborMinutes, rates.minimumMinutes);
  const labor = (minutes / 60) * rates.hourlyRate;
  const discount = order.customer.isClubMember ? labor * rates.clubDiscount : 0;
  return roundToCents(parts + labor - discount);
}`;

const webhookPayload = `{
  "event": "work_order.completed",
  "sentAt": "2026-11-16T15:42:08Z",
  "workOrder": {
    "id": "WO-1042",
    "customer": { "id": "CUS-318", "name": "Amélie Durand", "phone": "+33 6 12 34 56 78" },
    "bike": { "make": "Trek", "model": "Domane SL 5", "serial": "WTU284C0912J" },
    "mechanic": "Karim Haddad",
    "notes": "Bled both brakes, replaced the front rotor, and adjusted the rear derailleur limit screws after the test ride.",
    "parts": [
      { "sku": "SH-B05S", "quantity": 2, "unitPrice": 14.95 },
      { "sku": "SH-OIL-100", "quantity": 1, "unitPrice": 12.5 },
      { "sku": "SH-RT-MT800-160", "quantity": 1, "unitPrice": 54 }
    ],
    "laborMinutes": 60,
    "total": 156.4
  }
}`;

const dailyReport = `$ bun run report:daily --date 2026-11-16
Work orders closed: 14
Revenue: €2,184.60
Parts below reorder level: 3`;

const lookupQuery = `select id, customer_name, due_at
from work_orders
where status = 'waiting_for_parts'
order by due_at;`;

export default defineSection({
  component: "CodeBlock",
  specimens: [
    {
      title: "Config file",
      note: "Give a title when the code is a file or a command that people run.",
      render: () => <CodeBlock title="shop-hours.yaml" language="yaml" code={shopHours} />,
    },
    {
      title: "Diagnostics",
      note: "An error or a warning tints its line and shows its message under the line.",
      render: () => (
        <CodeBlock
          title="pricing.yaml"
          language="yaml"
          code={pricingConfig}
          diagnostics={[
            { line: 6, level: "error", message: "fleetAccounts must be between 0 and 1." },
            { line: 9, level: "warning", message: "Write includedInPrices as true or false." },
          ]}
          headerActions={
            <>
              <Badge intent="danger">1 error</Badge>
              <Badge intent="warning">1 warning</Badge>
            </>
          }
        />
      ),
    },
    {
      title: "Diff",
      note: "With language diff, the + and - prefixes mark the added and removed lines.",
      render: () => <CodeBlock title="pricing.yaml" language="diff" code={pricingDiff} />,
    },
    {
      title: "Excerpt with highlighted lines",
      note: "highlightedLines and diff use the line numbers that show, so they include startLine.",
      render: () => (
        <CodeBlock
          title="src/lib/estimate.ts"
          language="ts"
          code={estimateSource}
          startLine={41}
          highlightedLines={[[43, 44]]}
          diff={{ added: [45] }}
        />
      ),
    },
    {
      title: "Without a header",
      note: "Without a title or headerActions, the wrap and copy buttons pin to the top corner. Use language text for terminal output.",
      render: () => (
        <Column>
          <CodeBlock language="sql" code={lookupQuery} label="Work orders waiting for parts" />
          <CodeBlock language="text" code={dailyReport} label="Daily report output" />
          <CodeBlock
            language="sh"
            code="bun run invoices:send --work-order WO-1042"
            label="Send invoice command"
          />
        </Column>
      ),
    },
    {
      title: "Collapsed and wrapped",
      note: "maxLines collapses long code behind a Show all button. defaultWrap wraps long lines; the copy button copies all of the code.",
      render: () => (
        <CodeBlock
          title="work-order-completed.json"
          language="json"
          code={webhookPayload}
          maxLines={8}
          defaultWrap
        />
      ),
    },
    {
      title: "Embedded in a card",
      note: "variant embedded drops the border for a CardSection with padding flush.",
      render: () => (
        <Card title="Webhook delivery" description="To the accounting service" layout="sections">
          <CardSection>
            <DescriptionList
              items={[
                { term: "Event", detail: "work_order.completed" },
                { term: "Response", detail: "200 OK in 182 ms" },
              ]}
            />
          </CardSection>
          <CardSection padding="flush">
            <CodeBlock
              variant="embedded"
              language="json"
              code={webhookPayload}
              label="Request payload"
              maxLines={6}
            />
          </CardSection>
        </Card>
      ),
    },
  ],
});
