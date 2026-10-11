import { Cause, type Effect, Exit, Schema } from "effect";
import type { ServerResult } from "@/lib/server-result";
import {
  type WireError,
  WireError as WireErrorSchema,
  type WireErrorEncoded,
  isWireError,
} from "@/lib/wire-errors";
import { type AppServices, runtime } from "./runtime.server";

const encodeWireError = Schema.encodeSync(WireErrorSchema);

/**
 * Runs an Effect inside a server-function handler.
 * The effect may only fail with WireError. Map internal errors before calling
 * this, so every expected failure reaches the client with its tag and fields.
 * Defects, interruptions, and layer failures throw, which surfaces them as a
 * rejected server function. The application's function middleware records the
 * failure before Start serializes its response.
 */
export async function runServerFn<A, E extends WireError>(
  effect: Effect.Effect<A, E, AppServices>,
): Promise<ServerResult<A, WireErrorEncoded>> {
  const exit = await runtime.runPromiseExit(effect);
  if (Exit.isSuccess(exit)) return { ok: true, value: exit.value };
  const failure = exit.cause.reasons.find(Cause.isFailReason);
  if (
    failure !== undefined &&
    isWireError(failure.error) &&
    !exit.cause.reasons.some(Cause.isDieReason)
  ) {
    return { ok: false, error: encodeWireError(failure.error) };
  }
  throw Cause.squash(exit.cause);
}
