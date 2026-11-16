---
id: internal-app-check-rules
topic: internal-app
summary: The stack rules that design check adds in an internal app to the kit rules, for server imports, search validation, legacy APIs, and explicit any.
keywords: [check rules, design check, stack rules, internal app rules, server-import-in-client, static-server-module-import, hand-written-search-validation, legacy-api, explicit-any, server import, dynamic import, validateSearch, Context.Tag, Effect.Service, useReactTable, inputValidator, any type]
specializes: [kit-check-rules]
related: [internal-app-stack, internal-app-server-functions, internal-app-routes, internal-app-effect-services]
---

# Internal App Check Rules

In an internal app, `design check` runs the kit rules of [[kit-check-rules]] and the stack rules of this note. Each finding gives the rule, the file, and the line. Fix the source. There are no ignore comments.

## Stack Rules

| Rule | Fails on |
|---|---|
| `server-import-in-client` | A top-level import from `@/server/` in a route, a feature, a component, or a `src/lib/` module that is not a `.server` module. Import it dynamically inside the handler of the server function. |
| `static-server-module-import` | A static import of a `.server` module outside `src/server/` and the `.server` modules. Import it dynamically inside the handler ([[internal-app-server-functions]]). |
| `hand-written-search-validation` | A `validateSearch` in a route without `Schema.toStandardSchemaV1`. Validate the search params with Effect Schema ([[internal-app-routes#search-params]]). |
| `legacy-api` | `Context.Tag`, `Effect.Service`, `ServiceMap`, `useReactTable`, or `.inputValidator(`. Use `Context.Service`, `useTable` of Table v9, and `.validator()` ([[internal-app-stack#replaced-libraries]]). |
| `explicit-any` | `: any`, `as any`, or `<any>` in `src/`. Use `unknown` with a schema or a type guard. |

A type-only import, such as `import type { AppServices } from "@/server/runtime.server"`, does not fail. It has no effect at run time.
