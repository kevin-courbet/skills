import stylex from "@stylexjs/unplugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    // StyleX must run before the React plugin so Fast Refresh keeps working.
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
  server: { port: 3000 },
});
