/**
 * The default error and not-found pages of the router, with a retry that reloads only the failed data.
 *
 * @layer shell
 * @keywords route error, error page, error boundary, not found page, 404 page, retry failed load, invalid search params
 * @related AppShell, Feedback, AppDocument
 * @notes internal-app-states, ux-writing
 *
 * `src/lib/router-defaults.tsx` sets `RouteError` as `defaultErrorComponent`
 * and `RouteNotFound` as `defaultNotFoundComponent`. Do not catch a loader
 * error in a page to show it again. For a failure inside a loaded page, such
 * as one card that cannot load, use `ErrorState`.
 *
 * ## Behavior
 * - "Try again" refetches the queries that hold the failed error. When the
 *   loader of the failed route match keeps the error, it then invalidates only
 *   that match. Other data and the theme do not reload.
 * - An invalid search param shows "This link has invalid filters" with a
 *   reset action, not a general failure.
 * - A server error shows its classified message. Any other error shows a
 *   message that points to the server log.
 * - `RouteNotFound` shows "Page not found" with a link to the overview.
 *
 * ## Rules
 * - A loader throws `notFound()` for a missing record, so that people see the
 *   not-found page and not a failed load.
 *
 * ## Example
 * ```tsx
 * export const routerDefaults = {
 *   defaultErrorComponent: RouteError,
 *   defaultNotFoundComponent: RouteNotFound,
 * } as const;
 * ```
 */
import * as stylex from "@stylexjs/stylex";
import {
  type ErrorComponentProps,
  Link,
  SearchParamError,
  useRouter,
  useMatch,
} from "@tanstack/react-router";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { space } from "@/styles/tokens.stylex";
import { failureMessage, isServerFnError } from "@/lib/server-result";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Default error boundary for routes. Loader and render failures land here.
 * Invalid search params get a reset link instead of a generic failure.
 */
export function RouteError({
  error,
  reset,
  onError,
  describeError: describe = describeError,
}: ErrorComponentProps & {
  /** Runs for each new error, such as to report it to an error tracker. */
  readonly onError?: (error: unknown) => void;
  /** Writes the message for an error. The default reads the classified message of a server error. */
  readonly describeError?: (error: unknown) => string;
}) {
  useEffect(() => {
    onError?.(error);
  }, [error, onError]);
  const router = useRouter();
  const client = useQueryClient();
  const matchId = useMatch({ strict: false, select: (match) => match.id });
  const retry = useMutation({
    mutationFn: async () => {
      // Hydrated errors have no query function. Their failed loader rebuilds the query options.
      await client.refetchQueries(
        {
          predicate: (query) =>
            query.state.error === error && typeof query.options.queryFn === "function",
          type: "all",
        },
        { throwOnError: true },
      );
      if (router.state.matches.some((match) => match.id === matchId && match.status === "error"))
        await router.invalidate({ filter: (match) => match.id === matchId });
      reset();
    },
  });
  if (error instanceof SearchParamError) {
    return (
      <div {...stylex.props(styles.wrap)}>
        <ErrorState
          title="This link has invalid filters"
          message="Reset the filters and try again."
          action={
            <LinkButton to="." search={{}} replace>
              Reset filters
            </LinkButton>
          }
        />
      </div>
    );
  }
  return (
    <div {...stylex.props(styles.wrap)}>
      <ErrorState
        message={describe(retry.isError ? retry.error : error)}
        action={
          <Button isDisabled={retry.isPending} onPress={() => retry.mutate()}>
            Try again
          </Button>
        }
      />
    </div>
  );
}

function describeError(error: unknown): string {
  if (isServerFnError(error)) return failureMessage(error);
  return "The page could not load. The details are in the server log.";
}

export function RouteNotFound() {
  return (
    <div {...stylex.props(styles.wrap)}>
      <EmptyState
        title="Page not found"
        description="The address does not match a page in this app."
        action={<Link to="/">Go to overview</Link>}
      />
    </div>
  );
}

const styles = stylex.create({
  wrap: { padding: space.xxl, maxWidth: "48rem" },
});
