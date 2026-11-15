---
id: internal-app-stack
topic: internal-app
summary: The fixed packages of an internal app for the runtime, the framework, the styles, the UI, and the tools, the libraries that the stack replaces, and the TypeScript 7 rules.
keywords: [stack, packages, dependencies, install, which library, tanstack start, tanstack table v9, effect 4, stylex, react-aria-components, aperture, sonner, oxlint, oxfmt, typescript 7, vitest, nitro, bun, replaced libraries, forbidden library, tailwind, shadcn, zod]
related: [internal-app-project-layout, internal-app-rpc, internal-app-build-wiring, internal-app-charts]
---

# Internal App Stack

Use this stack for each internal web app that clients do not use. Do not use a different library because you know it better. The `package.json` and the `bun.lock` of the template are the source of the versions. `doctor` compares an app with them and prints the `bun add` commands for each gap.

## Runtime And Framework

| Role | Package | Notes |
|---|---|---|
| Runtime and package manager | `bun` 1.3 | Scripts run through `bun --bun`. The system Node can be too old. |
| App framework | `@tanstack/react-start` | File routes, server functions, SSR. The Vite plugin is `@tanstack/react-start/plugin/vite`. |
| Router | `@tanstack/react-router` | Effect Schema validates the search params through Standard Schema. |
| Query | `@tanstack/react-query` | One `queryOptions` factory for each read. |
| SSR query bridge | `@tanstack/react-router-ssr-query` | `setupRouterSsrQueryIntegration` in `router.tsx`. |
| Table | `@tanstack/react-table` v9 | `useTable({ features: tableFeatures({...}) })`. Not the v8 `useReactTable`. |
| Form | `@tanstack/react-form` | The validators accept Standard Schema objects. |
| Virtualizer | `@tanstack/react-virtual` | Lists of more than about 200 rows. The kit `DataTable` (`virtualize`) and `LogViewer` use it. Pages almost never call it. |
| Server runtime | `effect` 4 | `Context.Service`, `Layer`, `ManagedRuntime`, `Schema`, `Config`. |
| Server bundle | `nitro` 3 beta | `nitro({ preset: "bun" })` from `nitro/vite`. Start with `bun .output/server/index.mjs`. |
| React | `react`, `react-dom` 19 | |

## Styles And UI

| Role | Package | Notes |
|---|---|---|
| Styles | `@stylexjs/stylex` | The only styling API. The tokens are in `src/styles/*.stylex.ts`. |
| StyleX compiler | `@stylexjs/unplugin` | `stylex.vite(...)` before the React plugin. |
| Accessible primitives | `react-aria-components` | The base of each interactive control. Aperture uses the same package. |
| Dates | `@internationalized/date` | Only inside the kit `DatePicker`. App code gives ISO date strings. |
| Icons | `lucide-react` | The only icon set. |
| Charts and widgets | `@kevin-courbet/aperture` | Bridged to the app tokens. Run `design read internal-app-charts`. |
| Toasts | `sonner` | `AppShell` mounts it once, with no style of its own and classes from StyleX. |
| Fonts | `@fontsource-variable/geist`, `@fontsource-variable/geist-mono` | `src/styles/app.css` imports them. |

## Tools

| Role | Package | Notes |
|---|---|---|
| Lint | `oxlint` | `.oxlintrc.json`. `no-explicit-any`, `no-nested-ternary`, `no-console`, and `no-barrel-file` are errors. `react/incompatible-library` is off, because the build does not use the React Compiler. `jsx-a11y/no-autofocus` ignores react-aria components, which manage the focus in dialogs. |
| Format | `oxfmt` | `.oxfmtrc.json`. Width 100, double quotes, trailing commas. |
| Types | Go-native `typescript` 7 | `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`. |
| Tests | `vitest` 5 | Effect tests use explicit layers and `Effect.runPromise`. |

## Replaced Libraries

`check` and `doctor` fail when an app installs or imports one of these libraries. `assets/kit.json` has the full list.

| Replaced | Use instead |
|---|---|
| Tailwind, `clsx`, `tailwind-merge`, `tailwind-variants`, `class-variance-authority` | StyleX `create` and `props`, variant maps |
| shadcn/ui, IntentUI, Radix, Base UI, cmdk | Kit primitives on react-aria-components |
| react-hook-form, `@hookform/*`, zod, valibot | TanStack Form with Effect Schema |
| `@visx/*`, recharts | Aperture |
| heroicons, phosphor, react-icons | lucide-react |
| `motion`, framer-motion | StyleX keyframes with reduced-motion overrides |
| react-virtuoso | `@tanstack/react-virtual` |

## Server Functions Or RPC

- Use Effect RPC for a backend that you deploy separately, or for a contract that more than one client shares.
- Use server functions with `runServerFn` for a feature that one Start process owns.
- RPC is not always faster or simpler. It adds a contract, a transport, and the ownership of a runtime.
- [[internal-app-server-functions#choose-the-boundary]] gives the rule, and [[internal-app-rpc]] gives the verified Effect 4 pattern.

## TypeScript 7

- TypeScript 7 is the CLI type checker. It is not a dependency for the JavaScript compiler API.
- Remove `baseUrl`, and use explicit relative `paths`. The kit builds and type checks with TypeScript 7.0.2 after the removal of `baseUrl`.
- Keep `verbatimModuleSyntax` off.
- When a tool imports the JavaScript API of TypeScript, declare `typescript-js` as an npm alias to TypeScript 5. Configure that tool explicitly.
- Do not replace the CLI compiler with the JavaScript alias. After a change to the tools, verify the build and the CLI type check.
