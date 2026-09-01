import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const tuiSharedRoot = fileURLToPath(
  new URL("../tui/frontend/src/shared", import.meta.url),
);

export default defineConfig({

  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@tui/ui", replacement: `${tuiSharedRoot}/components/ui` },
      { find: "@tui/lib", replacement: `${tuiSharedRoot}/lib` },

      { find: "@/shared", replacement: `${tuiSharedRoot}` },

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

        inline: [/\/tui\/frontend\/node_modules\//],
      },
    },
  },
  server: {

    proxy: {
      "/v1": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
