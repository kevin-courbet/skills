import { SearchParamError } from "@tanstack/react-router";
import { RouteError, RouteNotFound } from "@/components/shell/route-error";
import { ServerFnError } from "@/lib/server-result";
import { ForbiddenError } from "@/lib/wire-errors";
import { defineSection } from "../../specimen";

const loaderFailure = new Error("Failed to fetch the work orders of the Canal Street shop.");
const forbidden = new ServerFnError(
  new ForbiddenError({ message: "Only the shop manager can open the invoices of this month." }),
);
const invalidFilters = new SearchParamError('The status filter "parked" is not a work order status.');

// The catalog route has no error boundary to reset, so a press of "Try again" only refetches.
const reset = () => {};

const describeWithReference = () =>
  "The work orders did not load. Give support the reference ERR-7F3A-2041.";

export default defineSection({
  component: "RouteError",
  specimens: [
    {
      title: "Load failure",
      note: "An error that is not a server error points to the server log. \"Try again\" reloads only the failed data.",
      render: () => <RouteError error={loaderFailure} reset={reset} />,
    },
    {
      title: "Server error with a classified message",
      render: () => <RouteError error={forbidden} reset={reset} />,
    },
    {
      title: "Invalid filters",
      note: "An invalid search param shows a reset action, not a general failure.",
      render: () => <RouteError error={invalidFilters} reset={reset} />,
    },
    {
      title: "Message from the app",
      note: "An app error component gives describeError to add a reference for diagnostic correlation.",
      render: () => (
        <RouteError error={loaderFailure} reset={reset} describeError={describeWithReference} />
      ),
    },
    {
      title: "RouteNotFound",
      note: "A loader throws notFound() for a missing record, so that people see this page.",
      render: () => <RouteNotFound />,
    },
  ],
});
