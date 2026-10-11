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

/**
 * Default error boundary for routes. Loader and render failures land here.
 * Invalid search params get a reset link instead of a generic failure.
 */
export function RouteError({ error, reset }: ErrorComponentProps) {
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
        message={describeError(retry.isError ? retry.error : error)}
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
