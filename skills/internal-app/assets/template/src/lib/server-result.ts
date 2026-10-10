/**
 * Serializable result of a server function. Expected failures travel as data so
 * the client keeps their tag and fields. Defects still throw on the server.
 */
export type ServerResult<A, E extends { readonly _tag: string }> =
  | { readonly ok: true; readonly value: A }
  | { readonly ok: false; readonly error: E };

export class ServerFnError<E extends { readonly _tag: string }> extends Error {
  override readonly name = "ServerFnError";

  constructor(readonly error: E) {
    super(error._tag);
  }
}

export function isServerFnError<E extends { readonly _tag: string }>(
  value: unknown,
): value is ServerFnError<E> {
  return value instanceof ServerFnError;
}

/** Use in queryFn and mutationFn so TanStack Query sees a thrown, typed error. */
export function unwrap<A, E extends { readonly _tag: string }>(result: ServerResult<A, E>): A {
  if (result.ok) return result.value;
  throw new ServerFnError(result.error);
}

function stringField(value: object, key: string): string | undefined {
  const field: unknown = Reflect.get(value, key);
  return typeof field === "string" ? field : undefined;
}

/**
 * User-facing text for a failed action. Wire errors carry their own message;
 * anything else is unexpected and its details stay in the server log.
 */
export function failureMessage(error: unknown): string {
  if (isServerFnError(error)) {
    const message = stringField(error.error, "message");
    if (message !== undefined) return message;
    if (error.error._tag === "NotFoundError") {
      return `This ${stringField(error.error, "entity") ?? "record"} no longer exists.`;
    }
  }
  return "The action failed. Try again.";
}
