import { Cause, Layer, ManagedRuntime } from "effect";
import { AppConfig } from "./config";
import { ItemsService } from "./items.service";

const AppLayer = Layer.mergeAll(ItemsService.layer).pipe(Layer.provideMerge(AppConfig.layer));

export const runtime = ManagedRuntime.make(AppLayer);

export type AppServices = ManagedRuntime.ManagedRuntime.Services<typeof runtime>;

export function recordEffectCause(cause: Cause.Cause<unknown>): void {
  const defects = cause.reasons.filter(Cause.isDieReason).length;
  const failures = cause.reasons.filter(Cause.isFailReason).length;
  process.stderr.write(`${JSON.stringify({ event: "server_effect.failed", defects, failures })}\n`);
}

let disposing = false;
function shutdown() {
  if (disposing) return;
  disposing = true;
  void runtime.dispose().then(() => process.exit(0));
}
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
