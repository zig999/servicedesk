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
      // TUI's own components (e.g. divider.tsx, kbd.tsx, banner.tsx) import
      // each other through TUI's own internal `@/shared/...` alias (see
      // frontend/tui/frontend/vite.config.ts and tsconfig.app.json, which
      // resolve `@` to their own src/). That vendored source cannot be
      // edited, so the whole `@/shared/...` family it uses internally is
      // aliased here too -- covering cn(), Panel and any other cross-reference
      // TUI's components make among themselves, present or future -- rather
      // than claiming the bare `@` prefix this app's own future source may
      // want for its own src/ convention.
      { find: "@/shared", replacement: `${tuiSharedRoot}` },
      // Because @tui/ui/* and @/shared resolve straight into TUI's own
      // source tree (a sibling package with its own node_modules, not a
      // built/bundled dependency of this app), a bare third-party import
      // inside that source -- e.g. a TUI component pulling in
      // @radix-ui/react-tooltip or @radix-ui/react-dialog -- resolves via
      // ordinary Node module resolution starting from that file's own
      // directory, which finds frontend/tui/frontend/node_modules first.
      // Any such package that itself imports "react" then loads TUI's own
      // separately-installed React copy rather than this app's, and
      // React's hooks break across two live copies in one render tree with
      // "Cannot read properties of null (reading 'useRef')" the moment a
      // component from the duplicated copy renders -- first hit by
      // task/manifest-hypothesis-authoring/manifest-builder's own use of
      // TUI's Tooltip/Dialog (the first components in this app whose own
      // dependencies reach for React internally; Select/Input/Checkbox do
      // not). `resolve.dedupe` is Vite's own documented mechanism for
      // exactly this monorepo shape, but it does not reach Vitest's own
      // SSR-style module loading (confirmed: the crash persisted under
      // `dedupe` alone, vite's own node_modules/.vite cache cleared). The
      // explicit aliases below force every resolution of these two
      // packages -- and their subpaths, e.g. react-dom/client,
      // react/jsx-runtime -- to this app's own installed copies, the same
      // forceful mechanism the @tui/ui/@/shared aliases above already use
      // rather than a hint the resolver is free to skip.
      {
        find: /^react-dom$/,
        replacement: fileURLToPath(new URL("./node_modules/react-dom", import.meta.url)),
      },
      {
        find: /^react-dom\//,
        replacement: `${fileURLToPath(new URL("./node_modules/react-dom/", import.meta.url))}`,
      },
      {
        find: /^react$/,
        replacement: fileURLToPath(new URL("./node_modules/react", import.meta.url)),
      },
      {
        find: /^react\//,
        replacement: `${fileURLToPath(new URL("./node_modules/react/", import.meta.url))}`,
      },
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.spec.{ts,tsx}"],
    server: {
      deps: {
        // Vitest treats a node_modules package as an external SSR dependency
        // by default, loading it via plain Node resolution and bypassing
        // Vite's own resolver -- and with it, the react/react-dom aliases
        // above -- entirely. Every package this pattern matches resolves
        // from frontend/tui/frontend/node_modules (TUI's own
        // separately-installed copy, reached through the @tui/ui alias):
        // not just @radix-ui/* itself, but its own transitive dependencies
        // (@floating-ui/react-dom, react-remove-scroll, aria-hidden, and
        // whatever else a given primitive pulls in) -- any one of which
        // resolves its own "react"/"react-dom" import to that copy instead
        // of this app's if left external, which is the actual cause of the
        // two-React-copies "Cannot read properties of null" crash the
        // react/react-dom aliases alone do not reach. Matching the path
        // rather than enumerating package names is what makes this hold for
        // Radix's whole dependency chain, present or future, rather than
        // the one or two packages that happened to be named when this was
        // written.
        inline: [/\/tui\/frontend\/node_modules\//],
      },
    },
  },
  server: {
    // Forwards any request path starting with /v1 to the real backend at
    // localhost:3000 during development. The backend sends no
    // Access-Control-Allow-Origin header, so a browser-side apiFetch() call
    // from this dev server (localhost:5173) would otherwise be blocked by
    // CORS regardless of which screen makes it -- proxying keeps the
    // request same-origin from the browser's point of view. A production
    // CORS change on the backend is out of scope; this affects only the
    // dev server.
    proxy: {
      "/v1": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
