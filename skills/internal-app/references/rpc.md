# Effect v4 RPC for a separate backend

## Selection

Prefer RPC when an independent process owns the data or workflow, or when multiple clients share a contract.
The contract survives frontend rebuilds without generated Start server-function identifiers.
Typed payloads, success values, and expected failures share one schema definition.

Keep Start server functions for local server concerns such as the theme cookie.
Do not migrate a single-process app only because RPC exists. No benchmark establishes universal runtime or bundle-size superiority.

## Verified versions

The public `effect/rpc` entrypoint exists in Effect 4.0.0 and 4.0.2.
The module remains marked `@stability unstable`. Pin matching client/server versions and rerun wire checks before upgrades.
Use one Effect module instance inside each process or bundle. Matching version numbers alone do not establish shared schema identity.
Effect 4 uses instance-local parser sentinels. A contract loaded through another dependency tree can fail decoding valid numbers.
Put contracts in a package with an Effect peer dependency. Use Bun's isolated linker so each app resolves its own matching peer instance.
Configure Vite `resolve.dedupe: ["effect"]`. Compile a local contract package through `ssr.noExternal` when required by the framework.
With an isolated dependency tree, declare packages imported by generated SSR code directly in the app. Nitro must not resolve them from a parent app.
The inspector verified `@tanstack/router-core`, `@tanstack/history`, `h3-v2`, and `seroval` at the versions selected by its Start lockfile.
Verify the built server and browser. A root-package Bun smoke alone does not exercise the frontend dependency graph.
A Bun HTTP smoke check on 4.0.2 verified success serialization and `catchTag` handling of a declared error.
The kit builds and typechecks with TypeScript 7.0.2 after removal of `baseUrl`.

## Ownership

- Shared contracts import only `Schema` and RPC definitions. Never import database, server configuration, or runtime modules from a contract.
- The backend owns handler layers and one HTTP handler lifetime. Dispose it during shutdown.
- The frontend owns one scoped client runtime per endpoint. Dispose browser runtimes on hot reload and server runtimes during shutdown.
- `features/<name>/api.ts` owns query keys, query options, and mutation helpers. Routes do not construct RPC clients.
- Both SSR and the browser call the remote backend over HTTP. `RpcTest.makeClient` is in-process and does not connect to another service.
- Use a same-origin gateway for browser calls. SSR uses the configured internal backend address. Never send a backend credential through serialized loader data.

## Contract and HTTP server

```ts
import { Effect, Layer, Schema } from "effect";
import { HttpRouter } from "effect/http";
import { Rpc, RpcGroup, RpcSerialization, RpcServer } from "effect/rpc";

class Missing extends Schema.TaggedError<Missing>()("Missing", {
  message: Schema.String,
}) {}

class Records extends RpcGroup.make(
  Rpc.make("Read", {
    payload: { id: Schema.String },
    success: Schema.Struct({ value: Schema.Number }),
    error: Missing,
  }),
) {}

const handlers = Records.toLayer({
  Read: ({ id }) => id === "known"
    ? Effect.succeed({ value: 42 })
    : Effect.fail(new Missing({ message: "No record" })),
});

const server = HttpRouter.toWebHandler(
  RpcServer.layerHttp({ group: Records, path: "/rpc", protocol: "http" }).pipe(
    Layer.provide(handlers),
    Layer.provide(RpcSerialization.layerNdjson),
  ),
);
// Mount server.handler at the process HTTP boundary. Dispose server.dispose at shutdown.
```

Select `protocol: "http"` explicitly. `RpcServer.layerHttp` otherwise defaults to WebSocket.
Use NDJSON for streamed responses. JSON transport buffers results.
Authenticate and authorize at the actual backend boundary. A frontend route guard is not authorization.

## Client

```ts
import { Layer, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/http";
import { RpcClient, RpcSerialization } from "effect/rpc";

const protocol = RpcClient.layerProtocolHttp({ url: endpoint }).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(RpcSerialization.layerNdjson),
);
const clients = Layer.effect(RecordsClient, RpcClient.make(Records)).pipe(
  Layer.provide(protocol),
);
const runtime = ManagedRuntime.make(clients);
```

`RecordsClient` is an app-owned `Context.Service` with the generated RPC client type.
Use `runtime.runPromise` at the query boundary and pass the TanStack Query abort signal.
Preserve tagged expected failures for UI mapping. `Effect.runPromise` without deliberate exit handling can wrap failures in a fiber error.
Transport failures, defects, and interruption must remain distinguishable from expected workflow errors.
Preserve the failure or `Cause.squash(exit.cause)` through the client adapter. Apply generic copy only at the final UI boundary.
Install backend error reporting for unexpected RPC failures. Encoded RPC errors do not reach an outer HTTP exception handler automatically.

Keep list responses as bounded metadata projections. Large captured payloads and attachments need a separate transfer endpoint because NDJSON frames have decoder limits.

HTTP cancellation aborts fetch and interrupts the server request scope. It does not roll back already committed side effects.
Mutation idempotency and transaction boundaries remain backend responsibilities.

## Validation

Run the real HTTP transport, not only `RpcTest.makeClient`.
Verify a successful read, a declared failure, cancellation of a pending read, an invalid payload, SSR hydration, and browser mutations.
Verify that frontend assets contain no backend credentials or server-only imports.
