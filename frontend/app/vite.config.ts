import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// TUI's shared catalog and lib helpers are vendored, read-only source at
// frontend/tui -- a sibling of this target root (frontend/app). These
// aliases are what makes `@tui/ui/*` and `@tui/lib/*` resolve for both the
// dev server/bundler (here) and the type checker (tsconfig.json's `paths`,
// which must name the same targets).
const tuiSharedRoot = fileURLToPath(
  new URL("../tui/frontend/src/shared", import.meta.url),
);

export default defineConfig({
  // @tailwindcss/vite is what actually compiles TUI's theme.css: the plugin
  // intercepts the CSS pipeline for a stylesheet that opens with
  // `@import "tailwindcss";` (a CSS-first Tailwind v4 entry point processed
  // by this plugin's own transform, not resolved as a module specifier), so
  // no `resolve.alias` entry is needed for the bare `tailwindcss` import
  // once this plugin is registered -- mirroring frontend/tui/frontend's own
  // vite.config.ts, which wires react() and tailwindcss() the same way.
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@tui/ui", replacement: `${tuiSharedRoot}/components/ui` },
      { find: "@tui/lib", replacement: `${tuiSharedRoot}/lib` },
      // TUI's own components (e.g. divider.tsx, kbd.tsx) import a `cn()`
      // helper through TUI's own internal `@/shared/lib/cn` alias (see
      // frontend/tui/frontend/vite.config.ts and tsconfig.app.json, which
      // resolve `@` to their own src/). That vendored source cannot be
      // edited, so the exact specifier it uses is aliased here too -- narrowly,
      // rather than claiming the bare `@` prefix this app's own future source
      // may want for its own src/ convention.
      { find: "@/shared/lib/cn", replacement: `${tuiSharedRoot}/lib/cn` },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.spec.{ts,tsx}"],
  },
});
