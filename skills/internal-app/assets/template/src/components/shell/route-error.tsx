import * as stylex from "@stylexjs/stylex";
import {
  type ErrorComponentProps,
  Link,
  SearchParamError,
  useRouter,
} from "@tanstack/react-router";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback";
import { space } from "@/styles/tokens.stylex";
import { failureMessage, isServerFnError } from "@/lib/server-result";

/**
 * Default error boundary for routes. Loader and render failures land here.
 * Invalid search params get a reset link instead of a generic failure.
 */
export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
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
        message={describeError(error)}
        action={
          <Button
            onPress={() => {
              reset();
              void router.invalidate();
            }}
          >
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
