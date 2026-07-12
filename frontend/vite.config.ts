import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

// Match the official Vercel TanStack Start example:
// https://github.com/vercel/vercel/tree/main/examples/tanstack-start
//
// Important: do NOT commit a root index.html. If present, Nitro treats it as a
// static SPA shell and never calls TanStack SSR (blank white page on Vercel).
export default defineConfig({
  resolve: {
    alias: {
      "@": `${process.cwd()}/src`,
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    // Pin vercel so CI/local prebuilt deploys use Build Output API.
    nitro({ preset: "vercel" }),
    viteReact(),
  ],
});
