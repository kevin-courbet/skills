import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, type BadgeIntent } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Identifier } from "@/components/ui/identifier";
import { DescriptionList, Page, PageHeader, Section } from "@/components/ui/layout";
import { deleteItemFn, itemKeys, itemQueryOptions } from "@/features/items/api";
import type { ItemStatus } from "@/features/items/schemas";
import { formatCurrency, formatDateTime } from "@/lib/locale";
import { isServerFnError, unwrap } from "@/lib/server-result";
import type { WireErrorEncoded } from "@/lib/wire-errors";

export const Route = createFileRoute("/_app/items/$itemId")({
  loader: async ({ context, params }) => {
    try {
      const item = await context.queryClient.ensureQueryData(itemQueryOptions(params.itemId));
      return { crumb: item.name };
    } catch (error) {
      // A missing record is a 404 page, not a failed load.
      if (isServerFnError<WireErrorEncoded>(error) && error.error._tag === "NotFoundError")
        throw notFound();
      throw error;
    }
  },
  component: ItemPage,
});

const statusIntent: Record<ItemStatus, BadgeIntent> = {
  active: "success",
  paused: "warning",
  archived: "neutral",
};
const statusLabel: Record<ItemStatus, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

function ItemPage() {
  const { itemId } = Route.useParams();
  const { data: item } = useSuspenseQuery(itemQueryOptions(itemId));
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () => deleteItemFn({ data: { id: itemId } }).then(unwrap),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: itemKeys.detail(itemId) });
      await queryClient.invalidateQueries({ queryKey: itemKeys.all });
      await navigate({ to: "/items" });
    },
  });

  return (
    <Page width="reading">
      <PageHeader
        title={
          <>
            {item.name}{" "}
            <Badge intent={statusIntent[item.status]} size="lg">
              {statusLabel[item.status]}
            </Badge>
          </>
        }
        description={
          <>
            Owned by {item.owner} · <Identifier value={item.id} label="item ID" size="sm" muted />
          </>
        }
        actions={
          <Button onPress={() => setConfirmOpen(true)}>
            <Trash2 aria-hidden width={16} height={16} />
            Delete
          </Button>
        }
      />
      <Section title="Details">
        <DescriptionList
          items={[
            { term: "Owner", detail: item.owner },
            { term: "Amount", detail: formatCurrency(item.amount) },
            { term: "Last updated", detail: formatDateTime(item.updatedAt) },
          ]}
        />
      </Section>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${item.name}?`}
        description="The item is removed from every list. This cannot be undone."
        confirmLabel="Delete item"
        onConfirm={() => remove.mutateAsync()}
      />
    </Page>
  );
}
