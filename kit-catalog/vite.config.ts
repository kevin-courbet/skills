import stylex from "@stylexjs/unplugin";
import viteReact from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

// The kit catalog is a single page that renders the kit components without the
// TanStack Start runtime, so that the build is a set of static files. The
// script `scripts/kit-catalog` copies this file into a scaffolded app and links
// `src/kit-catalog` to the catalog sources of the repository.
const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  // Relative asset paths let the static files work under any URL path.
  base: "./",
  plugins: [
    stylex.vite({
      useCSSLayers: true,
      dev: process.env.NODE_ENV !== "production",
      devPersistToDisk: true,
      unstable_moduleResolution: { type: "commonJS", rootDir },
      aliases: { "@/*": [`${rootDir}src/*`] },
    }),
    viteReact(),
  ],
  resolve: {
    tsconfigPaths: true,
    // The catalog sources are a symbolic link into the repository. Vite keeps
    // the path inside the app, so the `@/` alias and StyleX resolve them.
    preserveSymlinks: true,
  },
  build: { outDir: "dist-kit-catalog", emptyOutDir: true },
  server: { port: 4600 },
});
