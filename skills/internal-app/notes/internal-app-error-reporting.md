---
id: internal-app-error-reporting
topic: internal-app
summary: Where an internal app reports and records its errors, from the query client and the route error page to the Start server entry, the function middleware, the failure messages, and the router serializers.
keywords: [error reporting, error tracker, sentry, crash reporting, exceptions, observability, error ownership, onError, createQueryClient, recordEffectCause, unexpectedFailureMessage, function middleware, start.ts, http 200 error, serialization adapter, SearchParamError, diagnostic reference]
related: [internal-app-server-functions, kit-states, internal-app-routes]
---

# Internal App Error Reporting

The app owns the reporting of its errors. The kit gives a place for each report. The route error page is `RouteError`: run `design docs RouteError`.

## Query And Mutation Errors

- Give the error reporter of the app to `createQueryClient({ onError })` in `src/router.tsx`. The `QueryCache` and the `MutationCache` both use that callback.
- Do not report the expected failures of a workflow.
- When the server already recorded an incident with a reference, keep that reference. Do not report the incident a second time.

## Failure Messages

- `src/lib/error-presentation.ts` is an app file. It exports `unexpectedFailureMessage`.
- The `failureMessage` of the kit uses it for each unexpected action error, also for a failed theme save. Put the diagnostic references in this function, because it writes the final message.
- An expected wire error keeps its own exact message.
- Theme validation throws the schema-backed `ValidationError` of the kit. The wire-error serializer keeps that expected class, and `failureMessage` shows its exact message.

## Server Errors

- The Start server entry of the app owns the HTTP observability. Record the loader failures that the server handles there, also the failures that return an error page.
- Keep the request references through the SSR hydration.
- `src/server/runtime.server.ts` is an app file. It exports `recordEffectCause`. `runServerFn` sends each full failed cause to this recorder before the serialization.
- The starter recorder writes safe counts of the reasons to stderr. When you add HTTP observability, replace it with the recorder of the request boundary of the app.

## Function Middleware

Start can serialize a rejected server function with HTTP 200. Thus a classification by HTTP status does not see these failures.

- Configure a global function middleware in `src/start.ts`, which is an app file. It records the validation and handler exceptions before the serialization.
- Keep the original error and its request reference through the serialization adapter and the client middleware of the app.

## Router Serializers

- `routerDefaults.serializationAdapters` keeps `SearchParamError` through the SSR hydration.
- Register `config: typeof routerConfig` in the `Register` interface of the router, so that the serializer types match the runtime config.
- When the app adds its own adapters, keep these adapters. Without them, the shallow error serializer of the router loses the expected validation class and the "Reset filters" action.
