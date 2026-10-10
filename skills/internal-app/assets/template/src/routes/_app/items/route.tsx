import { createFileRoute } from "@tanstack/react-router";

/** Layout for /items and its children. It exists to give them a shared breadcrumb. */
export const Route = createFileRoute("/_app/items")({
  staticData: { crumb: "Items" },
});
