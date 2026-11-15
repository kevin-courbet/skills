---
id: internal-app-build-wiring
topic: internal-app
summary: The vite.config.ts of an internal app with the StyleX, TanStack Start, Nitro, and React plugins, and the rules for the plugin order, the aliases, the global CSS, the dev stylesheet, and the Aperture cascade layer.
keywords: [build wiring, vite config, vite.config.ts, StyleX plugin, stylex unplugin, plugin order, Fast Refresh, aliases, tsconfig paths, app.css, global CSS, CSS injection, cssInjectionTarget, virtual stylex css, cascade layer, Aperture layer, nitro bun preset]
related: [internal-app-stack, internal-app-stylex, internal-app-project-layout, internal-app-charts]
---

# Internal App Build Wiring

The template has this wiring. An app that moves to the kit must have the same wiring. `doctor` reports a gap in it.

## The Vite Config

`vite.config.ts`, verified with Vite 8, TanStack Start 1.168, and StyleX 0.19:

```ts
import stylex from "@stylexjs/unplugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    stylex.vite({
      useCSSLayers: true,
      dev: process.env.NODE_ENV !== "production",
      devPersistToDisk: true,
      unstable_moduleResolution: { type: "commonJS", rootDir },
      aliases: { "@/*": [`${rootDir}src/*`] },
    }),
    tanstackStart({ srcDirectory: "src" }),
    nitro({ preset: "bun" }),
    viteReact(),
  ],
  resolve: { tsconfigPaths: true },
});
```

- Put the StyleX plugin before the React plugin. If you do not, Fast Refresh breaks.
- Make `aliases` the same as the paths of `tsconfig.json`. If you do not, the compiler cannot resolve an import of `@/styles/tokens.stylex`.

## The Global CSS

- The kit `AppDocument` (`src/components/shell/app-document.tsx`) imports `@/styles/app.css` as a side-effect import. TanStack attaches that CSS to the root route. In production, the StyleX plugin adds its output to the first CSS asset. Thus do not set `cssInjectionTarget`, and do not import `app.css` with `?url`.
- In development, the server serves the stylesheet from `/virtual:stylex.css`. `AppDocument` links it and loads `virtual:stylex:runtime` for hot reload.
- `__root.tsx` renders `<AppDocument theme={theme}>`. It does not render `<html>`, `<head>`, or `<body>` itself.

## The Aperture Layer

Aperture puts each of its rules in the `aperture` cascade layer. `src/styles/app.css` imports Aperture first, so the layer comes before the reset layer and the StyleX layers. Thus a StyleX host style overrides an Aperture default without a specificity trick. Run `design read internal-app-charts#wiring` for the rest of the chart wiring.
