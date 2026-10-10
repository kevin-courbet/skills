import { Data } from "effect";

/** Internal failure. Map it to a wire error before the server-function boundary. */
export class StoreError extends Data.TaggedError("StoreError")<{
  readonly operation: string;
  readonly cause: unknown;
}> {}
