/**
 * First message from a TanStack Form field's errors. Standard Schema
 * validators report issue objects; custom validators report strings.
 */
export function fieldError(errors: ReadonlyArray<unknown>): string | undefined {
  for (const error of errors) {
    if (typeof error === "string") return error;
    if (typeof error === "object" && error !== null) {
      const message: unknown = Reflect.get(error, "message");
      if (typeof message === "string") return message;
    }
  }
  return undefined;
}
