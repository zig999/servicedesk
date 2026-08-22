import { defineConfig, devices } from "@playwright/test";

// The a11y step (ACC-09, ACC-10) is decided over pages this project actually
// renders, at a touch viewport: a contrast ratio needs whatever actually sits
// behind the text once painted, and a touch-target size needs a layout no
// desktop-width run would ever see. webServer builds and serves the app so
// the run reads the same bundle the `build` step produced.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:4173",
    ...devices["iPhone 13"],
  },
  webServer: {
    command: "vite build && vite preview --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
