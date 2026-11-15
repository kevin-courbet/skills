---
id: internal-app-rpc
topic: internal-app
summary: Connect an internal app to a separate backend with Effect 4 RPC, with shared schema contracts, HTTP for SSR and the browser, typed failures, cancellation, and checks of the real transport.
keywords: [rpc, effect rpc, separate backend, remote backend, RpcGroup, RpcClient, RpcServer, contract package, rpc error handling, typed errors, ndjson, cancellation, abort signal, backend gateway, microservice]
related: [internal-app-server-functions, internal-app-effect-services, internal-app-error-reporting]
---

# Internal App RPC

Use Effect RPC for a backend that runs as a separate process. [[internal-app-server-functions#choose-the-boundary]] tells when.

## When To Use RPC

- Use RPC when an independent process owns the data or the workflow, or when more than one client shares a contract.
- The contract stays valid after a rebuild of the frontend, because it does not use the generated identifiers of Start server functions.
- The payloads, the success values, and the expected failures share one schema definition.
- Keep Start server functions for the local concerns of the server, such as the theme cookie.
- Do not move a single-process app to RPC only because RPC exists. No benchmark shows that RPC is always faster or smaller.

## Versions And Packages

- The public `effect/rpc` entry point exists in Effect 4.0.0 and 4.0.2. The module is still marked `@stability unstable`.
- Pin the same version on the client and the server. Run the wire checks again before each upgrade.
- Use one Effect module instance in each process or bundle. The same version number does not make the schema identity the same.
- Effect 4 uses parser sentinels that are local to an instance. A contract that loads through another dependency tree can fail to decode valid numbers.
- Put the contracts in a package with an Effect peer dependency. Use the isolated linker of Bun, so that each app resolves its own matching peer instance.
- Set `resolve.dedupe: ["effect"]` in Vite. When the framework requires it, compile a local contract package through `ssr.noExternal`.
- Exclude an editable local contract from `optimizeDeps`. Otherwise development keeps an old prebundled schema after a contract change.
- With an isolated dependency tree, declare in the app each package that the generated SSR code imports. Nitro must not resolve them from a parent app.
- The inspector verified `@tanstack/router-core`, `@tanstack/history`, `h3-v2`, and `seroval` at the versions of its Start lockfile.
- A Bun HTTP smoke check on 4.0.2 verified the success serialization and the `catchTag` handling of a declared error. A Bun smoke check in the root package does not exercise the frontend dependency graph, so also verify the built server and the browser.

## Ownership

- A shared contract imports only `Schema` and the RPC definitions. Never import a database, server config, or runtime module into a contract.
- The backend owns the handler layers and one HTTP handler lifetime. Dispose the handler at shutdown.
- The frontend owns one scoped client runtime for each endpoint. Dispose a browser runtime on hot reload, and a server runtime at shutdown.
- `features/<name>/api.ts` owns the query keys, the query options, and the mutation helpers. Routes do not make RPC clients.
- SSR and the browser both call the remote backend over HTTP. `RpcTest.makeClient` runs in the process and does not connect to another service.
- Send the browser calls through a gateway on the same origin. SSR uses the configured internal address of the backend. Never send a backend credential in serialized loader data.

## Contract And HTTP Server

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

- Set `protocol: "http"`. Without it, `RpcServer.layerHttp` uses WebSocket.
- Use NDJSON for streamed responses. The JSON transport buffers the results.
- Authenticate and authorize at the backend boundary. A route guard in the frontend is not authorization.

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

- `RecordsClient` is a `Context.Service` of the app with the type of the generated RPC client.
- Call `runtime.runPromise` at the query boundary, and give it the abort signal of TanStack Query.
- Keep list responses as bounded projections of metadata. Large captured payloads and attachments need a separate transfer endpoint, because NDJSON frames have decoder limits.

## Errors And Cancellation

- Keep the tagged expected failures, so that the UI can map them. `Effect.runPromise` without deliberate exit handling can wrap a failure in a fiber error.
- Keep transport failures, defects, and interruptions separate from the expected workflow errors.
- Keep the failure, or `Cause.squash(exit.cause)`, through the client adapter. Apply a general message only at the final UI boundary.
- Install error reporting in the backend for unexpected RPC failures. An encoded RPC error does not reach an outer HTTP exception handler.
- HTTP cancellation stops the fetch and interrupts the scope of the server request. It does not roll back side effects that are already committed.
- The backend owns the idempotency of mutations and the transaction boundaries.

## Verification

- Run the real HTTP transport, not only `RpcTest.makeClient`.
- Verify a successful read, a declared failure, the cancellation of a pending read, an invalid payload, the SSR hydration, and the browser mutations.
- Verify that the frontend assets contain no backend credentials and no server-only imports.
