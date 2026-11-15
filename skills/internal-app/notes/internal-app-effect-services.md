---
id: internal-app-effect-services
topic: internal-app
summary: The Effect 4 API names for server services, layers, the one ManagedRuntime, config, workflows, internal and wire errors, and Effect Schema.
keywords: [effect, effect 4, Context.Service, service class, dependency injection, layer, ManagedRuntime, runtime, config, Config.Redacted, Effect.gen, Effect.fn, tagged error, Data.TaggedError, Schema.TaggedError, Effect Schema, schema api, decode]
related: [internal-app-server-functions, internal-app-error-reporting]
---

# Internal App Effect Services

The server code uses Effect 4. Use the API that the installed package exposes. Before you use a name that this note does not give, verify it in `node_modules/effect/dist/*.d.ts`.

## Services

- Write a service as `class ItemsService extends Context.Service<ItemsService, Shape>()("@app/ItemsService")` with `static readonly layer = Layer.effect(ItemsService, Effect.gen(...))`.
- Never use `Context.Tag`, `Effect.Service`, or `ServiceMap`.

## Runtime

- Join the layers with `Layer.mergeAll(...)` and `Layer.provideMerge(...)` into one `AppLayer`.
- Export `export const runtime = ManagedRuntime.make(AppLayer)` from `src/server/runtime.server.ts`.
- Use one runtime for each process. Dispose it on `SIGTERM`.

## Config

- Read the config with `Config.all({ name: Config.String("APP_NAME").pipe(Config.withDefault("x")) })`.
- Give it to the app as a service through `Layer.effect(AppConfig, config)`.
- Read secrets with `Config.Redacted`.

## Workflows

- Write a workflow inline with `Effect.gen`.
- Use `Effect.fn("Service.method")` for a reusable function that the traces must name.
- Do not wrap an `Effect.gen` in a function that only returns it.

## Errors

- Internal errors are `Data.TaggedError` classes in `src/server/errors.ts`.
- Wire errors are `Schema.TaggedError` classes in `src/lib/wire-errors.ts`, joined in `WireError = Schema.Union([...])`. They serialize with their fields.
- Handle errors with `Effect.catchTag`, `Effect.catchTags`, and `Effect.mapError`.
- Before you write a custom guard, look for `Cause.isFailReason`, `Cause.isDieReason`, and `Exit.isSuccess`.

## Schema

- Build schemas with `Schema.Struct`, `Schema.Literals([...])`, `Schema.optionalKey`, and `Schema.Array`.
- Add a check with `Schema.check(Schema.isMinLength(2, { message: "..." }))`.
- Decode with `Schema.decodeUnknownResult` or `Schema.decodeUnknownEffect`.
- Get a Standard Schema with `Schema.toStandardSchemaV1(schema)`.
