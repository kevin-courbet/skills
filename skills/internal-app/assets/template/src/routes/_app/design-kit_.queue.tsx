import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import {
  QueueShowcase,
  technicianIds,
  workOrdersQueryOptions,
} from "@/components/showcase/showcase-queue";
import { Page } from "@/components/primitives/layout";

const QueueShowcaseSearch = Schema.Struct({
  person: Schema.optionalKey(Schema.Literals(technicianIds)),
  order: Schema.optionalKey(Schema.String),
});

export const Route = createFileRoute("/_app/design-kit_/queue")({
  staticData: { crumb: "Touch queue" },
  validateSearch: Schema.toStandardSchemaV1(QueueShowcaseSearch),
  // The due dates need one today that is stable across SSR and hydration.
  loader: async ({ context }) => {
    const today = new Date().toISOString().slice(0, 10);
    await context.queryClient.ensureQueryData(workOrdersQueryOptions(today));
    return { today };
  },
  component: QueueShowcasePage,
});

function QueueShowcasePage() {
  const search = Route.useSearch();
  const { today } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  return (
    <Page density="touch">
      <QueueShowcase
        today={today}
        person={search.person ?? null}
        onPersonChange={(person) => void navigate({ search: { person } })}
        openOrderId={search.order ?? null}
        orderLink={(order) => ({
          to: "/design-kit/queue",
          search: (previous) => ({ ...previous, order }),
        })}
        onCloseOrder={() =>
          void navigate({ search: ({ order: _closed, ...previous }) => previous })
        }
      />
    </Page>
  );
}
